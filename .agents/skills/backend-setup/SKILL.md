---
name: backend-setup
description: >-
  Complete guide for setting up the Contrib Compass Express backend (Dev A role).
  Covers GitHub OAuth flow, Supabase schema, issue ingestion with Octokit,
  multi-repo support, rate limiting, caching, and Render deployment.
  Use when implementing or debugging any backend route, DB operation, or auth flow.
---

# Dev A: Backend / Data / Auth — Contrib Compass

## Stack
- **Runtime**: Node.js 18+ / Express 4
- **Database**: Supabase (Postgres) via `@supabase/supabase-js`
- **GitHub API**: `@octokit/rest` with authenticated user token
- **Auth**: Manual GitHub OAuth code exchange → JWT (`jsonwebtoken`)
- **Caching**: `node-cache` (in-memory, 60s TTL)
- **Logging**: `winston` (pretty dev, JSON prod)
- **Deployment**: Render (free tier, `render.yaml`)

## File Structure
All code lives inside `server/` at the repo root — never touch frontend files.
```
server/
├── src/
│   ├── index.js              ← Express app entry point
│   ├── config/
│   │   ├── supabase.js       ← createClient singleton
│   │   └── logger.js         ← winston instance
│   ├── middleware/
│   │   ├── auth.js           ← JWT verify middleware
│   │   ├── errorHandler.js   ← global error handler → { error: { message, code } }
│   │   └── requestLogger.js  ← method/path/status/duration
│   ├── routes/
│   │   ├── auth.js           ← POST /api/auth/github
│   │   ├── repos.js          ← GET /api/repos, POST /api/repos/connect
│   │   ├── issues.js         ← GET /api/issues, POST /api/issues/:id/correct-label
│   │   └── match.js          ← POST /api/match
│   └── services/
│       ├── github.js         ← Octokit helpers + retry/backoff
│       └── cache.js          ← node-cache instance + helpers
├── migrations/
│   └── 001_initial_schema.sql
├── scripts/
│   └── seed.js               ← pre-demo data loader
├── tests/
│   └── integration.test.js
├── .env.example
├── package.json
├── Dockerfile
└── render.yaml
```

## Phase 0: Express App Entry Point (src/index.js)

```js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { requestLogger } = require("./middleware/requestLogger");
const { errorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth");
const repoRoutes = require("./routes/repos");
const issueRoutes = require("./routes/issues");
const matchRoutes = require("./routes/match");

const app = express();

app.use(cors({
  origin: (process.env.FRONTEND_ORIGIN || "http://localhost:3000").split(","),
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));
app.use(express.json());
app.use(requestLogger);

app.use("/api/auth", authRoutes);
app.use("/api/repos", repoRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/match", matchRoutes);

app.get("/health", (req, res) => res.json({ status: "ok", ts: Date.now() }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Contrib Compass API running on port ${PORT}`));
```

## Phase 1: GitHub OAuth (routes/auth.js)

Manual code exchange — no Passport needed, simpler for hackathon:

```js
const express = require("express");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const supabase = require("../config/supabase");
const router = express.Router();

// POST /api/auth/github
// Body: { code: string }  ← GitHub OAuth callback code from frontend
// Response: { sessionToken, user }
router.post("/github", async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: { message: "Missing OAuth code", code: "MISSING_CODE" } });

    // 1. Exchange code for GitHub access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error_description || "GitHub OAuth failed");

    const accessToken = tokenData.access_token;

    // 2. Fetch GitHub user profile
    const profileRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    });
    const ghUser = await profileRes.json();

    // 3. Upsert user in Supabase
    const { data: user, error } = await supabase
      .from("users")
      .upsert({
        github_id: ghUser.id,
        username: ghUser.login,
        name: ghUser.name,
        avatar_url: ghUser.avatar_url,
        email: ghUser.email,
        bio: ghUser.bio,
        public_repos: ghUser.public_repos,
        followers: ghUser.followers,
        access_token: accessToken,
        updated_at: new Date().toISOString(),
      }, { onConflict: "github_id" })
      .select()
      .single();

    if (error) throw error;

    // 4. Issue JWT
    const sessionToken = jwt.sign(
      { userId: user.id, githubId: user.github_id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      sessionToken,
      user: {
        id: user.id,
        login: user.username,
        name: user.name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        public_repos: user.public_repos,
        followers: user.followers,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

## Phase 1: Auth Middleware (middleware/auth.js)

```js
const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: { message: "Missing session token", code: "UNAUTHORIZED" } });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: { message: "Invalid or expired token", code: "UNAUTHORIZED" } });
  }
}

module.exports = { requireAuth };
```

## Phase 1: Repo Connect + Issue Ingestion (routes/repos.js)

```js
const express = require("express");
const { Octokit } = require("@octokit/rest");
const supabase = require("../config/supabase");
const { requireAuth } = require("../middleware/auth");
const { cache, invalidatePrefix } = require("../services/cache");
const logger = require("../config/logger");
const router = express.Router();

// Retry helper with exponential backoff
async function withRetry(fn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRateLimit = err.status === 403 || err.status === 429;
      const isServerError = err.status >= 500;
      if ((isRateLimit || isServerError) && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        logger.warn(`GitHub API error ${err.status}, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

// GET /api/repos
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const cacheKey = `repos:${req.user.userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const { data, error } = await supabase
      .from("repos")
      .select("*")
      .eq("connected_by_user_id", req.user.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const result = data.map((r) => ({
      id: r.id, url: `https://github.com/${r.full_name}`, name: r.full_name,
      description: r.description, stars: r.stars,
      issuesIngested: r.issues_ingested || 0,
      connectedAt: r.created_at,
    }));
    cache.set(cacheKey, result, 60);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/repos/connect
router.post("/connect", requireAuth, async (req, res, next) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ error: { message: "Missing repoUrl", code: "BAD_REQUEST" } });

    // Parse owner/name from URL
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return res.status(400).json({ error: { message: "Invalid GitHub URL", code: "BAD_REQUEST" } });
    const [, owner, name] = match;

    // Fetch GitHub token for authenticated user
    const { data: userRow, error: userErr } = await supabase
      .from("users").select("access_token").eq("id", req.user.userId).single();
    if (userErr) throw userErr;

    const octokit = new Octokit({ auth: userRow.access_token });

    // Fetch repo metadata
    const repoData = await withRetry(() => octokit.repos.get({ owner, repo: name }));

    // Check rate limit
    const rateLimitRes = await octokit.rateLimit.get();
    const remaining = rateLimitRes.data.rate.remaining;
    if (remaining < 10) {
      const resetAt = rateLimitRes.data.rate.reset;
      return res.status(429).json({ error: { message: "GitHub rate limit nearly exhausted", code: "RATE_LIMITED" }, retryAfter: resetAt });
    }

    // Upsert repo
    const { data: repo, error: repoErr } = await supabase
      .from("repos")
      .upsert({
        github_repo_id: repoData.data.id,
        owner, name: repoData.data.name,
        full_name: repoData.data.full_name,
        description: repoData.data.description,
        url: repoData.data.html_url,
        stars: repoData.data.stargazers_count,
        connected_by_user_id: req.user.userId,
        last_ingested_at: new Date().toISOString(),
      }, { onConflict: "github_repo_id" })
      .select().single();
    if (repoErr) throw repoErr;

    // Paginate and fetch all open issues (exclude PRs)
    const allIssues = [];
    for await (const response of octokit.paginate.iterator(octokit.issues.listForRepo, {
      owner, repo: name, state: "open", per_page: 100,
    })) {
      for (const issue of response.data) {
        if (!issue.pull_request) allIssues.push(issue);
      }
    }

    // Upsert issues
    if (allIssues.length > 0) {
      const issueRows = allIssues.map((iss) => ({
        repo_id: repo.id,
        github_issue_id: iss.id,
        number: iss.number,
        title: iss.title,
        body: iss.body || "",
        url: iss.html_url,
        state: iss.state,
        comments_count: iss.comments,
        updated_at: new Date().toISOString(),
      }));
      const { error: issErr } = await supabase
        .from("issues")
        .upsert(issueRows, { onConflict: "repo_id,github_issue_id" });
      if (issErr) throw issErr;
    }

    invalidatePrefix(`repos:${req.user.userId}`);
    invalidatePrefix(`issues:`);

    res.json({
      repoId: repo.id,
      issuesIngested: allIssues.length,
      repo: {
        id: repo.id, url: repo.url, name: repo.full_name,
        description: repo.description, stars: repo.stars,
        connectedAt: repo.created_at,
      },
    });
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: { message: "Repository not found or private", code: "NOT_FOUND" } });
    if (err.status === 403) return res.status(403).json({ error: { message: "No access to this repository", code: "FORBIDDEN" } });
    next(err);
  }
});

module.exports = router;
```

## Phase 1: Issues Route (routes/issues.js)

```js
const express = require("express");
const supabase = require("../config/supabase");
const { requireAuth } = require("../middleware/auth");
const { cache, invalidatePrefix } = require("../services/cache");
const router = express.Router();

// GET /api/issues?repo=<id> or ?repo=<id1>,<id2>
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const repoParam = req.query.repo;
    const repoIds = repoParam ? repoParam.split(",").map((s) => s.trim()).filter(Boolean) : [];

    const cacheKey = `issues:${repoIds.sort().join(",")}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    let query = supabase
      .from("issues")
      .select("*, repos(full_name), issue_labels(*)")
      .eq("state", "open")
      .order("created_at", { ascending: false })
      .limit(100);

    if (repoIds.length > 0) query = query.in("repo_id", repoIds);

    const { data, error } = await query;
    if (error) throw error;

    const result = data.map((iss) => ({
      id: iss.id,
      repoId: iss.repo_id,
      repoName: iss.repos?.full_name || "",
      number: iss.number,
      title: iss.title,
      body: iss.body,
      url: iss.url,
      labels: iss.issue_labels
        ? {
            difficulty: iss.issue_labels.difficulty,
            skillArea: iss.issue_labels.skill_area,
            effort: iss.issue_labels.effort,
            confidence: iss.issue_labels.confidence,
          }
        : null,
      commentsCount: iss.comments_count,
      createdAt: iss.created_at,
    }));

    cache.set(cacheKey, result, 60);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/issues/:id/correct-label
router.post("/:id/correct-label", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { difficulty, skillArea, effort } = req.body;

    // Read old labels for audit log
    const { data: old } = await supabase.from("issue_labels").select("*").eq("issue_id", id).single();

    // Upsert new labels
    const { data: updated, error } = await supabase
      .from("issue_labels")
      .upsert({ issue_id: id, difficulty, skill_area: skillArea, effort, updated_at: new Date().toISOString() }, { onConflict: "issue_id" })
      .select().single();
    if (error) throw error;

    // Log corrections to label_corrections table
    const corrections = [];
    if (difficulty && old?.difficulty !== difficulty)
      corrections.push({ issue_id: id, field: "difficulty", old_value: old?.difficulty, new_value: difficulty, corrected_by: req.user.userId });
    if (skillArea && old?.skill_area !== skillArea)
      corrections.push({ issue_id: id, field: "skill_area", old_value: old?.skill_area, new_value: skillArea, corrected_by: req.user.userId });
    if (effort && old?.effort !== effort)
      corrections.push({ issue_id: id, field: "effort", old_value: old?.effort, new_value: effort, corrected_by: req.user.userId });

    if (corrections.length > 0) await supabase.from("label_corrections").insert(corrections);

    invalidatePrefix(`issues:`);

    res.json({ success: true, updatedIssue: { id, labels: { difficulty, skillArea, effort } } });
  } catch (err) { next(err); }
});

// POST /api/issues/:id/reclassify — stub for Dev B to fill
router.post("/:id/reclassify", requireAuth, async (req, res, next) => {
  try {
    // Dev B: call classifyAndEmbedIssue(issue) here and write result to issue_labels
    res.json({ success: true, message: "Reclassification stub — Dev B implements classify logic" });
  } catch (err) { next(err); }
});

module.exports = router;
```

## Phase 3: Match Route (routes/match.js)

```js
const express = require("express");
const supabase = require("../config/supabase");
const { requireAuth } = require("../middleware/auth");
// Dev B provides this module:
// const { matchContributorToIssues } = require("../ai/matcher");
const router = express.Router();

// POST /api/match
// Body: { skills: string[], githubProfile?: string }
// Response: [{ score, matchReason, issue }] top-5 sorted desc
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { skills = [], githubProfile } = req.body;

    // Fetch all open issues with labels + embeddings
    const { data: issues, error } = await supabase
      .from("issues")
      .select("*, repos(full_name), issue_labels(*)")
      .eq("state", "open")
      .not("issue_labels", "is", null);
    if (error) throw error;

    const contributor = { skills, githubProfile };

    let matches;
    try {
      // Dev B's implementation — will be available when matcher.js is written
      const { matchContributorToIssues } = require("../ai/matcher");
      matches = await matchContributorToIssues(contributor, issues);
    } catch (e) {
      // Fallback stub: random-score ranking until Dev B's module is ready
      matches = issues
        .slice(0, 10)
        .map((iss) => ({ issue: iss, score: Math.floor(Math.random() * 40) + 55, matchReason: "Skill overlap detected" }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    }

    // Normalize to API contract shape
    const result = matches.slice(0, 5).map((m) => ({
      score: Math.round(Math.min(100, Math.max(0, m.score))),
      matchReason: m.matchReason || "Skill and difficulty match",
      issue: {
        id: m.issue.id,
        repoId: m.issue.repo_id,
        repoName: m.issue.repos?.full_name || "",
        number: m.issue.number,
        title: m.issue.title,
        body: m.issue.body,
        url: m.issue.url,
        labels: m.issue.issue_labels ? {
          difficulty: m.issue.issue_labels.difficulty,
          skillArea: m.issue.issue_labels.skill_area,
          effort: m.issue.issue_labels.effort,
          confidence: m.issue.issue_labels.confidence,
        } : null,
        commentsCount: m.issue.comments_count,
        createdAt: m.issue.created_at,
      },
    }));

    res.json(result);
  } catch (err) { next(err); }
});

module.exports = router;
```

## Phase 2: Error Handler & Request Logger

```js
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";
  const code = err.code || (status === 500 ? "INTERNAL_ERROR" : "ERROR");
  console.error(`[ERROR] ${status} ${message}`, err.stack || "");
  res.status(status).json({ error: { message, code } });
}
module.exports = { errorHandler };

// middleware/requestLogger.js
const logger = require("../config/logger");
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
}
module.exports = { requestLogger };
```

## Phase 5: Cache Service (services/cache.js)

```js
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

function invalidatePrefix(prefix) {
  const keys = cache.keys().filter((k) => k.startsWith(prefix));
  if (keys.length > 0) cache.del(keys);
}

module.exports = { cache, invalidatePrefix };
```

## Phase 4: Render Deployment (render.yaml)

```yaml
services:
  - type: web
    name: contrib-compass-api
    env: node
    rootDir: server
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        sync: false
      - key: GITHUB_CLIENT_ID
        sync: false
      - key: GITHUB_CLIENT_SECRET
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_KEY
        sync: false
      - key: GROQ_API_KEY
        sync: false
      - key: FRONTEND_ORIGIN
        value: https://contrib-compass.vercel.app
```

## Key Rules for Dev A

1. **Never modify root-level files** — all work stays inside `server/`
2. **API contract shapes are frozen after Phase 1** — coordinate with Dev C before any changes
3. **All errors return** `{ error: { message, code } }` — no plain strings, no crashes
4. **labels: null is valid** — frontend handles it with "Classifying..." badge
5. **Score must be 0–100 integer** — not 0.0–1.0 float (GSAP bar fill uses this directly)
6. **Set CORS to allow** `http://localhost:3000` in dev and `FRONTEND_ORIGIN` in prod

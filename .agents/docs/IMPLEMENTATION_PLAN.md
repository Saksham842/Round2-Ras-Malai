# Contrib Compass — Implementation Plan

> Source of truth for architecture decisions and build order.  
> No time estimates. No people. Only what needs to be built and how.

---

## Finalized Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Database** | SQLite (`better-sqlite3`) | Zero external service, offline, instant setup. DB layer abstracted so Supabase can be swapped via env var. |
| **Authentication** | Demo/mock login only | Frontend already supports demo mode. Real OAuth stubbed for future. |
| **LLM Classification** | Rule-based heuristic classifier | No Groq key available. Classifier uses keyword + complexity heuristics to output the same `{ difficulty, skillArea, effort, confidence }` shape as Groq. Groq can be swapped in by setting `GROQ_API_KEY` env var. |
| **Embeddings** | `@xenova/transformers` `all-MiniLM-L6-v2` | Local ONNX, no API cost, 384-dim unit vectors. In-memory `Map` cache (no pgvector needed). |
| **GitHub API** | Unauthenticated Octokit | 60 req/hr limit, sufficient for demo seed. PAT can be set via `GITHUB_PAT` env var for 5000/hr. |
| **Caching** | `node-cache` in-memory | 60s TTL for issues/repos, 30s for match results. |
| **Branch** | `dev-backend` | All backend work committed here. No push — only `git add` + `git commit`. |
| **Deployment** | Render (backend) + Vercel (frontend) | `render.yaml` and `Dockerfile` included but deploy is manual step. |

---

## Repository State

### Frontend — Complete ✅

| File | What It Does |
|---|---|
| `app/layout.jsx` | Root shell — Navbar, Footer, ambient glow orbs |
| `app/globals.css` | Inter + JetBrains Mono, cyber-grid, glassmorphism, custom scrollbar |
| `app/page.jsx` | Landing hero with 3D WebGL compass, Bento grid, feature cards, CTA |
| `app/login/page.jsx` | GitHub OAuth redirect + Demo mode fallback |
| `app/connect/page.jsx` | Repo URL form, preset pills, multi-select repo grid, localStorage |
| `app/match/page.jsx` | Skill input, GSAP visualizer, auto-triggers match on load |
| `app/dashboard/page.jsx` | Issue feed with repo/difficulty filters, search, label correction |
| `app/maintainer/page.jsx` | Triage workbench, inline label editing, feedback toast |
| `components/CompassCanvas3D.jsx` | Three.js scene, mouse parallax, particles, WebGL cleanup |
| `components/GSAPMatchVisualizer.jsx` | GSAP timeline, score counter, SVG laser beams, confetti on 90+ |
| `components/IssueCard.jsx` | Difficulty badges, inline editing, maintainer save UI |
| `components/Navbar.jsx` | Sticky nav, mock mode toggle, logout |
| `components/Footer.jsx` | Status indicator |
| `lib/api.js` | API client — live with automatic mock fallback on any failure |
| `lib/mockData.js` | Full mock dataset matching API contract shapes |
| `lib/utils.js` | `cn()` class merger, `truncate()` |

### Known Frontend Bugs to Fix

1. **Effort field mismatch**: Mock data uses `"4-6 hrs"` but API contract requires `"4-8 hrs"`. Fix in `lib/mockData.js`.
2. **Mobile Navbar**: Nav links are `hidden md:flex` — no hamburger menu on mobile. Add drawer.
3. **`IssueCard` score display**: No score/matchReason prop mode for use in the match page flow (currently only maintainer-facing). Add optional `showScore` + `matchReason` props.

### Backend — Does Not Exist ❌

The entire `server/` directory must be created from scratch.

---

## Build Order

---

### Phase 0: Server Scaffold

**What gets built**: Running Express server that responds to `/health`, enforces CORS, logs requests, and handles errors in the standard JSON shape.

**File structure to create**:
```
server/
├── src/
│   ├── index.js
│   ├── config/
│   │   ├── db.js          ← SQLite singleton (better-sqlite3)
│   │   └── logger.js      ← winston: pretty in dev, JSON in prod
│   ├── middleware/
│   │   ├── auth.js        ← JWT verify → req.user
│   │   ├── errorHandler.js ← All errors → { error: { message, code } }
│   │   └── requestLogger.js ← method/path/status/duration
│   └── routes/            ← empty, added in later phases
├── data/                  ← SQLite DB file lives here (gitignored)
├── scripts/
│   └── seed.js            ← added in Phase 6
├── tests/                 ← added in Phase 7
├── package.json
├── .env.example
├── Dockerfile
└── render.yaml
```

**`server/package.json` exact dependencies**:
```json
{
  "name": "contrib-compass-api",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest --forceExit"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "jsonwebtoken": "^9.0.2",
    "node-fetch": "^2.7.0",
    "better-sqlite3": "^9.4.3",
    "@octokit/rest": "^20.0.2",
    "@octokit/plugin-throttling": "^8.1.3",
    "@octokit/plugin-retry": "^6.0.1",
    "groq-sdk": "^0.5.0",
    "@xenova/transformers": "^2.17.2",
    "node-cache": "^5.1.2",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.4"
  }
}
```

**`server/.env.example`**:
```
PORT=5000
NODE_ENV=development
JWT_SECRET=change_me_to_a_32_char_random_string

# Optional — set to activate Groq LLM classification (falls back to rule-based if absent)
GROQ_API_KEY=

# Optional — set for 5000 req/hr GitHub rate limit (defaults to 60/hr unauthenticated)
GITHUB_PAT=

# Optional — set for real GitHub OAuth (demo mode works without these)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Optional — set to swap SQLite for Supabase Postgres
SUPABASE_URL=
SUPABASE_KEY=

# Set in production for CORS whitelist
FRONTEND_ORIGIN=http://localhost:3000
```

**CORS config** — allow all of these:
- `http://localhost:3000`
- Any `*.vercel.app` origin
- `process.env.FRONTEND_ORIGIN`

**Verification gate**: `curl http://localhost:5000/health` returns `{ "status": "ok", "ts": <ms> }`.

---

### Phase 1: SQLite Schema + Auth Route

**Architecture**: SQLite file at `server/data/compass.db`. Schema created on first startup via `db.js` using `CREATE TABLE IF NOT EXISTS`. No migrations needed.

**Schema**:
```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                -- UUID
  github_id INTEGER UNIQUE NOT NULL,
  username TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  access_token TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS repos (
  id TEXT PRIMARY KEY,
  github_repo_id INTEGER UNIQUE,
  owner TEXT,
  name TEXT,
  full_name TEXT,
  description TEXT,
  url TEXT,
  stars INTEGER DEFAULT 0,
  connected_by_user_id TEXT REFERENCES users(id),
  last_ingested_at TEXT
);

CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY,
  repo_id TEXT REFERENCES repos(id) ON DELETE CASCADE,
  github_issue_id INTEGER,
  number INTEGER,
  title TEXT NOT NULL,
  body TEXT,
  url TEXT,
  state TEXT DEFAULT 'open',
  comments_count INTEGER DEFAULT 0,
  created_at TEXT,
  UNIQUE(repo_id, github_issue_id)
);

CREATE TABLE IF NOT EXISTS issue_labels (
  issue_id TEXT PRIMARY KEY REFERENCES issues(id) ON DELETE CASCADE,
  difficulty TEXT,
  skill_area TEXT,
  effort TEXT,
  confidence REAL DEFAULT 0.0,
  embedding_json TEXT,   -- JSON array of 384 floats stored as text
  labeled_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS label_corrections (
  id TEXT PRIMARY KEY,
  issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
  field TEXT,
  old_value TEXT,
  new_value TEXT,
  corrected_at TEXT DEFAULT (datetime('now'))
);
```

**Auth flow** (`server/src/routes/auth.js`):

`POST /api/auth/github`:
1. If `code === "demo_code"` or no real `GITHUB_CLIENT_SECRET` set → return mock user JWT immediately (demo mode).
2. Otherwise exchange code with `https://github.com/login/oauth/access_token`.
3. Fetch user from `https://api.github.com/user`.
4. Upsert into SQLite `users` table.
5. Sign JWT with `JWT_SECRET`, return `{ sessionToken, user }`.

**JWT payload shape**: `{ userId, login, name, avatar_url }`

**Verification gate**: `POST /api/auth/github` with `{ code: "demo_code" }` returns `{ sessionToken: "...", user: { id, login, name, avatar_url, skills: [] } }`.

---

### Phase 2: Repo Ingestion Routes

**Architecture**: Octokit fetches top 20 open issues per repo. Issues are sanitized (strip bot noise, templates, code dumps). Each issue is classified and embedded (Phase 3 pipeline). Results stored in SQLite.

**`server/src/services/github.js`** — Octokit factory with throttling + retry plugins. `fetchTopIssuesForRepo(owner, repo, token?)` returns max 20 sanitized open non-bot issues.

**`server/src/services/sanitizer.js`** — `cleanIssueMarkdown(body, title)` strips:
- HTML comments `<!-- -->`, template boilerplate headers, checkboxes `- [x]`
- Code blocks > 300 chars truncated to 200
- Base64 images, markdown images replaced with `[image]`
- Hard limit: 400 words max

**`server/src/services/cache.js`** — `node-cache` wrapper. Keys: `issues:<repoId>`, `repos:<userId>`, `match:<skillsHash>`. TTLs: 60s for issues/repos, 30s for matches.

**Routes**:

`POST /api/repos/connect` (auth required):
1. Validate GitHub URL format.
2. Parse `owner`/`repo` from URL.
3. Insert repo into `repos` table (or fetch existing).
4. Call `fetchTopIssuesForRepo()`.
5. For each issue: insert into `issues`, call `classifyAndEmbedIssue()`, insert into `issue_labels`.
6. Invalidate `issues:<repoId>` and `repos:<userId>` cache.
7. Return `{ repoId, issuesIngested, repo }`.

`GET /api/repos` (auth required):
- Query `repos` table for repos connected by `req.user.userId`.
- Join count of issues from `issues` table.
- Return array matching contract shape.

`GET /api/issues?repo=<id1,id2>` (auth required):
- Parse comma-separated repo IDs.
- LEFT JOIN `issue_labels` onto `issues`.
- Return array with `labels` object (null if not yet classified).

`POST /api/issues/:id/correct-label` (auth required):
- Validate body: `difficulty?`, `skillArea?`, `effort?`.
- Log to `label_corrections`.
- Update `issue_labels` row, set `confidence = 1.0`.
- Invalidate issues cache.
- Return `{ success: true, updatedIssue }`.

`POST /api/issues/:id/reclassify` (auth required):
- Re-runs `classifyAndEmbedIssue()` for the issue.
- Updates `issue_labels`.
- Invalidates cache.
- Returns `{ success: true, labels }`.

**Verification gate**: Connect `https://github.com/tailwindlabs/tailwindcss` → verify ≥ 5 issues in SQLite with labels populated.

---

### Phase 3: AI Classification Pipeline

**Architecture**: Two-layer pipeline. Layer 1 = Groq LLM (if key present). Layer 2 = rule-based heuristic (always available as fallback). Both output identical shapes. Layer 3 = `@xenova/transformers` embedding (always runs, no API needed).

**`server/src/ai/groqClient.js`**:
- Instantiates Groq SDK only if `GROQ_API_KEY` is set.
- `classifyWithGroq(title, body)` → `{ difficulty, skillArea, effort, confidence }`.
- `response_format: { type: "json_object" }`, temperature 0.1.
- Exports `isGroqAvailable()` boolean.

**`server/src/ai/ruleClassifier.js`** — Heuristic fallback when Groq is absent:
```
difficulty rules (checked in order):
  → "Easy"         if title matches: /typo|readme|doc|comment|lint|spelling|broken.?link|example/i
                   OR body.length < 200 AND comments < 5
  → "Advanced"     if title matches: /architect|refactor|migration|performance|memory.?leak|concurrent|race.?condition/i
                   OR labels include "breaking change"
  → "Intermediate" default

skillArea rules:
  → "Documentation"     if /readme|docs?|comment|changelog/i
  → "Testing"           if /test|spec|jest|coverage/i
  → "TypeScript / Types" if /typescript|\.d\.ts|type.?error|generic/i
  → "React / UI"        if /react|component|hook|render|jsx/i
  → "Node.js / Backend" if /express|node|server|api|endpoint/i
  → "CSS / Styling"     if /css|style|tailwind|sass|layout/i
  → "Performance"       if /performance|slow|memory|bundle|optimization/i
  → "Bug Fix"           default

effort rules:
  → "1-2 hrs"   if difficulty === "Easy"
  → "4-8 hrs"   if difficulty === "Intermediate"
  → "1-2 days"  if difficulty === "Advanced"

confidence: 0.75 for rule-based (vs 0.92+ for Groq)
```

**`server/src/ai/embeddings.js`**:
- Lazy singleton: `pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", { quantized: true })`.
- `embedText(text)` → `Array<float>` of length 384, L2-normalized.
- In-memory `Map` cache keyed by issue ID.
- Warm the model at server startup (`getExtractor()` called in `index.js` after listen).

**`server/src/ai/classify.js`** — Composite function (the handoff interface):
```js
async function classifyAndEmbedIssue(issue) {
  const labels = isGroqAvailable()
    ? await classifyWithGroq(issue.title, issue.body)
    : classifyWithRules(issue.title, issue.body, issue.labels);
  const embeddingText = `Issue: ${issue.title}. ${issue.body?.slice(0, 400) || ""}`;
  const embedding = await embedText(embeddingText);
  return { ...labels, embedding };
}
```

**Verification gate**: Call `classifyAndEmbedIssue({ title: "Fix typo in README", body: "Line 23 has a spelling mistake." })` → `{ difficulty: "Easy", skillArea: "Documentation", effort: "1-2 hrs", confidence: 0.75, embedding: [384 floats] }`.

---

### Phase 4: Matching Engine

**Architecture**: Hybrid retrieval — 60% semantic cosine similarity + 40% lexical Jaccard skill overlap. Scores normalized to integer 0-100. Top 5 returned sorted descending.

**`server/src/ai/matcher.js`**:

```js
// All vectors are L2-normalized so cosine == dot product
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) dot += vecA[i] * vecB[i];
  return Math.max(0, Math.min(1, dot));
}

function jaccardSkillOverlap(userSkills, issueSkillArea, issueTitle) {
  const userTokens = new Set(userSkills.map(s => s.toLowerCase().trim()));
  const issueText = `${issueSkillArea} ${issueTitle}`.toLowerCase();
  let matches = 0;
  for (const skill of userTokens) {
    if (issueText.includes(skill)) matches++;
  }
  return userTokens.size > 0 ? matches / userTokens.size : 0;
}

function buildMatchReason(userSkills, issue) {
  const matched = userSkills.filter(s =>
    `${issue.labels?.skillArea} ${issue.title}`.toLowerCase().includes(s.toLowerCase())
  );
  if (matched.length > 0) {
    return `Matches your ${matched.slice(0, 2).join(" & ")} skills — ${issue.labels?.difficulty || ""} level, ${issue.labels?.effort || ""} effort`.slice(0, 120);
  }
  return `Semantically aligned with your profile — ${issue.labels?.difficulty || ""} level issue in ${issue.labels?.skillArea || ""}`.slice(0, 120);
}

async function matchContributorToIssues(contributor, issues) {
  const skillsText = contributor.skills.join(", ");
  const contributorEmbedding = await embedText(skillsText);

  const scored = issues
    .filter(issue => issue.embedding_json)
    .map(issue => {
      const issueVec = JSON.parse(issue.embedding_json);
      const semantic = cosineSimilarity(contributorEmbedding, issueVec);
      const lexical = jaccardSkillOverlap(contributor.skills, issue.labels?.skillArea || "", issue.title);
      const score = Math.round((0.60 * semantic + 0.40 * lexical) * 100);
      const matchReason = buildMatchReason(contributor.skills, issue);
      return { score, matchReason, issue };
    });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
```

**`server/src/routes/match.js`**:
- Validate: `skills` must be non-empty array (400 if not).
- Load all `issues` + `issue_labels` from SQLite.
- Call `matchContributorToIssues()`.
- Cache result by `sha1(skills.sort().join(","))` for 30s.
- Return array with `score` (0-100 integer) and `matchReason` (≤ 120 chars).

**Score contract**: `score` must be an integer 0-100. `matchReason.length` must be ≤ 120.

**Verification gate**: `POST /api/match { skills: ["React", "TypeScript"] }` → array of ≤ 5 items, each with integer score 0-100.

---

### Phase 5: Frontend Bug Fixes

Three specific bugs to fix in the frontend before integration:

1. **Effort field**: In `lib/mockData.js`, change `"4-6 hrs"` → `"4-8 hrs"` everywhere to match the API contract.

2. **Mobile Navbar**: `components/Navbar.jsx` — add hamburger state + mobile drawer:
   - State: `const [mobileOpen, setMobileOpen] = useState(false)`
   - Import `Menu`, `X` from `lucide-react`
   - Add `<button className="md:hidden">` that toggles state
   - Conditional full-width drawer below header for mobile nav links

3. **IssueCard score mode**: Add optional props `showScore` (number) and `matchReason` (string) to `components/IssueCard.jsx`. When `showScore` is present, render a score bar + reason text below the difficulty badges.

---

### Phase 6: Seed Script

**What it does**: Populates the SQLite DB with real classified issues so the demo works on first load without a user having to manually connect repos.

**`server/scripts/seed.js`**:
1. Initialize SQLite DB (same schema as Phase 1).
2. Create a seed user in `users` table.
3. For each preset repo (`vercel/next.js`, `facebook/react`, `tailwindlabs/tailwindcss`):
   - Create repo record in `repos` table.
   - Call Octokit `listForRepo` (unauthenticated, state: open, sort: updated, per_page: 10).
   - Filter out bots and PRs via `shouldSkipIssue()`.
   - Sanitize each with `cleanIssueMarkdown()`.
   - Store in `issues` table.
   - Call `classifyAndEmbedIssue()` — uses rule-based classifier if no Groq key.
   - Store labels + embedding JSON in `issue_labels`.
4. Log: `Seeded X issues across 3 repos` when done.

**Run command**:
```bash
cd server && node scripts/seed.js
```

**Verification gate**: After seed, `GET /api/issues` returns ≥ 20 issues, all with `labels` object (not null) and non-empty `difficulty`, `skillArea`, `effort`.

---

### Phase 7: Test Suite

**Backend tests** (`server/tests/`):

| Test File | What It Covers |
|---|---|
| `health.test.js` | `GET /health` → 200 `{ status: "ok" }` |
| `auth.test.js` | Demo mode returns JWT; missing code → 400 |
| `repos.test.js` | `POST /api/repos/connect` returns `{ repoId, issuesIngested }`; `GET /api/repos` returns array |
| `issues.test.js` | Issues returned with `labels` shape; `correct-label` returns `{ success: true }` |
| `match.test.js` | Empty skills → 400; scores are integers 0-100; `matchReason` ≤ 120 chars; array sorted descending |
| `ai/classify.test.js` | Rule classifier returns correct difficulty for known test titles; embedding dimension is 384 |
| `ai/matcher.test.js` | `cosineSimilarity([1,0],[1,0])` = 1.0; `cosineSimilarity([1,0],[0,1])` = 0.0; top-5 only returned |

**All mocked**: Octokit (no real HTTP calls in tests), `@xenova/transformers` (returns deterministic 384-float array), SQLite (in-memory `:memory:` DB via `better-sqlite3`).

**Frontend tests** (root `__tests__/`):

Install: `npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom`

| Test File | What It Covers |
|---|---|
| `IssueCard.test.jsx` | Renders title/repo/difficulty; edit mode toggles; `onCorrectLabel` called on save |
| `api.test.js` | `isMockMode()` reads localStorage; mock login returns `sessionToken`; mock match returns array with `score`/`issue`/`matchReason` |

**Run**:
```bash
# Backend
cd server && npm test

# Frontend
npm test
```

---

### Phase 8: Deployment Configs

**`server/Dockerfile`**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY src ./src
RUN mkdir -p data
EXPOSE 5000
CMD ["node", "src/index.js"]
```

**`server/render.yaml`**:
```yaml
services:
  - type: web
    name: contrib-compass-api
    runtime: node
    rootDir: server
    buildCommand: npm install
    startCommand: node src/index.js
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: JWT_SECRET
        generateValue: true
      - key: FRONTEND_ORIGIN
        value: https://contrib-compass.vercel.app
```

**CORS production settings**:
- Allow: `http://localhost:3000`, `https://*.vercel.app`, `process.env.FRONTEND_ORIGIN`
- Methods: `GET, POST, PUT, DELETE, OPTIONS`
- Headers: `Content-Type, Authorization`
- `credentials: true`

**`vercel.json`** (root) — already correct, no changes needed.

---

### Phase 9: README

Replace `README.md` with:

```markdown
# Contrib Compass

AI-powered open-source contributor matching. Triages GitHub issues by difficulty,
skill area, and effort. Matches contributors to their best-fit issues via semantic
embeddings + skill overlap scoring.

## Stack
- Frontend: Next.js 14, Tailwind CSS, Three.js, GSAP 3, Framer Motion
- Backend: Node.js, Express, SQLite (better-sqlite3)
- AI: @xenova/transformers (all-MiniLM-L6-v2 embeddings) + Groq llama-3.3-70b (optional)
- Auth: GitHub OAuth (demo mode available without credentials)
- Deploy: Vercel (frontend) + Render (backend)

## Frontend Dev
npm install && npm run dev

## Backend Dev
cd server && npm install && npm run dev

## Seed Demo Data
cd server && node scripts/seed.js

## Environment
Copy server/.env.example → server/.env and set:
- JWT_SECRET (required)
- GROQ_API_KEY (optional — enables LLM classification)
- GITHUB_PAT (optional — increases GitHub rate limit to 5000/hr)
- GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET (optional — enables real OAuth)

Copy .env.example → .env.local and set:
- NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## End-to-End User Journey (QA Checklist)

Run before every demo:

```
[ ] Visit / (landing)
    ✓ 3D compass renders and tracks cursor
    ✓ Hero headline, CTA visible
    ✓ Feature cards (Auto-Triage, Smart Match, Self-Improving) visible

[ ] Click "Get Started" → /login
    ✓ Demo mode button visible
    ✓ Click Demo → redirects to /connect

[ ] /connect
    ✓ Preset quick-select buttons fill the URL field
    ✓ Click "vercel/next.js" → fill URL → click Connect Repo
    ✓ Loader → success toast with issue count
    ✓ New repo card appears in grid with teal border

[ ] Click "Smart Match Now" → /match
    ✓ Auto-triggers match on load
    ✓ GSAP: contributor card slides in from left
    ✓ GSAP: issue cards slide in from right
    ✓ GSAP: laser beams animate
    ✓ GSAP: score bars fill 0% → final score
    ✓ Confetti fires if any score ≥ 90

[ ] /dashboard
    ✓ Issues load with difficulty badges
    ✓ Repo and difficulty filters work
    ✓ Search filters by title

[ ] /maintainer
    ✓ Issues load
    ✓ Edit Labels → dropdowns appear
    ✓ Save → toast + card updates with "Maintainer Verified" badge

[ ] Mock mode toggle (Navbar)
    ✓ Toggle on → all pages work instantly offline
    ✓ Toggle off → resumes live API
```

---

## Risk Mitigations

| Risk | Mitigation |
|---|---|
| Render cold start (~50s on free tier) | Pre-warm: `curl https://contrib-compass-api.onrender.com/health` before demo |
| No Groq key | Rule-based classifier produces same output shape, confidence 0.75 vs 0.92 |
| GitHub 60 req/hr (unauthenticated) | Seed once before demo — cached in SQLite. Set `GITHUB_PAT` to lift limit. |
| Conference Wi-Fi failure | Mock mode toggle in Navbar → instant offline demo |
| `@xenova` model download on cold start | Call `getExtractor()` at server startup to pre-warm before first request |
| SQLite not persistent on Render (ephemeral disk) | Run seed script after each Render deploy, or upgrade to Supabase via env var |

# Contrib Compass — Project Architecture & Agent Rules

## Project Overview
**Contrib Compass** is an AI-powered open-source contributor matching platform built during a 24-hour hackathon. It automatically triages GitHub issues by difficulty, skill area, and effort using Groq LLM embeddings, then matches contributors to the best-fit issues.

---

## Team Structure & Branch Ownership

| Dev | Role | Branch | Stack |
|-----|------|--------|-------|
| **Dev A** | Backend / Data / Auth | `backend` (in `server/` folder) | Node/Express, Supabase (Postgres), GitHub OAuth |
| **Dev B** | AI / ML / Matching Engine | `backend` or co-located in `server/ai/` | Groq API, @xenova/transformers, cosine similarity |
| **Dev C** | Frontend / UI / Motion | `frontend` (root) | Next.js 14, Tailwind, GSAP, Framer Motion, Three.js |

---

## CRITICAL: No-Conflict Monorepo Layout

```
/ (repo root)
├── app/              ← Dev C ONLY (Next.js App Router)
├── components/       ← Dev C ONLY
├── lib/              ← Dev C ONLY (api.js, mockData.js, utils.js)
├── public/           ← Dev C ONLY
├── package.json      ← Dev C ONLY (Next.js deps)
├── tailwind.config.js
├── next.config.mjs
├── vercel.json       ← Frontend deployment
│
└── server/           ← Dev A + Dev B ONLY — never touch root files
    ├── src/
    │   ├── routes/   (auth.js, repos.js, issues.js, match.js)
    │   ├── ai/       (classify.js, embeddings.js, matcher.js)
    │   ├── middleware/
    │   ├── config/   (supabase.js, logger.js)
    │   └── index.js
    ├── migrations/   (001_initial_schema.sql)
    ├── scripts/      (seed.js)
    ├── tests/
    ├── package.json  ← separate from root (Express deps)
    ├── .env.example
    ├── Dockerfile
    └── render.yaml
```

> **Rule**: Dev A and Dev B **only write inside `server/`**. Dev C **only writes outside `server/`**. This guarantees zero merge conflicts.

---

## API Contract (FROZEN after Phase 1 — do not change shapes)

All responses use consistent JSON error shape: `{ error: { message, code } }`

### Auth
```
POST /api/auth/github
  Body: { code: string }               ← GitHub OAuth code from redirect
  Response: { sessionToken: string, user: { id, login, name, avatar_url, bio, public_repos, followers, skills[] } }
```

### Repos
```
POST /api/repos/connect
  Auth: Bearer <sessionToken>
  Body: { repoUrl: string }            ← e.g. "https://github.com/vercel/next.js"
  Response: { repoId: string, issuesIngested: number, repo: { id, url, name, description, stars, connectedAt } }

GET /api/repos
  Auth: Bearer <sessionToken>
  Response: [{ id, url, name, description, stars, issuesIngested, connectedAt }]
```

### Issues
```
GET /api/issues?repo=<id>             ← single repo
GET /api/issues?repo=<id1>,<id2>      ← multi-repo (comma-separated)
  Auth: Bearer <sessionToken>
  Response: [{
    id, repoId, repoName, number, title, body, url,
    labels: null | { difficulty: "Easy"|"Intermediate"|"Advanced", skillArea: string, effort: string, confidence: float },
    commentsCount, createdAt
  }]
```

### Matching
```
POST /api/match
  Auth: Bearer <sessionToken>
  Body: { skills: string[], githubProfile?: string }
  Response: [{
    score: number (0-100),
    matchReason: string,
    issue: { id, repoId, repoName, number, title, body, url, labels, commentsCount, createdAt }
  }]
```

### Maintainer Feedback Loop
```
POST /api/issues/:id/correct-label
  Auth: Bearer <sessionToken>
  Body: { difficulty?: string, skillArea?: string, effort?: string }
  Response: { success: true, updatedIssue: object }

POST /api/issues/:id/reclassify
  Auth: Bearer <sessionToken>
  Response: { success: true, labels: object }   ← stub for Dev B to fill
```

---

## Database Schema (Supabase Postgres)

```sql
users           (id UUID, github_id BIGINT, username, name, avatar_url, access_token, created_at)
repos           (id UUID, github_repo_id BIGINT, owner, name, full_name, description, url, stars, connected_by_user_id→users, last_ingested_at)
issues          (id UUID, repo_id→repos, github_issue_id BIGINT, number, title, body, url, state, comments_count, created_at)
issue_labels    (issue_id→issues PK, difficulty, skill_area, effort, confidence FLOAT, labeled_at)  ← Dev B writes here
label_corrections (id UUID, issue_id→issues, field, old_value, new_value, corrected_by→users, corrected_at)
contributors    (id UUID, user_id→users, skills TEXT[], github_profile JSONB)
matches         (id UUID, contributor_id→contributors, issue_id→issues, score FLOAT, match_reason TEXT)
```

---

## Session / Auth Flow

1. Frontend redirects to `https://github.com/login/oauth/authorize?client_id=...`
2. GitHub redirects back with `?code=` to `/login`
3. Frontend POSTs `{ code }` to `POST /api/auth/github`
4. Backend exchanges code for GitHub access token, upserts user in DB, issues JWT
5. Frontend stores `sessionToken` in `localStorage` as `contrib_session_token`
6. All subsequent API calls send `Authorization: Bearer <sessionToken>`

---

## CORS Configuration (Backend Must Allow)

```
Origins: http://localhost:3000, https://*.vercel.app, FRONTEND_ORIGIN env var
Methods: GET, POST, PUT, DELETE, OPTIONS
Headers: Content-Type, Authorization
Credentials: true
```

---

## Environment Variables

### Frontend (set in Vercel dashboard)
```
NEXT_PUBLIC_API_URL=https://contrib-compass-api.onrender.com
NEXT_PUBLIC_GITHUB_CLIENT_ID=<oauth_app_client_id>
```

### Backend (set in Render/Railway dashboard)
```
PORT=5000
NODE_ENV=production
JWT_SECRET=<random_32_char_string>
GITHUB_CLIENT_ID=<oauth_app_client_id>
GITHUB_CLIENT_SECRET=<oauth_app_client_secret>
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=<service_role_key>
GITHUB_PAT=<personal_access_token>     (for seeding)
GROQ_API_KEY=<groq_api_key>            (Dev B)
FRONTEND_ORIGIN=https://contrib-compass.vercel.app
```

---

## Dev Handoff Interfaces

### Dev A → Dev B
Dev A calls `classifyAndEmbedIssue(issue)` after each issue is ingested and writes the result to `issue_labels`:
```js
// Dev B provides this function in server/src/ai/classify.js
async function classifyAndEmbedIssue(issue) {
  // returns { difficulty, skillArea, effort, confidence, embedding }
}
```

### Dev B → Dev A  
Dev B provides `matchContributorToIssues(contributor, issues)` in `server/src/ai/matcher.js`. Dev A calls it inside `POST /api/match`:
```js
// Dev B provides this function in server/src/ai/matcher.js
async function matchContributorToIssues(contributor, issues) {
  // contributor = { skills: string[], githubProfile?: string }
  // issues = [{ id, title, body, labels, embedding }]
  // returns [{ issue, score: 0-100, matchReason: string }] sorted descending, top-5
}
```

### Backend → Frontend
Scores **must be normalized 0–100** (not 0.0–1.0). Frontend GSAP animation fills score bars using this range. The `matchReason` string should be ≤ 120 chars — it's displayed in the match card.

---

## Caching Strategy

| Endpoint | Cache TTL | Invalidated When |
|----------|-----------|-----------------|
| `GET /api/issues` | 60s | New repo connected, issue reclassified |
| `GET /api/repos` | 60s | New repo connected |
| `POST /api/match` | 30s per skills combo | Label corrected |

Use `node-cache` (in-memory) for the hackathon. Key pattern: `issues:<repoId>`, `repos:<userId>`.

---

## Deployment

| Service | Who | URL Pattern |
|---------|-----|-------------|
| **Vercel** | Dev C | `https://contrib-compass.vercel.app` |
| **Render** | Dev A | `https://contrib-compass-api.onrender.com` |

Dev A: use `render.yaml` in `server/` for one-click Render deploy. Dev C: push to `main` on Vercel for auto-deploy.

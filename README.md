# 🧭 Contrib Compass

> **AI-Powered Open-Source Contributor Matching & Issue Triage Platform**  
> Never let good first issues go unnoticed. Match contributors with high-impact open-source issues aligned with their skills, stack, and available time.

---

## 🌟 Core Features

- **Interactive 3D WebGL Compass** — Three.js viewport orienting contributors toward relevant repository domains.
- **Automated AI Triage** — Multi-factor classification analyzing difficulty (`Easy`, `Intermediate`, `Advanced`), skill area, and estimated effort (`<1 hr`, `2-4 hrs`, `4-6 hrs`, `>1 day`).
- **Smart Semantic Matching** — Weighted multi-factor scoring matching contributor skill graphs to open issues with 0–100 normalized scores and ≤120 char contextual explanations.
- **Active Maintainer Feedback Loop** — Maintainers can review and correct AI triaged labels in real-time; corrections immediately override labels in the matching engine.
- **Live + Demo Mode** — Pre-seeded with curated repositories (`facebook/react`, `vercel/next.js`, `tailwindlabs/tailwindcss`) so the demo works even without a GitHub PAT.

---

## 🏗️ Architecture

```
                                  ┌────────────────────────┐
                                  │   Next.js 14 Frontend  │
                                  │ (Three.js, GSAP, FM)   │
                                  └───────────┬────────────┘
                                              │ REST API / JWT
                                              ▼
                                  ┌────────────────────────┐
                                  │   Express API Server   │
                                  │ (server/src/index.js)  │
                                  └─────┬────────────┬─────┘
                                        │            │
                  ┌─────────────────────┘            └─────────────────────┐
                  ▼                                                        ▼
    ┌───────────────────────────┐                            ┌───────────────────────────┐
    │     AI & Triage Engine    │                            │    SQLite Persistence     │
    │ - Rule Heuristics         │                            │  (server/data/compass.db) │
    │ - Groq LLM Classifier     │                            │ - repos, issues, labels   │
    │ - Semantic Matcher        │                            │ - corrections, matches    │
    └───────────────────────────┘                            └───────────────────────────┘
```

**Issue Ingestion Flow:**  
`POST /api/repos/connect` → fetches real issues from the GitHub Issues tab (up to 200, sorted by newest) via REST API → AI classifier assigns difficulty/skill/effort → stored in SQLite → served to the match engine.

---

## 🚀 Quickstart

### 1. Prerequisites
- Node.js v18+ or v20+
- npm v9+

### 2. Environment Setup

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ | Any random string (32+ chars) |
| `GITHUB_PAT` | ⚠️ Recommended | GitHub Personal Access Token — **without this, connecting new repos will fail** |
| `GROQ_API_KEY` | ⚠️ Recommended | Groq API key for live LLM classification — without this, rule-based heuristics are used |

**Getting a `GITHUB_PAT`:**
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Select `public_repo` scope (no other permissions needed)
4. Paste the token as `GITHUB_PAT=ghp_...` in `server/.env`

> **Without a PAT:** The pre-seeded demo repositories work fine. Connecting *new* repos will return an error asking you to add a PAT.

### 3. Backend Setup
```bash
cd server
npm install
npm run seed       # Pre-populates SQLite with 3 demo repos & 12 curated issues
npm start          # Starts API server on http://localhost:5000
```

To run the backend test suite:
```bash
npm test
```

### 4. Frontend Setup
```bash
# In the root repository directory
npm install
npm run dev        # Starts Next.js app on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔄 Live vs Demo Mode

| Mode | When | What happens |
|---|---|---|
| **Live** | `GITHUB_PAT` is set and valid | Real issues fetched from GitHub Issues tab (up to 200, newest first), then classified |
| **Demo** | No PAT, or repo already seeded | Pre-classified issues from seeded repos are served instantly |
| **Error** | PAT missing and repo not in DB | Clear 503 error explaining how to add a PAT |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/github` | Authenticate via GitHub OAuth or demo credentials |
| `POST` | `/api/auth/demo` | Instant demo login returning JWT session |
| `POST` | `/api/repos/connect` | Ingest and auto-triage a GitHub repository (requires PAT for new repos) |
| `GET` | `/api/repos` | List connected repositories with issue stats |
| `GET` | `/api/issues?repo=<id>` | Retrieve triaged issues with difficulty/effort tags |
| `POST` | `/api/match` | Rank top 5 issues for a contributor profile |
| `POST` | `/api/issues/:id/correct-label` | Maintainer correction loop updating labels & confidence |
| `POST` | `/api/issues/:id/reclassify` | Re-run AI classifier on a single issue |
| `GET` | `/health` | Server & database health check |

---

## 🧪 Verification & Testing

- **Unit & Integration Tests**: 13 automated tests covering auth, repository ingestion, AI triage heuristics, semantic matching, and maintainer feedback.
- **Frontend Build**: Verified production static build across all 7 routes.
- **Test command**: `npm test` inside `server/`

---

## 🔍 Troubleshooting

**"Connecting new repos shows fake/wrong issues"**  
→ Add a `GITHUB_PAT` to `server/.env`. Without a token, the GitHub API rate-limits unauthenticated requests and connecting new repos will fail.

**"Issues don't match what I see in the GitHub Issues tab"**  
→ The `/api/repos/connect` endpoint fetches from the same GitHub REST endpoint as the Issues tab (`/repos/{owner}/{repo}/issues?state=open`). If you see seeded data instead, the repo was already connected from the seed. Delete `server/data/compass.db` and re-run `npm run seed` to reset.

**"Groq classification is not working"**  
→ Set `GROQ_API_KEY` in `server/.env`. Without it, rule-based heuristics are used as a fallback (still functional, slightly less accurate).

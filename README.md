# 🧭 Contrib Compass

> **AI-Powered Open-Source Contributor Matching & Issue Triage Platform**  
> Never let good first issues go unnoticed. Match contributors with high-impact open-source issues aligned with their skills, stack, and available time.

---

## 🌟 Highlights & Core Features

- **🌐 Interactive 3D WebGL Compass**: Three.js viewport orienting contributors toward relevant repository domains.
- **⚡ Automated AI Triage**: Multi-factor classification analyzing difficulty (`Easy`, `Intermediate`, `Advanced`), skill area, and estimated effort (`<1 hr`, `2-4 hrs`, `4-6 hrs`, `>1 day`).
- **🎯 Semantic Vector Matching**: Hybrid lexical and semantic retrieval matching contributor profiles to open issues with 0–100 score normalization and contextual <= 120 char explanations.
- **🔄 Active Learning Feedback Loop**: Maintainers can review and correct AI triaged labels in real-time, instantly updating confidence and re-indexing the matching engine.
- **🛡️ 100% Offline & Rate-Limit Resilient**: Pre-seeded with curated repositories (`facebook/react`, `vercel/next.js`, `tailwindlabs/tailwindcss`) with instantaneous mock/live failover.

---

## 🏗️ Architecture

```
                                  ┌────────────────────────┐
                                  │   Next.js 14 Frontend  │
                                  │ (Three.js, GSAP, UI)   │
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
    │ - Groq LLM Classifier    │                            │ - repos, issues, labels   │
    │ - Semantic Matcher        │                            │ - corrections, matches    │
    └───────────────────────────┘                            └───────────────────────────┘
```

---

## 🚀 Quickstart

### 1. Prerequisites
- Node.js v18+ or v20+
- npm v9+

### 2. Backend Setup
```bash
cd server
npm install
npm run seed       # Pre-populates database with demo repositories & issues
npm start          # Starts API server on http://localhost:5000
```

To run the backend test suite:
```bash
npm test
```

### 3. Frontend Setup
```bash
# In the root repository directory
npm install
npm run dev        # Starts Next.js app on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/github` | Authenticate via GitHub OAuth or demo credentials |
| `POST` | `/api/auth/demo` | Instant demo login returning JWT session |
| `POST` | `/api/repos/connect` | Ingest and auto-triage a GitHub repository |
| `GET` | `/api/repos` | List connected repositories with issue stats |
| `GET` | `/api/issues?repo=<id>` | Retrieve triaged issues with difficulty/effort tags |
| `POST` | `/api/match` | Rank top 5 issues for a contributor profile |
| `POST` | `/api/issues/:id/correct-label` | Maintainer correction loop updating labels & confidence |
| `GET` | `/health` | Server & database health check |

---

## 🧪 Verification & Testing

- **Unit & Integration Tests**: 13 automated tests covering auth, repository ingestion, AI triage heuristics, vector matching, and maintainer feedback.
- **Frontend Build**: Verified production static export and SSR build across all 5 routes.

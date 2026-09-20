# Contrib Compass

AI-powered open-source contributor matching and issue triage platform. Contrib Compass automatically triages GitHub issues by difficulty, skill area, and effort using LLM inference and local heuristics, then matches contributors to the best-fit issues based on their skills and preferences.

---

## Features

- **3D WebGL Compass Visualizer**: Interactive Three.js canvas orienting contributors toward relevant repository domains.
- **Automated Issue Triage**: Classifies open issues into difficulty levels (`Easy`, `Intermediate`, `Advanced`), skill areas, and estimated completion time, generating actionable summaries.
- **Multi-Factor Contributor Matching**: Ranks issues for contributors using weighted skill matching, returning normalized scores (0–100) and contextual match explanations.
- **Maintainer Feedback Loop**: Maintainers can correct classifications directly in the studio. Corrections are persisted to SQLite and immediately override model labels in the matching engine.
- **Client-Side Key Management (BYOK)**: Users can enter their own GitHub PAT and Groq API Key in the UI settings. Keys are stored locally in the browser and transmitted via request headers.

---

## Architecture

```
                      +------------------------+
                      |   Next.js 14 Frontend  |
                      |  (Three.js, GSAP, FM)  |
                      +-----------+------------+
                                  | REST API / JWT
                                  v
                      +------------------------+
                      |   Express API Server   |
                      |  (server/src/index.js) |
                      +-----+------------+-----+
                            |            |
            +---------------+            +---------------+
            v                                            v
+-----------------------+                    +-----------------------+
|  AI & Triage Engine   |                    |   SQLite Persistence  |
| - Groq LLM Classifier |                    | (server/data/compass) |
| - Heuristics Fallback |                    | - repos, issues       |
| - Matching Algorithm  |                    | - labels, corrections |
+-----------------------+                    +-----------------------+
```

---

## How to Run

### Prerequisites

- Node.js 18+ or 20+
- npm 9+

### 1. Start Backend Server

```bash
cd server
npm install
npm run seed
npm start
```

The backend server will start on `http://localhost:5000`.

### 2. Start Frontend App

In the project root directory:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables & Configuration

No `.env` file is strictly required to run locally. The application comes pre-seeded with real issues from `vercel/next.js`, `facebook/react`, and `dapr/dapr`.

### Bringing Your Own Keys (Recommended)
You do not need to configure API keys on the backend server. Instead, click the **Settings** icon in the frontend navigation bar to input:
- **GitHub Personal Access Token**: Allows connecting any public GitHub repository without hitting rate limits.
- **Groq API Key**: Enables live LLM-powered issue triage and summaries.

Keys are stored in your browser's local storage and sent via `x-github-pat` and `x-groq-api-key` request headers.

### Deployment Environment Variables

When deploying to production (e.g., Vercel + Render/Railway):

**Frontend (Vercel):**
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of your deployed backend (e.g. `https://your-api.onrender.com`) |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | Optional GitHub OAuth Client ID for OAuth login |

**Backend (Render / Railway):**
| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Port for Express server |
| `NODE_ENV` | `production` | Environment mode |
| `JWT_SECRET` | Provided | Secret used for signing session tokens |
| `FRONTEND_ORIGIN` | `*` | Allowed CORS origin (permissive in demo mode) |
| `GROQ_API_KEY` | *(Optional)* | Server-level fallback key if client does not provide one |
| `GITHUB_PAT` | *(Optional)* | Server-level fallback PAT for repository ingestion |

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/github` | Authenticate via GitHub OAuth code or demo credentials |
| `POST` | `/api/repos/connect` | Ingest and auto-triage a GitHub repository (`owner/repo` or URL) |
| `GET` | `/api/repos` | List connected repositories and issue counts |
| `GET` | `/api/issues?repo=<id>` | Retrieve triaged issues with difficulty, skill, and effort tags |
| `POST` | `/api/match` | Return ranked issue matches for a contributor skill set |
| `POST` | `/api/issues/:id/correct-label` | Correct issue labels; immediately overrides match algorithm |
| `GET` | `/api/health` | Service health check |

---

## Testing

Run the automated backend test suite:

```bash
cd server
npm test
```

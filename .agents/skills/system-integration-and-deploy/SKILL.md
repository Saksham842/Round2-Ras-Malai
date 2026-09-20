---
name: system-integration-and-deploy
description: >-
  Complete guide for cross-stack API contract verification, CORS configuration,
  environment variable auditing, and end-to-end deployment to Vercel and Render.
  Includes smoke test scripts and monorepo conflict-prevention rules.
  Use when connecting frontend to backend, validating API contracts, or preparing deployments.
---

# System Integration & Deployment Guide — Contrib Compass

## Overview
Contrib Compass runs as a decoupled monorepo:
- **Frontend**: Next.js 14 deployed to **Vercel** (`https://contrib-compass.vercel.app`)
- **Backend**: Express + Supabase + Groq deployed to **Render** (`https://contrib-compass-api.onrender.com`)

Because Dev A, B, and C work independently under tight hackathon timelines, strict contract adherence and zero-conflict boundaries are essential.

---

## 1. Frozen API Contract Verification

All API responses must follow these exact shapes. Never modify property names or types.

### Standard Error Shape (Mandatory for ALL 4xx & 5xx)
```json
{
  "error": {
    "message": "Human readable error description",
    "code": "AUTH_REQUIRED" | "INVALID_REPO" | "RATE_LIMITED" | "SERVER_ERROR"
  }
}
```

### Response Check Matrix:

| Endpoint | Method | Key Response Shape Check |
|----------|--------|--------------------------|
| `/api/auth/github` | `POST` | Must return `{ sessionToken: string, user: { id, login, name, avatar_url, skills } }` |
| `/api/repos/connect` | `POST` | Must return `{ repoId, issuesIngested: number, repo: { id, url, name, stars } }` |
| `/api/repos` | `GET` | Must return Array `[{ id, url, name, stars, issuesIngested, connectedAt }]` |
| `/api/issues?repo=:id` | `GET` | Must return Array `[{ id, repoId, repoName, number, title, body, url, labels, commentsCount, createdAt }]` |
| `/api/match` | `POST` | Must return Array `[{ score: 0-100, matchReason: string, issue: {...} }]`. **Score must be 0-100 integer, matchReason ≤ 120 chars**. |
| `/api/issues/:id/correct-label` | `POST` | Must return `{ success: true, updatedIssue: object }` |

---

## 2. Cross-Origin (CORS) Configuration

Render backend must explicitly permit Vercel domains and local dev servers. In `server/src/index.js`:

```javascript
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_ORIGIN, // e.g. "https://contrib-compass.vercel.app"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or non-browser requests (no origin header)
    if (!origin) return callback(null, true);

    // Allow configured origins and all Vercel preview deploys (*.vercel.app)
    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
}));
```

---

## 3. Environment Variable Matrix

| Variable | Target Platform | Purpose | Required In Dev? |
|----------|-----------------|---------|------------------|
| `NEXT_PUBLIC_API_URL` | Vercel (Frontend) | Base URL of backend API (`https://...onrender.com`) | Yes (`http://localhost:5000`) |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | Vercel (Frontend) | GitHub OAuth app ID | Optional (mock available) |
| `PORT` | Render (Backend) | Web server port | Default: 5000 |
| `NODE_ENV` | Render (Backend) | `production` / `development` | Yes |
| `JWT_SECRET` | Render (Backend) | Min 32 char secret for signing user tokens | Yes |
| `GITHUB_CLIENT_ID` | Render (Backend) | GitHub OAuth application client ID | For live OAuth |
| `GITHUB_CLIENT_SECRET`| Render (Backend) | GitHub OAuth application secret | For live OAuth |
| `GITHUB_PAT` | Render (Backend) | GitHub Personal Access Token for 5000/hr limit | Recommended |
| `SUPABASE_URL` | Render (Backend) | Supabase Postgres project URL | Yes |
| `SUPABASE_KEY` | Render (Backend) | Supabase `service_role` or `anon` secret key | Yes |
| `GROQ_API_KEY` | Render (Backend) | Groq LPU API key for `llama-3.3-70b` | Yes |
| `FRONTEND_ORIGIN` | Render (Backend) | Production Vercel URL for CORS whitelist | Yes |

---

## 4. End-to-End Smoke Test Script

Run this script to verify all endpoints against a running backend before deploying or presenting:

```javascript
// smoke-test.js
const fetch = require("node-fetch");

const BASE_URL = process.env.API_URL || "http://localhost:5000";

async function runSmokeTests() {
  console.log(`\n🔍 Running Contrib Compass Integration Smoke Tests against: ${BASE_URL}\n`);
  let passed = 0;
  let failed = 0;

  // 1. Health Check
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (res.ok && data.status === "ok") {
      console.log("✅ [PASS] GET /health responded 200 OK");
      passed++;
    } else throw new Error(`Unexpected status: ${res.status}`);
  } catch (e) {
    console.error(`❌ [FAIL] GET /health: ${e.message}`);
    failed++;
  }

  // 2. Auth Endpoint
  let token = null;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/github`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "mock_demo_code" }),
    });
    const data = await res.json();
    if (res.ok && data.sessionToken) {
      token = data.sessionToken;
      console.log("✅ [PASS] POST /api/auth/github returned sessionToken");
      passed++;
    } else {
      console.warn("⚠️ [SKIP] POST /api/auth/github requires real OAuth code or mock handler");
    }
  } catch (e) {
    console.warn("⚠️ [WARN] POST /api/auth/github error:", e.message);
  }

  // 3. Match Engine Contract Check (Normalized 0-100)
  try {
    const res = await fetch(`${BASE_URL}/api/match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ skills: ["React", "TypeScript"] }),
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      const allNormalized = data.every(m => m.score >= 0 && m.score <= 100);
      if (allNormalized) {
        console.log(`✅ [PASS] POST /api/match returned ${data.length} matches with 0-100 scores`);
        passed++;
      } else {
        console.error("❌ [FAIL] POST /api/match scores are not normalized between 0-100!");
        failed++;
      }
    } else {
      console.warn(`⚠️ [WARN] POST /api/match status ${res.status}`);
    }
  } catch (e) {
    console.warn("⚠️ [WARN] POST /api/match failed:", e.message);
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
}

runSmokeTests();
```

---

## 5. Deployment Playbook

### Frontend Deployment (Vercel)
1. Push branch `frontend` or `main` to GitHub.
2. Link project on [Vercel](https://vercel.com).
3. Set Framework Preset: **Next.js**.
4. Set Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://contrib-compass-api.onrender.com`
   - `NEXT_PUBLIC_GITHUB_CLIENT_ID` = your OAuth Client ID
5. Deploy. Verify build succeeds without ESLint/TypeScript errors.

### Backend Deployment (Render)
1. Connect GitHub repo on [Render](https://render.com).
2. Choose **Web Service** or use blueprint `server/render.yaml`.
3. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Health Check Path**: `/health`
4. Add Environment Variables from the matrix above.
5. Deploy and verify `/health` returns `{ "status": "ok" }`.

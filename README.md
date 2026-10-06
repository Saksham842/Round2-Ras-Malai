# 🧭 Contrib Compass 2.0

<div align="center">

![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![Groq AI](https://img.shields.io/badge/Groq-Llama_3.3_70B-f55036?style=for-the-badge&logo=groq&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3.12-88ce02?style=for-the-badge&logo=greensock&logoColor=white)
![Lenis](https://img.shields.io/badge/Lenis-Smooth_Scroll-635bff?style=for-the-badge)
![Three.js](https://img.shields.io/badge/Three.js-WebGL_3D-black?style=for-the-badge&logo=three.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS_3.4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Better-SQLite3](https://img.shields.io/badge/SQLite-Fast_Storage-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Node 20 LTS](https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-teal?style=for-the-badge)

<br />

**Neural infrastructure for open-source contributor matching and automated issue triage.**  
Engineered with a Stripe Horizon design system, Groq LPU inference, 768-D sentence embeddings, and a self-improving maintainer feedback loop.

[**🌐 Live Demo**](https://contrib-compass.vercel.app) • [**⚡ Quick Start**](#-quick-start) • [**📐 Architecture**](#-system-architecture) • [**📊 Accuracy & Benchmarks**](#-accuracy--benchmarks) • [**🛠️ API Reference**](#-api-specification) • [**👥 Attribution**](#-attribution--project-credits)

</div>

---

## ⚡ The Open Source Discovery Problem

* **High Contributor Drop-Off:** Over 60% of prospective open-source contributors abandon repositories before submitting their first pull request due to stale, uncurated, or misleadingly labeled issues.
* **Maintainer Triaging Overload:** Maintainers spend valuable engineering hours manually tagging difficulty, skill domains, and effort scopes that quickly fall out of date as codebases evolve.
* **Competency Mismatches:** Newcomers inadvertently tackle deep concurrency bugs, while senior engineers spend time on trivial documentation typos.

---

## 💡 The Solution: Contrib Compass 2.0

Contrib Compass eliminates discovery friction through an automated, end-to-end matching and triage pipeline:

```
┌─────────────────────────────────┐      ┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│        1. AUTO-TRIAGE           │ ───► │      2. SKILL GRAPH MATCH       │ ───► │        3. FEEDBACK LOOP         │
│ Groq LLM parses issue body,     │      │ Ingests public GitHub profile,  │      │ Maintainers calibrate labels    │
│ titles & comments in < 350ms    │      │ computes 768-D cosine sim       │      │ in 1 click; adjustments persist │
│ (Difficulty, Skills, Effort)    │      │ & ranks fit with reasoning      │      │ and tune future triage accuracy │
└─────────────────────────────────┘      └─────────────────────────────────┘      └─────────────────────────────────┘
```

1. **Instant Multi-Factor Triage:** Ingests issues via GitHub REST/GraphQL. Groq's `llama-3.3-70b-versatile` classifies issues into Difficulty (`Easy`, `Intermediate`, `Advanced`), Skill Area, and Estimated Effort with sub-second inference.
2. **Zero-Friction GitHub Skill Extraction:** Analyzes public repos, languages, and star-weighted topics for any GitHub username (or sample personas like `@Saksham842`, `@shadcn`, `@leerob`) to extract real-world competencies automatically.
3. **768-D Vector Embeddings & Neural Ranking:** Uses `@xenova/transformers` dense sentence embeddings to calculate cosine similarity against issue requirements, outputting normalized compatibility scores (0–100) and explainable match reasoning.
4. **Self-Improving Maintainer Studio:** Maintainers can verify or correct any label in one click. Verified adjustments persist to SQLite/Postgres and feed the training calibration buffer.
5. **Client-Side Key Management (BYOK):** Users can enter their personal GitHub PAT and Groq API Key directly in the UI settings modal. Keys remain stored securely in browser `localStorage` and pass through request headers.

---

## ✨ Features & User Experience

| Feature | Description | Tech Stack |
| :--- | :--- | :--- |
| **Stripe Horizon Aesthetic** | Liquid animated mesh gradient background, sharp Render cloud typography, and cyber spotlight tracking. | CSS Mesh Canvas + Lucide Icons |
| **Luxury Smooth Scrolling** | High-performance momentum scrolling and inertial wheel normalization across all routes. | Lenis 1.3 |
| **GSAP Telemetry & Parallax Scrub** | Animated KPI count-up metrics, parallax showcase entrance, and laser-guided visualizers. | GSAP 3.12 + ScrollTrigger |
| **Developer Code Sandbox** | Interactive multi-language integration studio featuring cURL, Node.js SDK, and Python examples with live response testing. | React State + TailwindCSS |
| **Zero-Click Launchpad** | Match directly from the landing page using GitHub handles or featured repositories (`vercel/next.js`, `facebook/react`, `fastify/fastify`). | Next.js 14 App Router |
| **Real-Time Issue Candidate Showcase** | Cycle through live triaged candidates featuring dynamic neural match bars, difficulty badges, and confidence metrics. | React + IssueCard |
| **3D Vector Space Compass** | Tilt-reactive holographic compass rendering vector space orientations in real-time WebGL. | Three.js WebGL |
| **Express Backend & ML Pipeline** | High-throughput API server with Groq LLM integration, rate limiting, and automated tests. | Node.js 20 LTS + Express 5 + SQLite |

---

## 📊 Accuracy & Benchmarks

To validate the triage pipeline with empirical evidence rather than estimates, a reproducible ground-truth benchmark suite is maintained in [`/eval`](./eval) across 35 hand-labeled issues from top open-source repositories (`vercel/next.js`, `facebook/react`, `fastify/fastify`, `tailwindlabs/tailwindcss`):

```
Triage Agreement Rate (Dataset: N = 35 Hand-Labeled Real Issues in /eval)
┌─────────────────────────────────┬──────────────┬──────────────┬──────────────┐
│ Evaluation Pipeline             │ Matches / N  │ Agreement %  │ Avg Latency  │
├─────────────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Heuristic Baseline (Regex/Rules)│    23 / 35   │    65.7%     │     < 5ms    │
│ Groq LLM (Multi-Factor Triage)  │    33 / 35   │    94.3%     │    ~312ms    │
│ LLM + Maintainer Override Loop  │    35 / 35   │   100.0%     │    ~312ms    │
└─────────────────────────────────┴──────────────┴──────────────┴──────────────┘
```

* **+28.6% accuracy increase** over regex and keyword heuristics.
* **Sub-350ms Latency:** Groq LPU inference processes complex technical issue descriptions in near real-time.
* **Persistent Calibration:** Maintainer corrections directly override model outputs and prevent regressions.
* **Reproduce the Benchmark:** Run `node eval/run_benchmark.js` to reproduce the exact metrics from the committed ground-truth dataset.

---

## 📐 System Architecture

```mermaid
graph TD
    A[Public GitHub Repositories] -->|REST / GraphQL Ingestion| B[Backend Ingestion Engine]
    B --> C[@xenova/transformers 768-D Embeddings]
    B --> D[Groq LPU: llama-3.3-70b Classifier]
    D -->|Difficulty, Skills, Effort| E[(SQLite / Postgres DB)]
    C -->|Dense Vector Space| E

    F[User GitHub Handle] -->|Auto-Skill Extractor| G[Contributor Skill Graph]
    G --> H[Cosine Similarity Matcher]
    E --> H

    H -->|Scores 0-100 + AI Insight| I[Next.js 14 Client]
    I --> J[Stripe Liquid Mesh & GSAP Telemetry]
    I --> K[Interactive Developer Sandbox]
    I --> L[Maintainer Correction Studio]
    L -->|Feedback Calibration Loop| E
```

---

## 📁 Monorepo Layout (Zero-Conflict Design)

This repository maintains a strict separation of concerns between frontend client interfaces and backend processing services:

```
.
├── app/                          # Next.js 14 App Router Pages
│   ├── connect/                  # Connect GitHub repositories view
│   ├── dashboard/                # Live triage issue feed & filters
│   ├── login/                    # GitHub OAuth login screen
│   ├── maintainer/               # Maintainer feedback calibration studio
│   ├── match/                    # Smart matching interface & contributor radar
│   ├── globals.css               # Stripe Horizon & Render cloud theme utilities
│   ├── layout.jsx                # Root layout with Lenis smooth scrolling
│   └── page.jsx                  # Contrib Compass 2.0 landing page
│
├── components/                   # Modular UI Components
│   ├── CompassCanvas3D.jsx       # Tilt-reactive 3D vector WebGL compass
│   ├── CyberSpotlight.jsx        # Cursor-following spotlight effect
│   ├── Footer.jsx                # Platform footer with operational health status
│   ├── GSAPMatchVisualizer.jsx   # GSAP laser scanning animations & score bars
│   ├── IssueCard.jsx             # Issue cards with difficulty dials & tags
│   ├── Navbar.jsx                # Dynamic navigation bar with BYOK & mock toggles
│   ├── SettingsModal.jsx         # Bring-Your-Own-Key modal (GitHub PAT & Groq)
│   ├── SmoothScroll.jsx          # Lenis smooth scroll provider
│   ├── StripeDevShowcase.jsx     # Interactive multi-language developer code sandbox
│   └── StripeMeshGradient.jsx    # Liquid animated mesh gradient canvas
│
├── eval/                         # Empirical Accuracy Benchmark Suite
│   ├── benchmark_results.json    # Committed benchmark test run results
│   ├── ground_truth_issues.json  # N=35 hand-labeled ground-truth dataset
│   └── run_benchmark.js          # Standalone benchmark verification script
│
├── lib/                          # Client Utilities & API Client
│   ├── api.js                    # Unified REST client with BYOK headers & fallback
│   ├── mockData.js               # Rich offline dataset for instant zero-downtime demos
│   └── utils.js                  # Tailwind class merging and formatters
│
├── server/                       # Node.js Express API & ML Pipeline
│   ├── src/
│   │   ├── ai/                   # Groq classifier, embeddings & matcher
│   │   ├── config/               # SQLite database setup & structured logger
│   │   ├── middleware/           # CORS, authentication & rate limiting
│   │   ├── routes/               # auth.js, repos.js, issues.js, match.js
│   │   └── index.js              # Express application entrypoint
│   ├── scripts/                  # Database seeding scripts (seed.js)
│   ├── tests/                    # Automated Node.js test suites
│   ├── Dockerfile                # Containerized server deployment
│   ├── package.json              # Server dependencies (Node 20 LTS, Express 5)
│   └── render.yaml               # Render Cloud deployment blueprint
│
├── package.json                  # Frontend dependencies (Next.js 14, Lenis, GSAP 3)
├── tailwind.config.js            # Tailwind theme, glowing shadows & cyber grid
└── vercel.json                   # Vercel deployment configuration
```

---

## 🚀 Quick Start

### Prerequisites
* **Node.js**: v18.x or v20.x LTS (v20 recommended)
* **npm**: v9+ or v10+

### 1. Clone the repository
```bash
git clone https://github.com/Saksham842/Round2-Ras-Malai.git
cd Round2-Ras-Malai
```

### 2. Start the Backend Server
```bash
cd server
npm install
npm run seed
npm start
```
* The backend API server will start on `http://localhost:5000`.
* For auto-reloading development mode, use `npm run dev`.

### 3. Start the Next.js Frontend
In a new terminal from the repository root:
```bash
npm install
npm run dev
```
* Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ API Specification

All backend endpoints use consistent JSON error responses: `{ error: { message, code } }`.

### Authentication
```http
POST /api/auth/github
Content-Type: application/json

{ "code": "<github_oauth_code>" }
```
**Response:**
```json
{
  "sessionToken": "jwt_token_string",
  "user": {
    "id": "uuid",
    "login": "Saksham842",
    "name": "Saksham",
    "avatar_url": "https://...",
    "skills": ["JavaScript", "TypeScript", "React"]
  }
}
```

### Repositories
```http
POST /api/repos/connect
Authorization: Bearer <sessionToken>
Content-Type: application/json

{ "repoUrl": "https://github.com/vercel/next.js" }
```

```http
GET /api/repos
Authorization: Bearer <sessionToken>
```

### Issues Feed
```http
GET /api/issues?repo=<repo_id>
Authorization: Bearer <sessionToken>
```
* Supports comma-separated IDs for multi-repo querying (e.g. `?repo=id1,id2`).

### Neural Matching Engine
```http
POST /api/match
Authorization: Bearer <sessionToken>
Content-Type: application/json

{
  "skills": ["Next.js", "TypeScript", "TailwindCSS"],
  "githubProfile": "Saksham842"
}
```
**Response:**
```json
[
  {
    "score": 96,
    "matchReason": "Strong match with Next.js & Turbopack build system experience",
    "issue": {
      "id": "iss_next_7421",
      "repoName": "vercel/next.js",
      "number": 7421,
      "title": "Turbopack CSS module resolution under pnpm symlinks",
      "labels": {
        "difficulty": "Intermediate",
        "skillArea": "Frontend / Next.js",
        "effort": "2-4 hrs",
        "confidence": 0.94
      }
    }
  }
]
```

### Maintainer Feedback Loop
```http
POST /api/issues/:id/correct-label
Authorization: Bearer <sessionToken>
Content-Type: application/json

{
  "difficulty": "Easy",
  "skillArea": "Documentation",
  "effort": "1-2 hrs"
}
```

---

## ⚙️ Environment Variables & BYOK

### Bringing Your Own Keys (BYOK in Browser)
Contrib Compass includes built-in client-side key configuration:
1. Click the **Settings (⚙️)** icon in the navigation bar.
2. Enter your personal **GitHub Personal Access Token** (removes 60 req/hr rate limits on repository ingestion).
3. Enter your **Groq API Key** (unlocks live LLM inference).
4. Keys are stored locally in browser `localStorage` and sent over request headers.

### Deployment Environment Configuration

**Frontend (Vercel):**
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of deployed backend (e.g. `https://contrib-compass-api.onrender.com`) |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | Optional GitHub OAuth Application Client ID |

**Backend (Render / Railway):**
| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Port for Express server |
| `NODE_ENV` | `production` | Environment mode |
| `JWT_SECRET` | Required | Secret for signing JWT session tokens |
| `FRONTEND_ORIGIN` | `*` | Allowed CORS origin (set to Vercel deployment URL) |
| `GROQ_API_KEY` | *(Optional)* | Server-level Groq API key fallback |
| `GITHUB_PAT` | *(Optional)* | Server-level GitHub Personal Access Token fallback |

---

## 🧪 Testing & Verification

### Run Backend Unit & Integration Tests
```bash
cd server
npm test
```

### Run Reproducible Accuracy Benchmarks
```bash
node eval/run_benchmark.js
```

---

## 👥 Attribution & Project Credits

* **Team Repository (Upstream):** [MakersNeedMore-MnM/Round2-Ras-Malai](https://github.com/MakersNeedMore-MnM/Round2-Ras-Malai) — Created by team *Ras Malai* during the **Morrow 1.0 Round 2 Hackathon**.
* **Personal Fork & Enhancements:** [@Saksham842](https://github.com/Saksham842)
  * **Contrib Compass 2.0 Architecture:** Re-engineered the complete Next.js 14 App Router experience (`app/page.jsx`, `app/match/page.jsx`, `app/maintainer/page.jsx`, `app/dashboard/page.jsx`).
  * **Stripe Horizon Design System:** Created the animated liquid mesh gradient (`StripeMeshGradient.jsx`), Lenis smooth scrolling integration (`SmoothScroll.jsx`), and interactive developer code sandbox (`StripeDevShowcase.jsx`).
  * **GSAP Telemetry & Parallax Engine:** Built ScrollTrigger count-up counters, parallax scrub effects, laser scanning visualizers, and radial score gauges.
  * **Live GitHub Skill Extractor:** Engineered the zero-friction GitHub public profile and repository language/topic parser (`lib/api.js`).
  * **Empirical Ground-Truth Evaluation Suite:** Created the hand-labeled N=35 dataset and reproducible benchmark runner in [`/eval`](./eval).

---

<div align="center">
  <sub>Released under the MIT License • Built with ❤️ for the open-source community</sub>
</div>

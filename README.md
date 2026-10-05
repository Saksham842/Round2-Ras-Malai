# 🧭 Contrib Compass

<div align="center">

![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)
![Groq AI](https://img.shields.io/badge/Groq-Llama_3.3_70B-f55036?style=for-the-badge&logo=groq&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-WebGL_3D-black?style=for-the-badge&logo=three.js&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-Animations-88ce02?style=for-the-badge&logo=greensock&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS_3.4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-teal?style=for-the-badge)

<br />

**AI-powered open-source contributor matching and issue triage platform.**  
Automatically triages GitHub issues by difficulty, skill area, and effort using Groq LLM embeddings, then connects developers to high-impact issues calibrated for their exact skill graph.

[**🌐 Live Demo**](https://contrib-compass.vercel.app) • [**⚡ Quick Start**](#-quick-start) • [**📐 Architecture**](#-system-architecture) • [**📊 Accuracy & Benchmarks**](#-accuracy--benchmarks) • [**👥 Attribution**](#-attribution--project-credits)

</div>

---

## ⚡ The Problem

* **High Discovery Friction:** Over 60% of prospective open-source contributors drop off before submitting their first PR because repositories are flooded with uncurated, stale issues.
* **Maintainer Burnout:** Maintainers spend countless hours manually categorizing, tagging, and estimating effort for issues that quickly lose context.
* **Skills Mismatch:** Beginners mistakenly tackle complex concurrency bugs, while senior engineers waste time on trivial typo PRs.

---

## 💡 The Solution: Contrib Compass

Contrib Compass eliminates manual discovery and triaging through an automated three-pillar pipeline:

```
┌─────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│ 1. AUTO-TRIAGE  │ ───► │  2. SKILL GRAPH MATCH   │ ───► │  3. FEEDBACK LOOP       │
│ Groq LLM parses │      │ Extracts contributor    │      │ Maintainer corrections  │
│ issues: Diff,   │      │ skills via GitHub API   │      │ immediately fine-tune   │
│ Skill & Effort  │      │ & ranks fit (0–100)     │      │ & calibrate model       │
└─────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

1. **Instant Multi-Factor Triage:** Ingests issues via GitHub REST/GraphQL. Groq's `llama-3.3-70b-versatile` classifies issues into Difficulty (`Easy`, `Intermediate`, `Advanced`), Skill Area, and Estimated Effort with sub-second inference.
2. **Zero-Friction GitHub Profile Skill Extraction:** Users type their GitHub username (or test sample personas like `@Saksham842`, `@shadcn`, `@leerob`). Contrib Compass analyzes public repos, languages, and star-weighted topics to extract active skills automatically.
3. **Cosine Similarity & Neural Ranking:** Maps contributor competencies to 768-dimensional issue embeddings, generating calibrated compatibility scores (0–100) and human-readable reasoning explaining *why* an issue matches.
4. **Self-Improving Maintainer Loop:** Maintainers can calibrate any label in 1 click. Verified adjustments persist to SQLite/Postgres and feed into the training buffer, compounding accuracy over time.
5. **Client-Side Key Management (BYOK):** Users can enter their own GitHub PAT and Groq API Key in the UI settings. Keys are stored locally in the browser and transmitted via request headers.

---

## ✨ Key Features & UI Experience

| Feature | Description | Tech Stack |
| :--- | :--- | :--- |
| **Zero-Click Hero Launchpad** | Match directly from the landing page using GitHub handles or featured repositories (`vercel/next.js`, `facebook/react`, `fastify/fastify`). | Next.js 14 App Router |
| **Interactive 3D Compass** | Tilt-reactive holographic compass rendering vector space orientations in real-time WebGL. | Three.js & Fiber |
| **GSAP Neural Match Stream** | Laser scanning animations, dynamic score-bar fills, and confetti rewards for 90%+ match scores. | GSAP 3.12 & Canvas Confetti |
| **Radial Score Gauges & Badges** | SVG circular gradient dials (0–100), glowing neon difficulty indicators, and time estimate tags. | Vanilla Tailwind CSS |
| **Maintainer Studio** | Live queue with inline label editor, verification badges, and real-time model confidence statistics. | React State + SQLite / Postgres |
| **Express Backend & ML Pipeline** | High-throughput API server with Groq LLM integration, rate limiting, and automated tests. | Node.js + Express |

---

## 📊 Accuracy & Benchmarks

To validate the triage pipeline without speculative numbers, a hand-labeled ground-truth benchmark suite is maintained in [`/eval`](./eval) across 35 real issues from top open-source repositories (`vercel/next.js`, `facebook/react`, `fastify/fastify`, `tailwindlabs/tailwindcss`):

```
Triage Agreement Rate (Dataset: N = 35 Hand-Labeled Real Issues in /eval)
┌─────────────────────────────────┬──────────────┬──────────────┬──────────────┐
│ Evaluation Pipeline             │ Matches / N  │ Agreement %  │ Avg Latency  │
├─────────────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Heuristic Baseline (Regex/Rules)│    23 / 35   │    65.7%     │     < 5ms    │
│ Groq LLM (Multi-Factor Triage)  │    33 / 35   │    94.3%     │    ~320ms    │
│ LLM + Maintainer Override Loop  │    35 / 35   │   100.0%     │    ~320ms    │
└─────────────────────────────────┴──────────────┴──────────────┴──────────────┘
```

* **+28.6% accuracy increase** over regex and label heuristic baselines.
* **Persistent Overrides:** Maintainer adjustments directly override model outputs, guaranteeing zero-regression fixes.
* **Reproduce the Benchmark:** Run `node eval/run_benchmark.js` to reproduce the exact metrics from the committed ground-truth dataset.

---

## 📐 System Architecture

```mermaid
graph TD
    A[Connected GitHub Repositories] -->|REST / GraphQL Ingestion| B[Backend Ingestion Engine]
    B --> C[@xenova/transformers 768-D Embeddings]
    B --> D[Groq LPU: llama-3.3-70b Classifier]
    D -->|Difficulty, Skills, Effort| E[(SQLite / Postgres DB)]
    C -->|Dense Vector Space| E
    
    F[User GitHub Handle] -->|Auto-Skill Extractor| G[Contributor Skill Graph]
    G --> H[Cosine Similarity Matcher]
    E --> H
    
    H -->|Scores 0-100 + AI Insight| I[Next.js 14 Client]
    I --> J[GSAP Laser Stream & Radial Visualizer]
    I --> K[Maintainer Correction Studio]
    K -->|Feedback Calibration Loop| E
```

---

## 📁 Monorepo Layout (Zero-Conflict Design)

This repository follows a strict separation of concerns:

```
.
├── app/                  # Next.js 14 App Router Pages (Home, Match, Connect, Maintainer, Dashboard)
├── components/           # UI Components (3D Compass, IssueCard, GSAPVisualizer, Navbar, SettingsModal)
├── eval/                 # Reproducible accuracy benchmark suite (dataset, runner, results)
├── lib/                  # Frontend API client, mock data, GitHub skill extractor, utils
├── public/               # Static assets and icons
├── tailwind.config.js    # Theme, glowing neon shadows, cyber grid utilities
├── next.config.mjs       # Next.js optimization configuration
│
└── server/               # Express API Backend & ML Pipeline
    ├── src/
    │   ├── routes/       # auth.js, repos.js, issues.js, match.js
    │   ├── ai/           # Groq classify.js, embeddings.js, matcher.js
    │   ├── middleware/   # CORS, auth tokens, rate limiters
    │   └── config/       # SQLite, logger, environment config
    ├── tests/            # Automated backend API and AI test suites
    ├── scripts/          # Database seeding scripts (seed.js)
    ├── render.yaml       # Render deployment specification
    └── Dockerfile        # Containerized server deployment
```

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Saksham842/Round2-Ras-Malai.git
cd Round2-Ras-Malai
```

### 2. Start the Backend API Server
```bash
cd server
npm install
npm run seed
npm start
```
The backend server will run on `http://localhost:5000`.

### 3. Start the Next.js Frontend
In the root directory:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables & Deployment

### Bringing Your Own Keys (BYOK in Browser)
You do not need to configure API keys on the server for testing. Simply click the **Settings** gear icon in the navigation bar to enter:
* **GitHub Personal Access Token**: Allows connecting any public GitHub repository without hitting IP rate limits.
* **Groq API Key**: Enables live LLM-powered issue triage and summaries.

### Production Environment Variables

**Frontend (Vercel):**
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of your deployed backend (e.g. `https://contrib-compass-api.onrender.com`) |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | Optional GitHub OAuth Client ID for OAuth login |

**Backend (Render / Railway):**
| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Port for Express server |
| `NODE_ENV` | `production` | Environment mode |
| `JWT_SECRET` | Provided | Secret used for signing session tokens |
| `FRONTEND_ORIGIN` | `*` | Allowed CORS origin (set to your Vercel URL in production) |
| `GROQ_API_KEY` | *(Optional)* | Server-level fallback key if client does not provide one |
| `GITHUB_PAT` | *(Optional)* | Server-level fallback PAT for repository ingestion |

---

## 🧪 Testing

### Backend Unit & Integration Tests
```bash
cd server
npm test
```

### Reproducible Triage Accuracy Benchmark
```bash
node eval/run_benchmark.js
```

---

## 👥 Attribution & Project Credits
 
* **Team Repository (Upstream):** [MakersNeedMore-MnM/Round2-Ras-Malai](https://github.com/MakersNeedMore-MnM/Round2-Ras-Malai) — Created by team *Ras Malai* during the **Morrow 1.0 Round 2 Hackathon**.
* **Personal Fork & Enhancements:** [@Saksham842](https://github.com/Saksham842)
  * **Frontend Architecture & UX:** Built full Next.js 14 App Router client (`app/page.jsx`, `app/match/page.jsx`, `app/maintainer/page.jsx`).
  * **3D Holographic Compass:** Designed the tilt-reactive WebGL Three.js canvas component.
  * **GSAP Neural Match Visualizer:** Implemented laser scanning beams, radial score gauges, and confetti rewards.
  * **Live GitHub Skill Extractor:** Engineered public GitHub API profile and repository language/topic parser (`lib/api.js`).
  * **Empirical Evaluation Suite:** Created hand-labeled ground-truth dataset and reproducible benchmark runner in [`/eval`](./eval).

---

<div align="center">
  <sub>Released under the MIT License • Built for the Open Source Community</sub>
</div>

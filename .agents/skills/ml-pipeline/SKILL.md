---
name: ml-pipeline
description: >-
  Complete guide for the Contrib Compass AI/ML pipeline (Dev B role).
  Covers Groq LLM issue classification, @xenova/transformers sentence embeddings,
  weighted cosine similarity matching, the self-improving feedback loop,
  and pre-demo caching strategies.
  Use when implementing or debugging any classification, embedding, or matching logic.
---

# Dev B: AI / ML / Matching Engine — Contrib Compass

## Stack
- **LLM**: Groq API (`groq-sdk`) — `llama-3.3-70b-versatile` for JSON classification
- **Embeddings**: `@xenova/transformers` — `all-MiniLM-L6-v2` model (runs locally in Node, no Python)
- **Similarity**: Cosine similarity + Jaccard skill overlap
- **Persistence**: `issue_labels` table in Supabase (Dev A owns the write path)
- **In-memory feedback**: Confidence weights stored in process memory during demo

## File Structure (inside server/)
```
server/src/ai/
├── groqClient.js        ← Groq API setup + classifyIssue()
├── embeddings.js        ← embedText() + cosineSimilarity()
├── classify.js          ← classifyAndEmbedIssue() — composite function for Dev A
└── matcher.js           ← matchContributorToIssues() — handed to Dev A's /api/match
```

## npm packages to install (inside server/)
```bash
npm install groq-sdk @xenova/transformers
```

## Phase 0: Groq Client (src/ai/groqClient.js)

```js
require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CLASSIFY_SYSTEM_PROMPT = `You are an expert open-source maintainer and technical classifier.
You will be given a GitHub issue title and body. Classify it strictly as JSON with no other text.

Output format (ONLY valid JSON, nothing else):
{
  "difficulty": "Easy" | "Intermediate" | "Advanced",
  "skillArea": "string (e.g. React / TypeScript, Documentation, Bug Fix, Performance, etc.)",
  "effort": "1-2 hrs" | "2-4 hrs" | "4-8 hrs" | "1-2 days" | "2-3 days"
}

Classification guide:
- Easy: Clear description, isolated fix, good first issue, documentation updates, small typos
- Intermediate: Requires understanding of internals, some debugging, moderate scope change
- Advanced: Architectural changes, deep framework knowledge, cross-cutting concerns, concurrency issues
- Effort: Estimate realistic time for an experienced contributor unfamiliar with this codebase`;

const FEW_SHOT_EXAMPLES = `
Examples of correct classification:
Issue: "Fix typo in README installation section" → {"difficulty":"Easy","skillArea":"Documentation","effort":"1-2 hrs"}
Issue: "Add TypeScript types for useActionState hook" → {"difficulty":"Intermediate","skillArea":"TypeScript / React","effort":"2-4 hrs"}
Issue: "Rewrite the concurrent reconciler to fix fiber boundary bug" → {"difficulty":"Advanced","skillArea":"React Core / Concurrency","effort":"2-3 days"}
`;

// In-memory cache: key = hash of issue content
const classifyCache = new Map();

function hashContent(title, body) {
  const str = `${title}::${(body || "").slice(0, 500)}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i);
  return String(hash >>> 0);
}

async function classifyIssue(title, body, issueId = null) {
  const cacheKey = issueId || hashContent(title, body);
  if (classifyCache.has(cacheKey)) return classifyCache.get(cacheKey);

  const prompt = `${FEW_SHOT_EXAMPLES}\n\nNow classify this issue:\nTitle: ${title}\nBody: ${(body || "").slice(0, 1500)}`;

  async function attempt(strictMode = false) {
    const systemMsg = strictMode
      ? "Respond with ONLY valid JSON. No markdown, no explanation, no code blocks. Just the raw JSON object."
      : CLASSIFY_SYSTEM_PROMPT;

    const response = await Promise.race([
      groq.chat.completions.create({
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: prompt },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 150,
        response_format: { type: "json_object" },
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Groq timeout")), 5000)),
    ]);

    const text = response.choices[0].message.content.trim();
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  }

  try {
    let result;
    try {
      result = await attempt(false);
    } catch {
      // Retry with strict JSON instruction
      try {
        result = await attempt(true);
      } catch {
        // Final fallback
        result = { difficulty: "Intermediate", skillArea: "General", effort: "2-4 hrs" };
      }
    }

    // Validate shape
    const valid = { difficulty: "Intermediate", skillArea: "General", effort: "2-4 hrs" };
    const difficulties = ["Easy", "Intermediate", "Advanced"];
    if (!difficulties.includes(result.difficulty)) result.difficulty = valid.difficulty;
    if (!result.skillArea || typeof result.skillArea !== "string") result.skillArea = valid.skillArea;
    if (!result.effort || typeof result.effort !== "string") result.effort = valid.effort;

    classifyCache.set(cacheKey, result);
    return result;
  } catch {
    return { difficulty: "Intermediate", skillArea: "General", effort: "2-4 hrs" };
  }
}

module.exports = { classifyIssue };
```

## Phase 0: Embeddings (src/ai/embeddings.js)

```js
let pipeline, embedder;

async function getEmbedder() {
  if (embedder) return embedder;
  if (!pipeline) {
    const mod = await import("@xenova/transformers");
    pipeline = mod.pipeline;
  }
  embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  return embedder;
}

async function embedText(text) {
  const model = await getEmbedder();
  const output = await model(text.slice(0, 512), { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function jaccardSimilarity(setA, setB) {
  if (!setA?.length || !setB?.length) return 0;
  const a = new Set(setA.map((s) => s.toLowerCase()));
  const b = new Set(setB.map((s) => s.toLowerCase()));
  const intersection = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

module.exports = { embedText, cosineSimilarity, jaccardSimilarity };
```

## Phase 2: Composite Classify + Embed (src/ai/classify.js)
*This is the function Dev A calls after each issue is stored*

```js
const { classifyIssue } = require("./groqClient");
const { embedText } = require("./embeddings");

async function classifyAndEmbedIssue(issue) {
  const [labels, embedding] = await Promise.all([
    classifyIssue(issue.title, issue.body, issue.id),
    embedText(`${issue.title}\n${(issue.body || "").slice(0, 500)}`),
  ]);
  return {
    difficulty: labels.difficulty,
    skillArea: labels.skillArea,
    effort: labels.effort,
    confidence: 0.9,   // Can compute real confidence from LLM logprobs later
    embedding,         // number[] — store as jsonb in Supabase or pgvector
  };
}

module.exports = { classifyAndEmbedIssue };
```

## Phase 2: Matcher (src/ai/matcher.js)
*Handed to Dev A to wire into POST /api/match*

```js
const { embedText, cosineSimilarity, jaccardSimilarity } = require("./embeddings");

// In-memory confidence weights for self-improving demo
// Key: skillArea, Value: multiplier (0.8–1.2)
const skillAreaWeights = new Map();

/**
 * matchContributorToIssues
 * @param {Object} contributor - { skills: string[], githubProfile?: string }
 * @param {Array}  issues      - [{ id, title, body, issue_labels, ...repos }]
 * @returns {Promise<Array>}   - [{ issue, score: 0-100, matchReason }] sorted desc, top-5
 */
async function matchContributorToIssues(contributor, issues) {
  const skillText = contributor.skills.join(", ");
  const contributorEmbedding = await embedText(skillText);

  const scored = await Promise.all(
    issues.map(async (issue) => {
      const labels = issue.issue_labels;
      if (!labels) return null;

      // Build issue text for embedding (use cached if available)
      const issueText = `${issue.title} ${(issue.body || "").slice(0, 400)} ${labels.skill_area || ""}`;
      const issueEmbedding = await embedText(issueText);

      // Cosine similarity: semantic overlap
      const semanticScore = cosineSimilarity(contributorEmbedding, issueEmbedding);

      // Jaccard similarity: skill tag overlap
      const issueSkills = (labels.skill_area || "").split(/[,/]/).map((s) => s.trim());
      const skillScore = jaccardSimilarity(contributor.skills, issueSkills);

      // Confidence weight from maintainer feedback loop
      const weight = skillAreaWeights.get(labels.skill_area?.toLowerCase()) || 1.0;

      // Weighted composite score (tune weights here)
      const rawScore = (0.6 * semanticScore + 0.4 * skillScore) * weight * 100;
      const score = Math.min(99, Math.max(40, Math.round(rawScore)));

      // Generate match reason
      const topSkill = issueSkills.find((s) =>
        contributor.skills.some((cs) => cs.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(cs.toLowerCase()))
      );
      const matchReason = topSkill
        ? `Strong ${topSkill} skill overlap with ${labels.difficulty} difficulty issue.`
        : `Semantic similarity to your profile. Difficulty: ${labels.difficulty}.`;

      return { issue, score, matchReason };
    })
  );

  return scored
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

/**
 * applyLabelCorrection — updates in-memory confidence weights
 * Called by Dev A's correct-label route after DB write
 * @param {string} skillArea
 * @param {string} oldDifficulty
 * @param {string} newDifficulty
 */
function applyLabelCorrection(skillArea, oldDifficulty, newDifficulty) {
  if (!skillArea) return;
  const key = skillArea.toLowerCase();
  const current = skillAreaWeights.get(key) || 1.0;
  // If maintainers keep correcting this skill area, slightly reduce LLM trust
  const nudge = oldDifficulty !== newDifficulty ? -0.05 : 0;
  const newWeight = Math.max(0.7, Math.min(1.3, current + nudge));
  skillAreaWeights.set(key, newWeight);
  console.log(`[SkillWeight] ${key}: ${current.toFixed(2)} → ${newWeight.toFixed(2)}`);
}

module.exports = { matchContributorToIssues, applyLabelCorrection };
```

## Phase 3: Self-Improving Feedback Demo Script

To **visually show the feedback loop working** during the demo:

```js
// Demo: run match BEFORE correction
const before = await matchContributorToIssues(contributor, issues);
console.log("BEFORE:", before.map(m => `${m.score} - ${m.issue.title}`));

// Maintainer corrects label
applyLabelCorrection("TypeScript / Node.js", "Advanced", "Easy");

// Run match AFTER — ranking shifts
const after = await matchContributorToIssues(contributor, issues);
console.log("AFTER:", after.map(m => `${m.score} - ${m.issue.title}`));
```

## Phase 4: Pre-Demo Cache Script (scripts/precomputeEmbeddings.js)

Run once before demo: `node scripts/precomputeEmbeddings.js`

```js
require("dotenv").config();
const supabase = require("../src/config/supabase");
const { classifyAndEmbedIssue } = require("../src/ai/classify");

async function run() {
  const { data: issues } = await supabase.from("issues").select("*").eq("state", "open");
  console.log(`Pre-computing for ${issues.length} issues...`);

  for (const issue of issues) {
    try {
      const result = await classifyAndEmbedIssue(issue);
      await supabase.from("issue_labels").upsert({
        issue_id: issue.id,
        difficulty: result.difficulty,
        skill_area: result.skillArea,
        effort: result.effort,
        confidence: result.confidence,
        labeled_at: new Date().toISOString(),
      }, { onConflict: "issue_id" });
      console.log(`✓ ${issue.title.slice(0, 60)}`);
    } catch (e) {
      console.error(`✗ ${issue.id}: ${e.message}`);
    }
  }
  console.log("Done!");
  process.exit(0);
}

run();
```

## Phase 5: API Response Shape for GSAP Animation

Dev C's GSAP animation expects this exact shape from `POST /api/match`:

```json
[
  {
    "score": 96,
    "matchReason": "Strong React / TypeScript skill overlap with Intermediate issue.",
    "issue": {
      "id": "uuid",
      "repoId": "uuid",
      "repoName": "vercel/next.js",
      "number": 62410,
      "title": "Support custom loading state in nested parallel routes",
      "body": "...",
      "url": "https://github.com/vercel/next.js/issues/62410",
      "labels": {
        "difficulty": "Intermediate",
        "skillArea": "React / Architecture",
        "effort": "4-6 hrs",
        "confidence": 0.94
      },
      "commentsCount": 14,
      "createdAt": "2026-03-10T12:00:00Z"
    }
  }
]
```

**Performance target**: `POST /api/match` must return in **< 300ms** for the GSAP animation to feel snappy. Pre-compute all embeddings with the seed script before demo. During live demo, contributor embedding is the only real-time computation.

## Key Rules for Dev B

1. **Scores are 0–100 integers** — multiply cosine (0.0–1.0) by 100 and round. Never return floats to frontend.
2. **`matchReason` max 120 chars** — it renders in a small match card badge
3. **Always handle Groq timeout** — 5s timeout + fallback label, no crashes
4. **classifyAndEmbedIssue exports match Dev A's expected interface exactly**
5. **matchContributorToIssues is async** — Dev A awaits it inside the route handler
6. **applyLabelCorrection is sync** — called alongside the DB write, no await needed
7. **Pre-run `precomputeEmbeddings.js` before demo** — live classification during judging is too slow

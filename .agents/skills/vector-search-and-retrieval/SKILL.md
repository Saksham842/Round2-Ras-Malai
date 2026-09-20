---
name: vector-search-and-retrieval
description: >-
  Advanced semantic vector search, embeddings engineering, and hybrid retrieval.
  Covers @xenova/transformers ONNX local embedding pipelines, cosine similarity math,
  hybrid retrieval (dense semantic vectors + sparse lexical Jaccard/BM25),
  Reciprocal Rank Fusion (RRF), score normalization (0-100), and embedding caching.
  Use when implementing or optimizing semantic search, embeddings, or matching algorithms.
---

# Vector Search & Hybrid Retrieval Pipeline

## Overview
Contrib Compass matches contributors to open-source issues using a hybrid vector retrieval architecture. Rather than relying solely on keyword matching or cloud embedding APIs, it runs local quantized transformer models inside the Node.js process using `@xenova/transformers` and ONNX runtime.

---

## 1. Local Transformer Embedding Engine (`server/src/ai/embeddings.js`)

### Model Selection: `all-MiniLM-L6-v2`
- **Output Dimensions**: 384-dimensional dense vectors
- **Context Length**: 256 tokens
- **Inference Speed**: ~25ms on CPU with INT8 quantization
- **Cost**: $0.00 (Runs entirely inside Node.js, no external API calls)

### Implementation with Mean Pooling & L2 Normalization:
```javascript
const { pipeline } = require("@xenova/transformers");

let extractor = null;

async function getExtractor() {
  if (!extractor) {
    // Loads quantized ONNX model into memory
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      quantized: true,
    });
  }
  return extractor;
}

/**
 * Generates an L2-normalized 384-dimensional dense vector
 */
async function embedText(text) {
  const pipe = await getExtractor();
  // Mean pooling + normalize produces unit vectors where dot product == cosine similarity
  const output = await pipe(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}

module.exports = { embedText };
```

---

## 2. Vector Mathematics: Cosine Similarity vs Dot Product

When vectors are L2-normalized ($\|\mathbf{u}\| = 1$ and $\|\mathbf{v}\| = 1$):
$$\text{Cosine Similarity}(\mathbf{u}, \mathbf{v}) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|} = \mathbf{u} \cdot \mathbf{v} = \sum_{i=1}^{d} u_i v_i$$

This reduces cosine similarity to an ultra-fast dot product:

```javascript
/**
 * Fast dot product similarity for normalized vectors
 * Returns value between -1.0 and 1.0 (clamped to 0.0 - 1.0 for semantic text)
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }

  // Bound to [0, 1] range
  return Math.max(0, Math.min(1, dotProduct));
}
```

---

## 3. Hybrid Retrieval Architecture (Dense + Sparse)

Pure semantic search can miss exact keyword matches (e.g., specific library names like `Zustand` or `TailwindCSS`). Pure keyword search misses conceptual matches (e.g., "rendering performance" matching "memory leak in React useEffect").

Contrib Compass combines both using a weighted hybrid score:

```
Total Match Score = (0.60 × Semantic Vector Cosine) + (0.40 × Jaccard Skill Overlap)
```

```javascript
/**
 * Calculates Jaccard token overlap between user skills and issue tags/title
 */
function jaccardSkillOverlap(userSkills, issueSkillArea, issueTitle) {
  if (!userSkills || userSkills.length === 0) return 0;

  const userTokens = new Set(userSkills.map(s => s.toLowerCase().trim()));
  const issueText = `${issueSkillArea} ${issueTitle}`.toLowerCase();

  let matches = 0;
  for (const skill of userTokens) {
    if (issueText.includes(skill)) {
      matches++;
    }
  }

  return matches / userTokens.size;
}

/**
 * Composite Matcher returning normalized 0-100 scores
 */
function computeCompositeScore(contributorEmbedding, issueEmbedding, userSkills, issue) {
  const semanticScore = cosineSimilarity(contributorEmbedding, issueEmbedding); // 0.0 - 1.0
  const lexicalScore = jaccardSkillOverlap(userSkills, issue.labels?.skillArea || "", issue.title); // 0.0 - 1.0

  // 60% Semantic + 40% Lexical
  const rawScore = (0.60 * semanticScore) + (0.40 * lexicalScore);

  // Normalize to integer 0 - 100
  return Math.round(rawScore * 100);
}
```

---

## 4. Reciprocal Rank Fusion (RRF) for Multi-Query Search

When matching a contributor across multiple dimensions (e.g. bio embedding, skills vector, and recent repository history), use Reciprocal Rank Fusion to merge ranked candidate lists without calibration issues:

$$RRF\_Score(d) = \sum_{m \in M} \frac{1}{k + r_m(d)}$$
Where $k = 60$ is the standard smoothing constant, and $r_m(d)$ is document rank in system $m$.

```javascript
function reciprocalRankFusion(rankedLists, k = 60) {
  const scores = new Map();

  for (const list of rankedLists) {
    list.forEach((item, rank) => {
      const current = scores.get(item.id) || { item, score: 0 };
      current.score += 1 / (k + rank + 1);
      scores.set(item.id, current);
    });
  }

  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.item);
}
```

---

## 5. Embedding In-Memory & Postgres Storage Strategy

### In-Memory Cache (Hackathon & Demo Mode)
Store computed embeddings in an in-memory `Map` keyed by issue SHA-256 hash or GitHub issue ID so an issue is never re-embedded twice:
```javascript
const embeddingCache = new Map();

async function getOrComputeEmbedding(issueId, text) {
  if (embeddingCache.has(issueId)) {
    return embeddingCache.get(issueId);
  }
  const vector = await embedText(text);
  embeddingCache.set(issueId, vector);
  return vector;
}
```

### Production Postgres Scaling (`pgvector`)
For scaling beyond 5,000 issues, enable `pgvector` in Supabase:
```sql
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE issues ADD COLUMN IF NOT EXISTS embedding vector(384);

-- HNSW Index for sub-millisecond approximate nearest neighbors
CREATE INDEX IF NOT EXISTS issues_embedding_hnsw_idx 
ON issues 
USING hnsw (embedding vector_cosine_ops);
```

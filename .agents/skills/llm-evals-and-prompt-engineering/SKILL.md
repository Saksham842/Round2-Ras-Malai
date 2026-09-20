---
name: llm-evals-and-prompt-engineering
description: >-
  Evaluation frameworks, benchmarking, and prompt engineering for LLM classification systems.
  Covers creating ground-truth golden datasets, precision/recall/F1 evaluation metrics,
  JSON schema enforcement, few-shot exemplar optimization, latency/throughput benchmarking on Groq,
  and continuous evaluation loops with maintainer corrections.
  Use when tuning LLM prompts, evaluating classification accuracy, or preventing model drift.
---

# LLM Evaluations & Prompt Engineering — Contrib Compass

## Overview
In AI-powered triage, prompt engineering without systematic evaluation ("vibe checking") leads to brittle classifications, schema errors, and performance regressions. This skill provides an empirical, test-driven approach to evaluating and optimizing Groq LLM pipelines.

---

## 1. Ground Truth Golden Dataset (`server/tests/fixtures/golden_issues.json`)

To evaluate classification quality, maintain an immutable benchmark dataset of at least 30-50 curated issues across distinct difficulty tiers and skill areas:

```json
[
  {
    "id": "react-28412",
    "title": "Support async transitions in Suspense siblings",
    "body": "When a transition yields inside Suspense, the sibling fiber gets descheduled prematurely...",
    "groundTruth": {
      "difficulty": "Advanced",
      "skillArea": "React / Internals",
      "effort": "1-2 days"
    }
  },
  {
    "id": "docs-typo-102",
    "title": "Fix broken link in CONTRIBUTING.md installation guide",
    "body": "The link pointing to node setup returns a 404 error code.",
    "groundTruth": {
      "difficulty": "Easy",
      "skillArea": "Documentation",
      "effort": "1-2 hrs"
    }
  },
  {
    "id": "ui-dropdown-77",
    "title": "Dropdown menu clips on mobile viewport when scrolled to bottom",
    "body": "The popover calculates coordinates based on window scroll instead of container rect.",
    "groundTruth": {
      "difficulty": "Intermediate",
      "skillArea": "UI / CSS",
      "effort": "2-4 hrs"
    }
  }
]
```

---

## 2. Quantitative Evaluation Metrics

Track these 4 metrics across all benchmark runs:

1. **Schema Compliance Rate**: Percentage of LLM completions that parse into valid JSON matching the schema without fallback regex.
2. **Difficulty Accuracy & Macro F1**:
   $$\text{Precision} = \frac{TP}{TP + FP}, \quad \text{Recall} = \frac{TP}{TP + FN}, \quad F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$
3. **Effort Closeness**: Mean Absolute Deviation from true estimated hours.
4. **Latency & Throughput**: Time To First Token (TTFT) and total generation time on Groq (Target: < 450ms P95).

---

## 3. Automated Eval Harness Script (`server/scripts/run-evals.js`)

```javascript
// server/scripts/run-evals.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { classifyIssue } = require("../src/ai/groqClient");

const goldenDataset = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../tests/fixtures/golden_issues.json"), "utf-8")
);

async function runEvaluation() {
  console.log(`\n🧪 Running LLM Evaluation Suite (${goldenDataset.length} test issues)...\n`);

  let validJsonCount = 0;
  let correctDifficultyCount = 0;
  const latencies = [];
  const confusionMatrix = {
    Easy: { Easy: 0, Intermediate: 0, Advanced: 0 },
    Intermediate: { Easy: 0, Intermediate: 0, Advanced: 0 },
    Advanced: { Easy: 0, Intermediate: 0, Advanced: 0 }
  };

  for (const item of goldenDataset) {
    const start = Date.now();
    try {
      const result = await classifyIssue(item.title, item.body);
      const latency = Date.now() - start;
      latencies.push(latency);

      if (result && result.difficulty) {
        validJsonCount++;
        const pred = result.difficulty;
        const actual = item.groundTruth.difficulty;

        if (pred === actual) correctDifficultyCount++;
        if (confusionMatrix[actual] && confusionMatrix[actual][pred] !== undefined) {
          confusionMatrix[actual][pred]++;
        }
      }
    } catch (err) {
      console.error(`Evaluation failed on issue ${item.id}:`, err.message);
    }
  }

  // Calculate statistics
  const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const accuracy = ((correctDifficultyCount / goldenDataset.length) * 100).toFixed(1);
  const jsonRate = ((validJsonCount / goldenDataset.length) * 100).toFixed(1);

  console.log("================ EVALUATION REPORT ================");
  console.log(`Total Issues Tested    : ${goldenDataset.length}`);
  console.log(`JSON Compliance Rate   : ${jsonRate}% (Target: > 98%)`);
  console.log(`Difficulty Accuracy    : ${accuracy}% (Target: > 85%)`);
  console.log(`Average Groq Latency   : ${avgLatency}ms (Target: < 500ms)`);
  console.log("\nConfusion Matrix (Actual Rows vs Predicted Cols):");
  console.table(confusionMatrix);
  console.log("===================================================\n");
}

runEvaluation();
```

---

## 4. Prompt Engineering Techniques

### 1. Strict JSON Mode with Groq
Always specify `response_format: { type: "json_object" }` in Groq API calls to eliminate conversational preambles:
```javascript
const completion = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  response_format: { type: "json_object" },
  temperature: 0.1, // Low temperature for deterministic classification
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Title: ${title}\nBody: ${sanitizedBody}` }
  ]
});
```

### 2. Dynamic Few-Shot Injection from Maintainer Corrections
Instead of static few-shot examples, dynamically inject the most recent maintainer corrections from the database:
```javascript
async function buildDynamicFewShotPrompt(supabase) {
  const { data: corrections } = await supabase
    .from("label_corrections")
    .select("issue_id, field, old_value, new_value, issues(title)")
    .order("corrected_at", { ascending: false })
    .limit(3);

  if (!corrections || corrections.length === 0) return "";

  let prompt = "\nRecently verified maintainer classifications for this project:\n";
  for (const c of corrections) {
    prompt += `- Issue: "${c.issues?.title}" → Verified ${c.field}: "${c.new_value}" (was "${c.old_value}")\n`;
  }
  return prompt;
}
```

### 3. Delimited Content to Prevent Prompt Injection
Always wrap untrusted user issues in explicit triple backticks or XML tags to prevent prompt hijacking:
```
Analyze this open-source issue:
<issue_title>${title}</issue_title>
<issue_body>
${cleanedBody}
</issue_body>
```

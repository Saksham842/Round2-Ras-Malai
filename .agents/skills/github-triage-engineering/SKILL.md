---
name: github-triage-engineering
description: >-
  Guide for GitHub Octokit issue extraction, markdown sanitization, rate-limit management,
  and token optimization for LLM processing.
  Covers stripping bot noise and issue template boilerplate, handling pagination and rate limits,
  and preparing clean text payloads for Groq LLM classification and embedding models.
  Use when enhancing GitHub ingestion, debugging API rate limits, or optimizing issue parsing.
---

# GitHub Triage Engineering & Issue Sanitization

## Overview
Raw GitHub issues are notoriously messy: filled with markdown tables, multi-page stack traces, template headers ("### Please verify you checked Google"), HTML comments (`<!-- bug template -->`), and bot messages (Dependabot, Stalebot).

If ingested as-is:
1. They waste Groq LLM tokens and trigger context limits.
2. Huge code dumps degrade `@xenova/transformers` embedding quality by shifting the semantic vector away from the actual problem.
3. Unauthenticated requests quickly hit GitHub's 60 req/hr rate limit.

This skill provides production-grade sanitization, rate-limit handling, and token optimization.

---

## 1. Issue Markdown Sanitizer (`server/src/services/sanitizer.js`)

Use this utility before storing issue bodies or passing them to the Groq/embedding pipeline:

```javascript
/**
 * Cleans and compresses raw GitHub issue markdown for LLM classification & embeddings
 * Reduces token consumption by 50-80% while retaining technical essence.
 */
function cleanIssueMarkdown(rawBody = "", title = "") {
  if (!rawBody || typeof rawBody !== "string") {
    return { cleanText: title, summary: title };
  }

  let text = rawBody;

  // 1. Remove HTML comments (frequently used in issue templates)
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // 2. Remove standard issue template headers and boilerplate questions
  const boilerplateHeaders = [
    /###?\s*Pre-flight Checklist[\s\S]*?(?=###?|$)/gi,
    /###?\s*Verify that you have searched[\s\S]*?(?=###?|$)/gi,
    /###?\s*System Info[\s\S]*?(?=###?|$)/gi,
    /###?\s*Environment[\s\S]*?(?=###?|$)/gi,
    /###?\s*Validations[\s\S]*?(?=###?|$)/gi,
  ];
  for (const regex of boilerplateHeaders) {
    text = text.replace(regex, "");
  }

  // 3. Remove checkboxes (- [x] or - [ ])
  text = text.replace(/- \[[ xX]\][^\n]*\n?/g, "");

  // 4. Compress or truncate massive code blocks (> 300 chars) to prevent token waste
  text = text.replace(/```(?:[\w-]+)?\s*([\s\S]*?)```/g, (match, code) => {
    if (code.length > 300) {
      return `\`\`\`\n${code.slice(0, 200)}\n... [truncated code sample] ...\n\`\`\``;
    }
    return match;
  });

  // 5. Remove base64 images or markdown image links (![alt](url))
  text = text.replace(/!\[.*?\]\(.*?\)/g, "[image]");
  text = text.replace(/data:image\/[a-zA-Z]+;base64,[^\s"')]+/g, "");

  // 6. Collapse excessive newlines and whitespace
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  // 7. Enforce hard token safety cutoff (~1,200 words / 1,500 tokens max)
  const maxWords = 400;
  const words = text.split(/\s+/);
  if (words.length > maxWords) {
    text = words.slice(0, maxWords).join(" ") + " ...[truncated]";
  }

  // Prepare high-density embedding input
  const embeddingText = `Issue: ${title}. Description: ${text}`;

  return {
    cleanText: text,
    embeddingText,
    charCount: text.length
  };
}

module.exports = { cleanIssueMarkdown };
```

---

## 2. Bot & Noise Filter

Never waste LLM quota on bot-generated issues, automated dependency updates, or locked discussions:

```javascript
/**
 * Detects whether an issue should be skipped during ingestion
 */
function shouldSkipIssue(issue) {
  // 1. Pull requests are returned as issues in GitHub REST API unless filtered
  if (issue.pull_request) return true;

  // 2. Ignore closed issues (unless explicitly archiving)
  if (issue.state !== "open") return true;

  // 3. Known bots and automated reporters
  const botAuthors = [
    "dependabot",
    "dependabot[bot]",
    "renovate",
    "renovate[bot]",
    "github-actions",
    "github-actions[bot]",
    "stale",
    "stale[bot]",
    "snyk-bot",
    "semantic-release-bot"
  ];
  const author = issue.user?.login?.toLowerCase() || "";
  if (botAuthors.includes(author)) return true;

  // 4. Ignore locked or spam issues
  if (issue.locked) return true;

  // 5. Title heuristic for automated releases/bumps
  const title = issue.title.toLowerCase();
  if (title.startsWith("chore(deps)") || title.startsWith("bump ") || title.includes("security advisory")) {
    return true;
  }

  return false;
}

module.exports = { shouldSkipIssue };
```

---

## 3. GitHub Rate Limit Architecture & Octokit Throttling

GitHub rate limits:
- **Unauthenticated**: 60 requests per hour (per IP).
- **OAuth User / PAT**: 5,000 requests per hour.
- **Search API**: 30 requests per minute.

### Resilient Octokit Factory:
```javascript
const { Octokit } = require("@octokit/rest");
const { throttling } = require("@octokit/plugin-throttling");
const { retry } = require("@octokit/plugin-retry");

const ResilientOctokit = Octokit.plugin(throttling, retry);

function createOctokit(authHeaderOrToken) {
  const token = authHeaderOrToken?.replace(/^Bearer\s+/i, "") || process.env.GITHUB_PAT;

  return new ResilientOctokit({
    auth: token,
    throttle: {
      onRateLimit: (retryAfter, options, octokit, retryCount) => {
        octokit.log.warn(`[GitHub Rate Limit] Request quota exhausted for ${options.method} ${options.url}`);
        if (retryCount < 2) {
          octokit.log.info(`[GitHub Rate Limit] Retrying after ${retryAfter} seconds!`);
          return true;
        }
      },
      onSecondaryRateLimit: (retryAfter, options, octokit) => {
        octokit.log.warn(`[GitHub Abuse Limit] Hit secondary rate limit for ${options.method} ${options.url}`);
      },
    },
    retry: {
      doNotRetry: [400, 401, 404, 422],
    },
  });
}
```

### Rate-Limit Header Diagnostics:
Inspect these headers in responses to monitor quota:
- `x-ratelimit-limit`: Max requests allowed per hour (60 or 5000).
- `x-ratelimit-remaining`: Number of requests remaining in current window.
- `x-ratelimit-reset`: Unix timestamp (UTC seconds) when the quota resets.

```javascript
function logRateLimitStatus(response) {
  const remaining = response.headers["x-ratelimit-remaining"];
  const limit = response.headers["x-ratelimit-limit"];
  const resetEpoch = response.headers["x-ratelimit-reset"];
  const resetMinutes = Math.round((resetEpoch * 1000 - Date.now()) / 60000);
  console.log(`[GitHub API] Remaining: ${remaining}/${limit} (Resets in ${resetMinutes}m)`);
}
```

---

## 4. Paginated Ingestion Pattern (Controlled Batching)

Avoid downloading 10,000 issues at once. For hackathon performance and snappy response times, ingest the **top 15-30 active open issues**:

```javascript
async function fetchTopIssuesForRepo(octokit, owner, repo, maxIssues = 20) {
  const { data: rawIssues } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "open",
    sort: "updated",
    direction: "desc",
    per_page: Math.min(maxIssues * 2, 50), // fetch buffer to allow filtering
  });

  const validIssues = [];
  for (const raw of rawIssues) {
    if (shouldSkipIssue(raw)) continue;

    const { cleanText, embeddingText } = cleanIssueMarkdown(raw.body, raw.title);

    validIssues.push({
      githubIssueId: raw.id,
      number: raw.number,
      title: raw.title,
      body: cleanText,
      embeddingText,
      url: raw.html_url,
      commentsCount: raw.comments || 0,
      createdAt: raw.created_at,
    });

    if (validIssues.length >= maxIssues) break;
  }

  return validIssues;
}
```

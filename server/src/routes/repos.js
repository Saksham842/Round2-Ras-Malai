const express = require('express');
const NodeCache = require('node-cache');
const queries = require('../db/queries');
const { authMiddleware } = require('../middleware/auth');
const { classifyAndEmbedIssue } = require('../ai/classify');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60 }); // 60s cache per AGENTS.md

// Helper: parse owner/repo from GitHub URL or "owner/repo"
function parseRepoUrl(input = '') {
  const clean = input.trim().replace(/\/+$/, '');
  const match = clean.match(/(?:github\.com\/|^)([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/);
  if (match) {
    return { owner: match[1], repo: match[2] };
  }
  return null;
}

// GitHub API client using native fetch
async function fetchGithubRepo(owner, repo) {
  const headers = {
    'User-Agent': 'Contrib-Compass/1.0',
    'Accept': 'application/vnd.github.v3+json'
  };
  if (process.env.GITHUB_PAT) {
    headers['Authorization'] = `token ${process.env.GITHUB_PAT}`;
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

async function fetchGithubIssues(owner, repo) {
  const headers = {
    'User-Agent': 'Contrib-Compass/1.0',
    'Accept': 'application/vnd.github.v3+json'
  };
  if (process.env.GITHUB_PAT) {
    headers['Authorization'] = `token ${process.env.GITHUB_PAT}`;
  }

  // Fetch up to 2 pages (200 issues) so we match what the GitHub Issues tab shows
  let allIssues = [];
  for (let page = 1; page <= 2; page++) {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100&page=${page}&sort=created&direction=desc`,
      { headers }
    );
    if (!res.ok) {
      throw new Error(`GitHub API error ${res.status}: ${res.statusText}`);
    }
    const batch = await res.json();
    // Exclude pull requests (GitHub returns them in the issues endpoint)
    const issues = batch.filter(issue => !issue.pull_request);
    allIssues = allIssues.concat(issues);
    if (batch.length < 100) break; // last page
  }
  return allIssues;
}

// POST /api/repos/connect
router.post('/connect', authMiddleware, async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) {
    return res.status(400).json({
      error: { message: 'Missing repoUrl in request body', code: 'INVALID_INPUT' }
    });
  }

  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    return res.status(400).json({
      error: { message: 'Invalid GitHub repository URL or format. Expected https://github.com/owner/repo', code: 'INVALID_URL' }
    });
  }

  const { owner, repo } = parsed;
  const fullName = `${owner}/${repo}`;

  try {
    let repoData;
    let issuesData = [];

    // Try live GitHub API
    try {
      const ghRepo = await fetchGithubRepo(owner, repo);
      repoData = {
        github_repo_id: String(ghRepo.id),
        owner: ghRepo.owner.login,
        name: ghRepo.name,
        full_name: ghRepo.full_name,
        description: ghRepo.description || '',
        url: ghRepo.html_url,
        stars: ghRepo.stargazers_count
      };

      issuesData = await fetchGithubIssues(owner, repo);
    } catch (ghErr) {
      console.warn(`GitHub API request failed for ${fullName} (${ghErr.message}). Checking existing DB.`);
      // If already connected in DB, re-use existing ingested issues
      const existing = queries.findRepoByFullName(fullName);
      if (existing) {
        const issues = queries.getIssuesByRepoIds([existing.id]);
        return res.json({
          repoId: existing.id,
          issuesIngested: issues.length,
          repo: {
            id: existing.id,
            url: existing.url,
            name: existing.full_name,
            description: existing.description,
            stars: existing.stars,
            connectedAt: existing.created_at
          }
        });
      }

      // No DB fallback available — surface the error clearly
      return res.status(503).json({
        error: {
          message: `GitHub API unavailable: ${ghErr.message}. Add a valid GITHUB_PAT to your server/.env to connect new repositories.`,
          code: 'GITHUB_UNAVAILABLE'
        }
      });
    }

    // Upsert repo
    const savedRepo = queries.upsertRepo({
      ...repoData,
      connected_by_user_id: req.user?.id
    });

    // Ingest and classify issues
    let ingestedCount = 0;
    for (const ghIssue of issuesData) {
      const savedIssue = queries.upsertIssue({
        repo_id: savedRepo.id,
        github_issue_id: String(ghIssue.id),
        number: ghIssue.number,
        title: ghIssue.title,
        body: ghIssue.body || '',
        url: ghIssue.html_url,
        state: 'open',
        comments_count: ghIssue.comments || 0,
        created_at: ghIssue.created_at || new Date().toISOString()
      });

      // Classify
      const classification = await classifyAndEmbedIssue(savedIssue);
      queries.upsertIssueLabel({
        issue_id: savedIssue.id,
        difficulty: classification.difficulty,
        skill_area: classification.skillArea,
        effort: classification.effort,
        confidence: classification.confidence
      });

      ingestedCount++;
    }

    // Invalidate caches
    cache.flushAll();

    return res.json({
      repoId: savedRepo.id,
      issuesIngested: ingestedCount,
      repo: {
        id: savedRepo.id,
        url: savedRepo.url,
        name: savedRepo.full_name,
        description: savedRepo.description,
        stars: savedRepo.stars,
        connectedAt: savedRepo.created_at
      }
    });
  } catch (err) {
    console.error('Error connecting repo:', err);
    return res.status(500).json({
      error: { message: err.message || 'Internal server error while connecting repository', code: 'SERVER_ERROR' }
    });
  }
});

// GET /api/repos
router.get('/', authMiddleware, (req, res) => {
  const cacheKey = `repos:${req.user?.id || 'all'}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const repos = queries.getAllRepos(req.user?.id);
  cache.set(cacheKey, repos);
  return res.json(repos);
});

module.exports = router;

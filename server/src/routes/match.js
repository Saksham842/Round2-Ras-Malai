const express = require('express');
const NodeCache = require('node-cache');
const queries = require('../db/queries');
const { authMiddleware } = require('../middleware/auth');
const { matchContributorToIssues } = require('../ai/matcher');

const router = express.Router();
const matchCache = new NodeCache({ stdTTL: 30 }); // 30s per AGENTS.md

// POST /api/match
router.post('/', authMiddleware, async (req, res) => {
  const { skills = [], githubProfile, repoIds = [] } = req.body;

  const normalizedSkills = Array.isArray(skills) ? skills : [skills].filter(Boolean);
  const normalizedRepoIds = Array.isArray(repoIds) ? repoIds : [];

  // Include repoIds in cache key so different repo selections have separate caches
  const repoKey = normalizedRepoIds.sort().join('|') || 'all';
  const cacheKey = `match:${normalizedSkills.sort().join('|')}:${githubProfile || ''}:repos:${repoKey}`;

  const cached = matchCache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    // Pass repoIds so we only match issues from the user's selected repos
    // Empty array = all repos (backward-compat when no repos explicitly selected)
    const issues = queries.getIssuesByRepoIds(normalizedRepoIds);

    const contributor = {
      skills: normalizedSkills,
      githubProfile: githubProfile || req.user?.bio || ''
    };

    const matches = await matchContributorToIssues(contributor, issues);
    matchCache.set(cacheKey, matches);

    return res.json(matches);
  } catch (err) {
    console.error('Matching failed:', err);
    return res.status(500).json({
      error: { message: 'Matching failed: ' + err.message, code: 'MATCH_FAILED' }
    });
  }
});

module.exports = router;

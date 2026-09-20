const express = require('express');
const NodeCache = require('node-cache');
const queries = require('../db/queries');
const { authMiddleware } = require('../middleware/auth');
const { classifyAndEmbedIssue } = require('../ai/classify');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60 });

// GET /api/issues?repo=<id1>,<id2>
router.get('/', authMiddleware, (req, res) => {
  const repoParam = req.query.repo;
  const repoIds = repoParam ? repoParam.split(',').map(s => s.trim()).filter(Boolean) : [];

  const cacheKey = `issues:${repoIds.sort().join(',') || 'all'}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const issues = queries.getIssuesByRepoIds(repoIds);
  cache.set(cacheKey, issues);
  return res.json(issues);
});

// POST /api/issues/:id/correct-label
router.post('/:id/correct-label', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { difficulty, skillArea, effort } = req.body;

  const issue = queries.getIssueById(id);
  if (!issue) {
    return res.status(404).json({
      error: { message: `Issue with ID ${id} not found`, code: 'NOT_FOUND' }
    });
  }

  const updatedIssue = queries.updateIssueLabelFields(id, { difficulty, skillArea, effort }, req.user?.id);
  cache.flushAll(); // Invalidate cache per AGENTS.md

  return res.json({
    success: true,
    updatedIssue
  });
});

// POST /api/issues/:id/reclassify
router.post('/:id/reclassify', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const issue = queries.getIssueById(id);
  if (!issue) {
    return res.status(404).json({
      error: { message: `Issue with ID ${id} not found`, code: 'NOT_FOUND' }
    });
  }

  try {
    const classification = await classifyAndEmbedIssue(issue);
    queries.upsertIssueLabel({
      issue_id: id,
      difficulty: classification.difficulty,
      skill_area: classification.skillArea,
      effort: classification.effort,
      confidence: classification.confidence
    });

    cache.flushAll();

    return res.json({
      success: true,
      labels: {
        difficulty: classification.difficulty,
        skillArea: classification.skillArea,
        effort: classification.effort,
        confidence: classification.confidence
      }
    });
  } catch (err) {
    return res.status(500).json({
      error: { message: 'Reclassification failed: ' + err.message, code: 'RECLASSIFY_FAILED' }
    });
  }
});

module.exports = router;

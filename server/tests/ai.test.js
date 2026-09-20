const test = require('node:test');
const assert = require('node:assert');
const { classifyAndEmbedIssue, classifyIssueHeuristic } = require('../src/ai/classify');
const { matchContributorToIssues } = require('../src/ai/matcher');

test('AI Classifier correctly identifies difficulty and skill areas', async (t) => {
  const easyIssue = {
    title: 'Fix typo in documentation readme',
    body: 'There is a spelling mistake in the quickstart guide'
  };
  const easyRes = await classifyAndEmbedIssue(easyIssue);
  assert.strictEqual(easyRes.difficulty, 'Easy');
  assert.strictEqual(easyRes.skillArea, 'Documentation');

  const advancedIssue = {
    title: 'Turbopack compiler memory leak and segfault in WASM transform',
    body: 'Hydration mismatch occurs when compiling complex AST transforms'
  };
  const advRes = await classifyAndEmbedIssue(advancedIssue);
  assert.strictEqual(advRes.difficulty, 'Advanced');
});

test('Matching engine scores and ranks top-5 with <= 120 char reasons', async (t) => {
  const contributor = {
    skills: ['React', 'TypeScript', 'TailwindCSS'],
    bio: 'Frontend enthusiast working on UI components'
  };

  const sampleIssues = [
    {
      id: '1',
      title: 'Fix React hook dependency cycle in Navbar',
      body: 'State updates infinitely on re-render',
      labels: { difficulty: 'Intermediate', skillArea: 'React', confidence: 0.9 }
    },
    {
      id: '2',
      title: 'Update Dockerfile for Kubernetes cluster',
      body: 'Backend deployment fails on pod restart',
      labels: { difficulty: 'Intermediate', skillArea: 'DevOps', confidence: 0.8 }
    },
    {
      id: '3',
      title: 'Refactor TailwindCSS layout grid for mobile view',
      body: 'Padding overflows on small screens',
      labels: { difficulty: 'Easy', skillArea: 'CSS / TailwindCSS', confidence: 0.95 }
    }
  ];

  const results = await matchContributorToIssues(contributor, sampleIssues);
  assert.ok(results.length > 0);
  assert.ok(results[0].score >= 0 && results[0].score <= 100);
  assert.ok(results[0].matchReason.length <= 120);
  // React or CSS issue should outscore DevOps issue for this contributor
  assert.ok(results[0].issue.labels.skillArea.includes('React') || results[0].issue.labels.skillArea.includes('CSS'));
});

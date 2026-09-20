const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/index');

test('Contrib Compass API Integration Test Suite', async (t) => {
  let sessionToken = '';
  let testRepoId = '';
  let testIssueId = '';

  // 1. Health check
  await t.test('GET /health returns 200 OK', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
  });

  // 2. Auth endpoint
  await t.test('POST /api/auth/github returns sessionToken and user profile', async () => {
    const res = await request(app)
      .post('/api/auth/github')
      .send({ code: 'demo_test_code' });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.sessionToken);
    assert.strictEqual(res.body.user.login, 'alexcontributor');
    sessionToken = res.body.sessionToken;
  });

  // 3. Auth guard check
  await t.test('GET /api/repos fails without auth header', async () => {
    const res = await request(app).get('/api/repos');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.error.code, 'AUTH_REQUIRED');
  });

  // 4. Connect repo
  await t.test('POST /api/repos/connect ingests repo and creates issues', async () => {
    const res = await request(app)
      .post('/api/repos/connect')
      .set('Authorization', `Bearer ${sessionToken}`)
      .send({ repoUrl: 'https://github.com/facebook/react' });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.repoId);
    assert.ok(res.body.issuesIngested >= 0);
    testRepoId = res.body.repoId;
  });

  // 5. Get repos list
  await t.test('GET /api/repos returns list of connected repos', async () => {
    const res = await request(app)
      .get('/api/repos')
      .set('Authorization', `Bearer ${sessionToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length > 0);
  });

  // 6. Get issues
  await t.test('GET /api/issues returns issues with triaged labels', async () => {
    const res = await request(app)
      .get(`/api/issues?repo=${testRepoId}`)
      .set('Authorization', `Bearer ${sessionToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    if (res.body.length > 0) {
      testIssueId = res.body[0].id;
      assert.ok(res.body[0].labels);
      assert.ok(['Easy', 'Intermediate', 'Advanced'].includes(res.body[0].labels.difficulty));
    }
  });

  // 7. Correct label
  await t.test('POST /api/issues/:id/correct-label updates difficulty and effort', async () => {
    if (!testIssueId) return;

    const res = await request(app)
      .post(`/api/issues/${testIssueId}/correct-label`)
      .set('Authorization', `Bearer ${sessionToken}`)
      .send({
        difficulty: 'Easy',
        effort: '<1 hr',
        skillArea: 'React / Documentation'
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.updatedIssue.labels.difficulty, 'Easy');
    assert.strictEqual(res.body.updatedIssue.labels.effort, '<1 hr');
  });

  // 8. Match contributor
  await t.test('POST /api/match returns top scored issues with <=120 char reasons', async () => {
    const res = await request(app)
      .post('/api/match')
      .set('Authorization', `Bearer ${sessionToken}`)
      .send({
        skills: ['React', 'TypeScript'],
        githubProfile: 'Passionate about frontend component development'
      });

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    if (res.body.length > 0) {
      assert.ok(res.body[0].score >= 0 && res.body[0].score <= 100);
      assert.ok(res.body[0].matchReason.length <= 120);
      assert.ok(res.body[0].issue);
    }
  });
});

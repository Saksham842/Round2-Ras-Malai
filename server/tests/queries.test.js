const test = require('node:test');
const assert = require('node:assert');
const queries = require('../src/db/queries');

test('Repo and Issue queries flow', (t) => {
  // 1. Upsert repo
  const repo = queries.upsertRepo({
    id: 'test_repo_1',
    github_repo_id: '123456',
    owner: 'testowner',
    name: 'testrepo',
    full_name: 'testowner/testrepo',
    description: 'A test repository',
    url: 'https://github.com/testowner/testrepo',
    stars: 42
  });

  assert.strictEqual(repo.full_name, 'testowner/testrepo');

  // 2. Upsert issue
  const issue = queries.upsertIssue({
    id: 'test_issue_1',
    repo_id: repo.id,
    github_issue_id: '999',
    number: 10,
    title: 'Fix responsive navigation bug',
    body: 'The mobile menu does not close when clicking outside',
    url: 'https://github.com/testowner/testrepo/issues/10',
    comments_count: 2
  });

  assert.strictEqual(issue.title, 'Fix responsive navigation bug');

  // 3. Upsert label
  queries.upsertIssueLabel({
    issue_id: issue.id,
    difficulty: 'Easy',
    skill_area: 'CSS / UI',
    effort: '<2 hrs',
    confidence: 0.95
  });

  // 4. Fetch joined issue
  const fetched = queries.getIssueById(issue.id);
  assert.strictEqual(fetched.labels.difficulty, 'Easy');
  assert.strictEqual(fetched.labels.skillArea, 'CSS / UI');
  assert.strictEqual(fetched.repoName, 'testowner/testrepo');

  // 5. Correct label
  const updated = queries.updateIssueLabelFields(issue.id, {
    difficulty: 'Intermediate',
    effort: '2-4 hrs'
  }, 'admin_user');

  assert.strictEqual(updated.labels.difficulty, 'Intermediate');
  assert.strictEqual(updated.labels.effort, '2-4 hrs');
  assert.strictEqual(updated.labels.confidence, 1.0);
});

const test = require('node:test');
const assert = require('node:assert');
const { db, initSchema } = require('../src/db/sqlite');

test('Database schema initialization', (t) => {
  initSchema();
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
  
  assert.ok(tables.includes('users'), 'Should include users table');
  assert.ok(tables.includes('repos'), 'Should include repos table');
  assert.ok(tables.includes('issues'), 'Should include issues table');
  assert.ok(tables.includes('issue_labels'), 'Should include issue_labels table');
  assert.ok(tables.includes('label_corrections'), 'Should include label_corrections table');
  assert.ok(tables.includes('contributors'), 'Should include contributors table');
  assert.ok(tables.includes('matches'), 'Should include matches table');
});

const { db } = require('./sqlite');
const crypto = require('crypto');

// Users
function upsertUser({ id, github_id, username, name, avatar_url, access_token }) {
  const userId = id || crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO users (id, github_id, username, name, avatar_url, access_token)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      github_id = excluded.github_id,
      username = excluded.username,
      name = excluded.name,
      avatar_url = excluded.avatar_url,
      access_token = excluded.access_token
  `);
  stmt.run(userId, String(github_id || ''), username, name || username, avatar_url || '', access_token || '');
  return findUserById(userId);
}

function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function findUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

// Repos
function upsertRepo({ id, github_repo_id, owner, name, full_name, description, url, stars, connected_by_user_id, last_ingested_at }) {
  const repoId = id || crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO repos (id, github_repo_id, owner, name, full_name, description, url, stars, connected_by_user_id, last_ingested_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(full_name) DO UPDATE SET
      stars = excluded.stars,
      description = excluded.description,
      last_ingested_at = excluded.last_ingested_at
  `);
  stmt.run(
    repoId,
    String(github_repo_id || ''),
    owner,
    name,
    full_name,
    description || '',
    url,
    stars || 0,
    connected_by_user_id || null,
    last_ingested_at || new Date().toISOString()
  );
  return findRepoByFullName(full_name);
}

function findRepoById(id) {
  return db.prepare('SELECT * FROM repos WHERE id = ?').get(id);
}

function findRepoByFullName(fullName) {
  return db.prepare('SELECT * FROM repos WHERE full_name = ?').get(fullName);
}

function getAllRepos(userId) {
  const query = `
    SELECT 
      r.id, 
      r.url, 
      r.full_name as name, 
      r.description, 
      r.stars, 
      (SELECT COUNT(*) FROM issues i WHERE i.repo_id = r.id) as issuesIngested,
      r.created_at as connectedAt
    FROM repos r
    ORDER BY r.created_at DESC
  `;
  return db.prepare(query).all();
}

// Issues
function upsertIssue({ id, repo_id, github_issue_id, number, title, body, url, state, comments_count, created_at }) {
  const issueId = id || crypto.randomUUID();
  const existing = db.prepare('SELECT id FROM issues WHERE repo_id = ? AND number = ?').get(repo_id, number);
  const actualId = existing ? existing.id : issueId;

  if (existing) {
    db.prepare(`
      UPDATE issues 
      SET title = ?, body = ?, url = ?, state = ?, comments_count = ?
      WHERE id = ?
    `).run(title, body || '', url, state || 'open', comments_count || 0, actualId);
  } else {
    db.prepare(`
      INSERT INTO issues (id, repo_id, github_issue_id, number, title, body, url, state, comments_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      actualId,
      repo_id,
      String(github_issue_id || ''),
      number,
      title,
      body || '',
      url,
      state || 'open',
      comments_count || 0,
      created_at || new Date().toISOString()
    );
  }
  return getIssueById(actualId);
}

function getIssueById(id) {
  const row = db.prepare(`
    SELECT 
      i.id,
      i.repo_id as repoId,
      r.full_name as repoName,
      i.number,
      i.title,
      i.body,
      i.url,
      i.comments_count as commentsCount,
      i.created_at as createdAt,
      il.difficulty,
      il.skill_area as skillArea,
      il.effort,
      il.confidence,
      il.summary
    FROM issues i
    JOIN repos r ON i.repo_id = r.id
    LEFT JOIN issue_labels il ON i.id = il.issue_id
    WHERE i.id = ?
  `).get(id);

  if (!row) return null;
  return formatIssueRow(row);
}

function getIssuesByRepoIds(repoIds = []) {
  let query = `
    SELECT 
      i.id,
      i.repo_id as repoId,
      r.full_name as repoName,
      i.number,
      i.title,
      i.body,
      i.url,
      i.comments_count as commentsCount,
      i.created_at as createdAt,
      il.difficulty,
      il.skill_area as skillArea,
      il.effort,
      il.confidence,
      il.summary
    FROM issues i
    JOIN repos r ON i.repo_id = r.id
    LEFT JOIN issue_labels il ON i.id = il.issue_id
  `;
  const params = [];

  if (repoIds.length > 0) {
    const placeholders = repoIds.map(() => '?').join(',');
    query += ` WHERE i.repo_id IN (${placeholders})`;
    params.push(...repoIds);
  }

  query += ` ORDER BY i.created_at DESC`;

  const rows = db.prepare(query).all(...params);
  return rows.map(formatIssueRow);
}

function formatIssueRow(row) {
  return {
    id: row.id,
    repoId: row.repoId,
    repoName: row.repoName,
    number: row.number,
    title: row.title,
    body: row.body,
    url: row.url,
    labels: row.difficulty ? {
      difficulty: row.difficulty,
      skillArea: row.skillArea,
      effort: row.effort,
      confidence: row.confidence !== null ? parseFloat(row.confidence) : 0.85,
      summary: row.summary || `${row.difficulty} ${row.skillArea || 'Architecture'} task: ${row.title?.replace(/\.$/, '') || 'Investigate and resolve issue'}.`
    } : null,
    commentsCount: row.commentsCount,
    createdAt: row.createdAt
  };
}

// Labels
function upsertIssueLabel({ issue_id, difficulty, skill_area, effort, confidence, summary }) {
  const stmt = db.prepare(`
    INSERT INTO issue_labels (issue_id, difficulty, skill_area, effort, confidence, summary, labeled_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(issue_id) DO UPDATE SET
      difficulty = excluded.difficulty,
      skill_area = excluded.skill_area,
      effort = excluded.effort,
      confidence = excluded.confidence,
      summary = excluded.summary,
      labeled_at = CURRENT_TIMESTAMP
  `);
  stmt.run(issue_id, difficulty, skill_area, effort, confidence || 0.85, summary || null);
  return db.prepare('SELECT * FROM issue_labels WHERE issue_id = ?').get(issue_id);
}

function updateIssueLabelFields(issueId, { difficulty, skillArea, effort }, userId) {
  const current = db.prepare('SELECT * FROM issue_labels WHERE issue_id = ?').get(issueId);
  const now = new Date().toISOString();

  // Validate user exists if provided to satisfy foreign key constraint
  const userExists = userId ? db.prepare('SELECT id FROM users WHERE id = ?').get(userId) : null;
  const validUserId = userExists ? userId : null;

  // Record corrections
  if (difficulty && (!current || current.difficulty !== difficulty)) {
    db.prepare(`
      INSERT INTO label_corrections (id, issue_id, field, old_value, new_value, corrected_by, corrected_at)
      VALUES (?, ?, 'difficulty', ?, ?, ?, ?)
    `).run(crypto.randomUUID(), issueId, current ? current.difficulty : null, difficulty, validUserId, now);
  }
  if (skillArea && (!current || current.skill_area !== skillArea)) {
    db.prepare(`
      INSERT INTO label_corrections (id, issue_id, field, old_value, new_value, corrected_by, corrected_at)
      VALUES (?, ?, 'skillArea', ?, ?, ?, ?)
    `).run(crypto.randomUUID(), issueId, current ? current.skill_area : null, skillArea, validUserId, now);
  }
  if (effort && (!current || current.effort !== effort)) {
    db.prepare(`
      INSERT INTO label_corrections (id, issue_id, field, old_value, new_value, corrected_by, corrected_at)
      VALUES (?, ?, 'effort', ?, ?, ?, ?)
    `).run(crypto.randomUUID(), issueId, current ? current.effort : null, effort, validUserId, now);
  }

  // Update label
  const newDifficulty = difficulty || (current ? current.difficulty : 'Intermediate');
  const newSkillArea = skillArea || (current ? current.skill_area : 'General');
  const newEffort = effort || (current ? current.effort : '2-4 hrs');
  const newConfidence = 1.0; // Human corrected = 100% confidence

  upsertIssueLabel({
    issue_id: issueId,
    difficulty: newDifficulty,
    skill_area: newSkillArea,
    effort: newEffort,
    confidence: newConfidence
  });

  return getIssueById(issueId);
}

module.exports = {
  upsertUser,
  findUserById,
  findUserByUsername,
  upsertRepo,
  findRepoById,
  findRepoByFullName,
  getAllRepos,
  upsertIssue,
  getIssueById,
  getIssuesByRepoIds,
  upsertIssueLabel,
  updateIssueLabelFields
};

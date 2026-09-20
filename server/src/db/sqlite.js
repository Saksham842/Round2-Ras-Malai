const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/compass.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Initialize schema
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      github_id TEXT,
      username TEXT NOT NULL,
      name TEXT,
      avatar_url TEXT,
      access_token TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS repos (
      id TEXT PRIMARY KEY,
      github_repo_id TEXT,
      owner TEXT NOT NULL,
      name TEXT NOT NULL,
      full_name TEXT NOT NULL UNIQUE,
      description TEXT,
      url TEXT NOT NULL,
      stars INTEGER DEFAULT 0,
      connected_by_user_id TEXT REFERENCES users(id),
      last_ingested_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      repo_id TEXT REFERENCES repos(id) ON DELETE CASCADE,
      github_issue_id TEXT,
      number INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      url TEXT NOT NULL,
      state TEXT DEFAULT 'open',
      comments_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS issue_labels (
      issue_id TEXT PRIMARY KEY REFERENCES issues(id) ON DELETE CASCADE,
      difficulty TEXT CHECK(difficulty IN ('Easy', 'Intermediate', 'Advanced', 'Unknown')),
      skill_area TEXT,
      effort TEXT,
      confidence REAL DEFAULT 0.0,
      summary TEXT,
      labeled_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS label_corrections (
      id TEXT PRIMARY KEY,
      issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
      field TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      corrected_by TEXT REFERENCES users(id),
      corrected_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contributors (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      skills TEXT,
      github_profile TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      contributor_id TEXT REFERENCES contributors(id),
      issue_id TEXT REFERENCES issues(id),
      score REAL,
      match_reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_issues_repo_id ON issues(repo_id);
    CREATE INDEX IF NOT EXISTS idx_repos_full_name ON repos(full_name);
  `);

  try {
    db.exec('ALTER TABLE issue_labels ADD COLUMN summary TEXT');
  } catch (e) {
    // Column already exists or table freshly created with summary
  }

  // Backfill any issues with missing summary
  try {
    db.exec(`
      UPDATE issue_labels
      SET summary = (
        SELECT COALESCE(difficulty, 'Intermediate') || ' ' || COALESCE(skill_area, 'Architecture') || ' task: ' || issues.title
        FROM issues WHERE issues.id = issue_labels.issue_id
      )
      WHERE summary IS NULL OR summary = ''
    `);
  } catch (e) {
    // Ignore error if issues table is not yet populated
  }
}

initSchema();

module.exports = {
  db,
  initSchema
};

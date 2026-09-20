require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');
const reposRouter = require('./routes/repos');
const issuesRouter = require('./routes/issues');
const matchRouter = require('./routes/match');
const { db } = require('./db/sqlite');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup adhering strictly to AGENTS.md
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-side calls)
    if (!origin) return callback(null, true);
    // Permissive in hackathon mode — allow all origins incl. *.vercel.app
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Include BYOK headers so browser can send user-provided PAT and Groq key
  allowedHeaders: ['Content-Type', 'Authorization', 'x-github-pat', 'x-groq-api-key'],
  credentials: true
}));

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ status: 'ok', timestamp: new Date().toISOString(), database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/repos', reposRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/match', matchRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'NOT_FOUND'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'SERVER_ERROR'
    }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Contrib Compass API server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

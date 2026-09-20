const express = require('express');
const jwt = require('jsonwebtoken');
const queries = require('../db/queries');
const { JWT_SECRET, DEFAULT_DEMO_USER } = require('../middleware/auth');

const router = express.Router();

// Helper to issue JWT
function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      login: user.login || user.username,
      name: user.name,
      avatar_url: user.avatar_url
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/github
router.post('/github', async (req, res) => {
  const { code } = req.body;

  // Real GitHub OAuth exchange if keys are available
  if (code && code !== 'demo' && process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    try {
      // 1. Exchange code for access token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code
        })
      });

      const tokenData = await tokenRes.json();
      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error);
      }

      const accessToken = tokenData.access_token;

      // 2. Fetch user profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'Contrib-Compass-App'
        }
      });

      if (!userRes.ok) {
        throw new Error('Failed to fetch user profile from GitHub');
      }

      const ghUser = await userRes.json();

      // Upsert in database
      const dbUser = queries.upsertUser({
        id: `gh_${ghUser.id}`,
        github_id: String(ghUser.id),
        username: ghUser.login,
        name: ghUser.name || ghUser.login,
        avatar_url: ghUser.avatar_url,
        access_token: accessToken
      });

      const userPayload = {
        id: dbUser.id,
        login: dbUser.username,
        name: dbUser.name,
        avatar_url: dbUser.avatar_url,
        bio: ghUser.bio || '',
        public_repos: ghUser.public_repos || 0,
        followers: ghUser.followers || 0,
        skills: ['React', 'TypeScript', 'Node.js', 'Next.js']
      };

      const sessionToken = createToken(userPayload);
      return res.json({ sessionToken, user: userPayload });
    } catch (err) {
      console.warn('GitHub OAuth failed, falling back to mock user:', err.message);
    }
  }

  // Fallback demo/mock user (offline & demo resilience)
  const dbUser = queries.upsertUser({
    id: DEFAULT_DEMO_USER.id,
    github_id: '583231',
    username: DEFAULT_DEMO_USER.login,
    name: DEFAULT_DEMO_USER.name,
    avatar_url: DEFAULT_DEMO_USER.avatar_url,
    access_token: 'mock_access_token'
  });

  const sessionToken = createToken(DEFAULT_DEMO_USER);
  return res.json({
    sessionToken,
    user: DEFAULT_DEMO_USER
  });
});

// POST /api/auth/demo
router.post('/demo', (req, res) => {
  queries.upsertUser({
    id: DEFAULT_DEMO_USER.id,
    github_id: '583231',
    username: DEFAULT_DEMO_USER.login,
    name: DEFAULT_DEMO_USER.name,
    avatar_url: DEFAULT_DEMO_USER.avatar_url,
    access_token: 'mock_access_token'
  });

  const sessionToken = createToken(DEFAULT_DEMO_USER);
  return res.json({
    sessionToken,
    user: DEFAULT_DEMO_USER
  });
});

// POST /api/auth/profile
// Login via GitHub username (public profile) or GitHub PAT (authenticated profile)
// This is the primary hosted login path — no OAuth app needed
router.post('/profile', async (req, res) => {
  const { username, token: patToken } = req.body;

  if (!username && !patToken) {
    return res.status(400).json({
      error: { message: 'Provide either a GitHub username or a Personal Access Token', code: 'INVALID_INPUT' }
    });
  }

  try {
    const headers = {
      'User-Agent': 'Contrib-Compass-App',
      'Accept': 'application/vnd.github.v3+json'
    };
    if (patToken) {
      headers['Authorization'] = `Bearer ${patToken}`;
    }

    // Fetch from /user (authenticated) or /users/:login (public)
    const endpoint = patToken ? 'https://api.github.com/user' : `https://api.github.com/users/${username}`;
    const ghRes = await fetch(endpoint, { headers });

    if (!ghRes.ok) {
      return res.status(400).json({
        error: {
          message: ghRes.status === 404
            ? `GitHub user "${username}" not found`
            : `GitHub API error: ${ghRes.statusText}`,
          code: 'GITHUB_LOOKUP_FAILED'
        }
      });
    }

    const ghUser = await ghRes.json();

    const dbUser = queries.upsertUser({
      id: `gh_${ghUser.id}`,
      github_id: String(ghUser.id),
      username: ghUser.login,
      name: ghUser.name || ghUser.login,
      avatar_url: ghUser.avatar_url,
      access_token: patToken || ''
    });

    const userPayload = {
      id: dbUser.id,
      login: dbUser.username,
      name: dbUser.name,
      avatar_url: dbUser.avatar_url,
      bio: ghUser.bio || '',
      public_repos: ghUser.public_repos || 0,
      followers: ghUser.followers || 0,
      skills: []
    };

    const sessionToken = createToken(userPayload);
    return res.json({ sessionToken, user: userPayload });
  } catch (err) {
    console.error('Profile login failed:', err.message);
    return res.status(500).json({
      error: { message: 'Failed to fetch GitHub profile: ' + err.message, code: 'PROFILE_FETCH_FAILED' }
    });
  }
});

module.exports = router;

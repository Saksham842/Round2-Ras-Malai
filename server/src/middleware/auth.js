const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'contrib_compass_dev_secret_jwt_key_2026';

const DEFAULT_DEMO_USER = {
  id: 'demo_user_contrib_compass',
  login: 'alexcontributor',
  name: 'Alex Rivera',
  avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
  bio: 'Frontend craftsman & Open Source enthusiast. Rust curious.',
  public_repos: 34,
  followers: 128,
  skills: ['React', 'TypeScript', 'TailwindCSS', 'Next.js', 'Node.js']
};

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        message: 'Authorization header missing or invalid format. Expected Bearer <token>',
        code: 'AUTH_REQUIRED'
      }
    });
  }

  const token = authHeader.split(' ')[1];

  // Handle mock tokens gracefully for hackathon offline/resilience demo
  if (token.startsWith('gh_mock_') || token.startsWith('demo_') || token.startsWith('gh_fallback_')) {
    req.user = DEFAULT_DEMO_USER;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        message: 'Invalid or expired session token',
        code: 'INVALID_TOKEN'
      }
    });
  }
}

module.exports = {
  authMiddleware,
  DEFAULT_DEMO_USER,
  JWT_SECRET
};

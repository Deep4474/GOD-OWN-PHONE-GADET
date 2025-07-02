const { getUsers } = require('./userData');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied', 
      message: 'No token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = getUsers().find(u => u.email === decoded.email);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Invalid token' 
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'Admin access required' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Access denied', 
      message: 'Invalid token' 
    });
  }
};

function requireAdmin(req, res, next) {
  console.log('requireAdmin check:', req.user);
  // TEMP: Allow admin@example.com for testing
  if (req.user && (req.user.role === 'admin' || req.user.email === 'admin@example.com')) {
    return next();
  }
  return res.status(403).json({ 
    error: 'Access denied', 
    message: 'Admin access required' 
  });
}

module.exports = {
  authenticateToken,
  authenticateAdmin,
  requireAdmin
}; 
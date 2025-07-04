const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const usersFile = path.join(__dirname, 'users.json');
let users = require('./users.json');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const nodemailer = require('nodemailer');

// Helper to save users
function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// JWT authentication middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed token' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Email setup (Gmail with app password)
const EMAIL_USER = process.env.EMAIL_USER || 'ayomideoluniyi49@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'cghk byam dkno yuks';
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

function sendVerificationEmail(email, token) {
  const verifyUrl = `http://localhost:3000/api/auth/verify-email?token=${token}`;
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'Verify your email',
    html: `<p>Please verify your email by clicking <a href="${verifyUrl}">here</a>.</p>`
  };
  return transporter.sendMail(mailOptions);
}

// Registration endpoint
router.post('/register', async (req, res) => {
  const { name, email, password, phone, address, state, lga } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const newUser = {
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      state,
      lga,
      verified: false,
      verificationToken
    };
    users.push(newUser);
    saveUsers(users);
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }
    res.json({ user: { ...newUser, password: undefined, verificationToken: undefined }, message: 'Registration successful. Please verify your email.' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (!user.verified) {
    return res.status(403).json({ error: 'Please verify your email before logging in.' });
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  // Generate JWT token
  const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ user: { ...user, password: undefined, verificationToken: undefined }, token, message: 'Login successful' });
});

// Logout endpoint (dummy, just returns success)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

// Example protected route
router.get('/protected', authenticateJWT, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Email verification endpoint
router.get('/verify-email', (req, res) => {
  const { token } = req.query;
  const user = users.find(u => u.verificationToken === token);
  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired verification token' });
  }
  user.verified = true;
  user.verificationToken = undefined;
  saveUsers(users);
  res.json({ message: 'Email verified successfully. You can now log in.' });
});

module.exports = router; 
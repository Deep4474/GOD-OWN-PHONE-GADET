// In-memory store for demo (replace with DB in production)
const pendingConfirmations = {};

// Endpoint to send confirmation email after Google OAuth
app.post('/api/send-confirmation', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const token = Math.random().toString(36).substr(2);
  pendingConfirmations[token] = email;
  const confirmUrl = `http://localhost:3000/api/confirm?token=${token}`;
  const mailOptions = {
    from: 'Lamar Phone and Gadget <ayomideoluniyi49@gmail.com>',
    to: email,
    subject: 'Confirm your registration',
    html: `<p>Click <a href="${confirmUrl}">here</a> to confirm your registration.</p>`
  };
  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to confirm registration
app.get('/api/confirm', (req, res) => {
  const { token } = req.query;
  const email = pendingConfirmations[token];
  if (!email) return res.status(400).send('Invalid or expired token');
  // Mark user as confirmed (update DB in production)
  delete pendingConfirmations[token];
  res.send('Email confirmed! You can now complete registration.');
});
// Send welcome email endpoint
app.post('/api/send-welcome', async (req, res) => {
  const { email, username } = req.body;
  if (!email || !username) {
    return res.json({ success: false, message: 'Email and username required.' });
  }
  try {
    await transporter.sendMail({
      from: 'Lamar Phone and Gadget <ayomideoluniyi49@gmail.com>',
      to: email,
      subject: 'Welcome to Lamar Phone and Gadget!',
      text: `Hi ${username}, welcome to our platform!`,
      html: `<h2>Hi ${username},</h2><p>Welcome to Lamar Phone and Gadget!</p>`
    });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: 'Failed to send welcome email.' });
  }
});
// Simple Node.js/Express backend for registration and code verification
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
// Configure Nodemailer transporter (use your Gmail and app password)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ayomideoluniyi49@gmail.com',
    pass: 'xjde uqgu tcqg avag'
  }
});

const app = express();

// CORS middleware for Netlify and local dev
app.use(cors({
  origin: [
    'https://glittery-torrone-d1184e.netlify.app',
    'http://localhost:3000',
    'http://127.0.0.1:5500'
  ],
  credentials: true
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' https://glittery-torrone-d1184e.netlify.app https://phone-2cv4.onrender.com https://jlwxkykznyjmstpjcgks.supabase.co;");
  next();
});

app.get('/', (req, res) => {
  res.send('<h2>Welcome to Lamar Phone and Gadget API!</h2><p>This is the backend server. Use the API endpoints for data access.</p>');
});
const PORT = 3000;


app.use(bodyParser.json());

// In-memory store for demo (replace with DB in production)
const codes = {};
// Send order status update email
app.post('/api/send-status-email', async (req, res) => {
  const { email, status, orderId } = req.body;
  console.log('API /api/send-status-email called with:', { email, status, orderId });
  if (!email || !status || !orderId) {
    console.log('Missing fields:', { email, status, orderId });
    return res.json({ success: false, message: 'Missing fields.' });
  }
  try {
    const mailOptions = {
        from: 'Lamar Phone and Gadget <ayomideoluniyi49@gmail.com>',
      to: email,
      subject: `Order Status Update for Order #${orderId}`,
      text: `Your order status has been updated to: ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2d7efb;">Lamar Phone & Gadget</h2>
          <p>Dear Customer,</p>
          <p>Your order <strong>#${orderId}</strong> status has been updated to:</p>
          <p style="font-size: 1.2em; color: #333; font-weight: bold;">${status}</p>
          <hr>
          <p>If you have any questions, please reply to this email.</p>
          <p style="color: #888; font-size: 0.9em;">Thank you for shopping with us!</p>
        </div>
      `
    };
    console.log('Sending email with options:', mailOptions);
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending status email:', error);
    res.json({ success: false, message: 'Failed to send email.' });
  }
});
const users = {};
const fs = require('fs');

// Send verification code (simulate email)
app.post('/api/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: 'Email required.' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  codes[email] = code;
  try {
    await transporter.sendMail({
        from: 'Lamar Phone and Gadget <ayomideoluniyi49@gmail.com>',
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${code}`
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.json({ success: false, message: 'Failed to send email.' });
  }
});

// Register user
app.post('/api/register', (req, res) => {
  let { username, email, password, code } = req.body;
  // Trim email and code to avoid space issues
  email = email ? email.trim() : '';
  code = code ? code.trim() : '';
  console.log('Register endpoint called with:', { username, email, password, code });
  if (!username || !email || !password || !code) {
    console.log('Missing fields:', { username, email, password, code });
    return res.json({ success: false, message: 'All fields required.' });
  }
  if (codes[email] !== code) {
    console.log('Invalid code for email:', email, 'Expected:', codes[email], 'Received:', code);
    return res.json({ success: false, message: 'Invalid verification code.' });
  }
  // Generate UUID for user
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  const id = generateUUID();
  users[email] = { id, username, email, password };
  delete codes[email];
  // Save user to user.json, prevent duplicate registration
  fs.readFile('user.json', 'utf8', (err, data) => {
    let userList = [];
    if (err && err.code !== 'ENOENT') {
      console.log('Error reading user.json:', err);
      return res.json({ success: false, message: 'Server error reading users.' });
    }
    if (!err && data) {
      try {
        const parsed = JSON.parse(data);
        userList = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.log('Error parsing user.json:', e);
        return res.json({ success: false, message: 'Corrupt user data.' });
      }
    }
    // Check for duplicate email
    if (userList.some(u => u.email === email)) {
      console.log('Duplicate registration attempt for email:', email);
      return res.json({ success: false, message: 'User already registered with this email.' });
    }
    userList.push({ id, username, email });
      fs.writeFile('user.json', JSON.stringify(userList, null, 2), async (writeErr) => {
        if (writeErr) {
          console.log('Error writing to user.json:', writeErr);
          return res.json({ success: false, message: 'Failed to save user.' });
        }
        console.log('User saved to user.json:', { id, username, email });
        // Send welcome email after successful registration
        try {
          await transporter.sendMail({
            from: 'Lamar Phone and Gadget <ayomideoluniyi49@gmail.com>',
            to: email,
            subject: 'Welcome to Lamar Phone and Gadget!',
            text: `Hi ${username}, welcome to our platform!`,
            html: `<h2>Hi ${username},</h2><p>Welcome to Lamar Phone and Gadget!</p>`
          });
          console.log('Welcome email sent to', email);
        } catch (err) {
          console.error('Failed to send welcome email:', err);
        }
        res.json({ success: true, username, id });
      });
  });
});

// Check if user exists by email
app.get('/api/user', (req, res) => {
  const email = req.query.email;
  if (!email) return res.json({ success: false, message: 'Email required.' });
  fs.readFile('user.json', 'utf8', (err, data) => {
    if (err || !data) return res.json({ success: false, message: 'No users found.' });
    try {
      const userList = JSON.parse(data);
      const user = userList.find(u => u.email === email);
      if (user) {
        res.json({ success: true, user });
      } else {
        res.json({ success: false, message: 'User not found.' });
      }
    } catch (e) {
      res.json({ success: false, message: 'Error reading users.' });
    }
  });
});

app.listen(PORT, () => {
// Get all users for admin panel
app.get('/api/user-list', (req, res) => {
  fs.readFile('user.json', 'utf8', (err, data) => {
    if (err || !data) return res.json({ success: true, users: [] });
    try {
      const userList = JSON.parse(data);
      res.json({ success: true, users: userList });
    } catch (e) {
      res.json({ success: true, users: [] });
    }
  });
});
  console.log(`Server running on http://localhost:${PORT}`);
});

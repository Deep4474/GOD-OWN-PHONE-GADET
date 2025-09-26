// Simple Node.js/Express backend for registration and code verification
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
// Configure Nodemailer transporter (use your Gmail and app password)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ayomideoluniyi49@gmail.com', // correct Gmail address
  pass: 'errd gxwu ecct bxqk'           // Gmail app password with no spaces
  }
});

const app = express();
// Friendly root route for API
// Set security headers to fix Permissions-Policy and CSP errors
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://jlwxkykznyjmstpjcgks.supabase.co https://phone-2cv4.onrender.com;");
  next();
});

app.get('/', (req, res) => {
  res.send('<h2>Welcome to Lamar Phone and Gadget API!</h2><p>This is the backend server. Use the API endpoints for data access.</p>');
});
const PORT = 3000;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://glittery-torrone-d1184e.netlify.app'
  ],
  credentials: true
}));
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
  const { username, email, password, code } = req.body;
  if (!username || !email || !password || !code) {
    return res.json({ success: false, message: 'All fields required.' });
  }
  if (codes[email] !== code) {
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
  // Save user to user.json
  fs.readFile('user.json', 'utf8', (err, data) => {
    let userList = [];
    if (!err && data) {
      try {
        const parsed = JSON.parse(data);
        userList = Array.isArray(parsed) ? parsed : [];
      } catch (e) {}
    }
    userList.push({ id, username, email });
    fs.writeFile('user.json', JSON.stringify(userList, null, 2), () => {
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

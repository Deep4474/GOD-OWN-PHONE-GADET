const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
// CORS middleware for Netlify and local dev (must be before any routes)
app.use(cors({
  origin: [
    'https://glittery-torrone-d1184e.netlify.app',
    'http://localhost:3000',
    'http://127.0.0.1:5500'
  ],
  credentials: true
}));
app.use(express.json());
let notifications = [];
// ...existing code...
// Place this after app is initialized and middleware setup
app.get('/api/order-analysis', async (req, res) => {
  try {
    const ordersRes = await fetch('https://jlwxkykznyjmstpjcgks.supabase.co/rest/v1/orders', {
      headers: {
        apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ'
      }
    });
    let deliveredCount = 0, pendingCount = 0, shippingCount = 0, completedCount = 0;
    let orders = [];
    try {
      orders = await ordersRes.json();
    } catch (e) {
      orders = [];
    }
    if (Array.isArray(orders)) {
      orders.forEach(order => {
        if (order.status === 'Delivery') deliveredCount++;
        else if (order.status === 'Pending') pendingCount++;
        else if (order.status === 'Shipping') shippingCount++;
        else if (order.status === 'Completed') completedCount++;
      });
    }
    res.json({
      analysis: {
        delivered: deliveredCount,
        pending: pendingCount,
        shipping: shippingCount,
        completed: completedCount
      },
      notifications: notifications.slice(0, 20)
    });
  } catch (err) {
    res.json({
      analysis: {
        delivered: 0,
        pending: 0,
        shipping: 0,
        completed: 0
      },
      notifications: notifications.slice(0, 20),
      error: 'Failed to fetch analysis.'
    });
  }
});
// ...existing code...
// Endpoint for admin to send a custom email to a user
// Endpoint for admin to send a custom email to a user
app.post('/api/send-custom-email', async (req, res) => {
  console.log('HIT /api/send-custom-email');
  console.log('Request body:', req.body);
  const { email, subject, message } = req.body;
  if (!email || !subject || !message) {
    console.log('Missing email, subject, or message');
    return res.json({ success: false, message: 'Email, subject, and message are required.' });
  }
  try {
    const info = await transporter.sendMail({
      from: 'Lamar Phone and Gadget <ayomideoluniyi49@gmail.com>',
      to: email,
      subject,
      html: `<div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2d7efb;">Lamar Phone & Gadget</h2>
        <p>${message}</p>
        <hr><div style="font-size: 0.9em; color: #888;">&copy; 2025 Lamar Phone & Gadget</div></div>`
    });
    console.log('Custom email sent:', info);
    // Add notification
    notifications.unshift(`Email sent to ${email}: ${subject}`);
    if (notifications.length > 20) notifications.pop();
    res.json({ success: true });
  } catch (error) {
    console.error('Custom email failed:', error);
    res.json({ success: false, message: 'Failed to send email.', error: error.message });
  }
});
// ...existing code...
// Test endpoint to send a mock email for debugging using Nodemailer
app.get('/test-send-email', async (req, res) => {
  try {
    const mailOptions = {
      from: 'Ayomide <ayomideoluniyi49@gmail.com>',
      to: 'ayomideoluniyi49@gmail.com',
      subject: 'Test Email from Admin',
      html: '<h2>This is a test email from your server.js setup.</h2><p>If you receive this, your Nodemailer integration is working.</p>'
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent:', info);
    res.json({ success: true, info });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// Place this after app is initialized and middleware setup
// Supabase Admin API for listing users
const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
const supabaseAdmin = createSupabaseClient(
  'https://jlwxkykznyjmstpjcgks.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMxMDE0MiwiZXhwIjoyMDY5ODg2MTQyfQ.DMN5xWfQ5jRsTYi-BBP5apNUuXhUWU5y80aTHSQeiL4'
);
const PORT = process.env.PORT || 3000;
// Configure Nodemailer transporter (use your Gmail and app password)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ayomideoluniyi49@gmail.com',
    pass: 'taqm vuiw bsxc vbal' // Updated app password
  }
});


// Resend email integration
const { Resend } = require('resend');
const resend = new Resend('re_CG4qokFC_5KUhQjpaKGYMincxEpB78b3X');

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

// Endpoint to send email
app.post('/send-email', async (req, res) => {
  const { to, subject, html } = req.body;
  console.log('POST /send-email called with:', { to, subject });
  try {
    const data = await resend.emails.send({
      from: 'Your Name <your@email.com>', // Change to your verified sender
      to,
      subject,
      html
    });
    console.log('Resend API response:', data);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


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
          <hr />
          <p>If you have any questions, please reply to this email.</p>
          <p style="color: #888; font-size: 0.9em;">Thank you for shopping with us!</p>
        </div>
      `
    };
    console.log('Sending status email with options:', mailOptions);
    const info = await transporter.sendMail(mailOptions);
    console.log('Status email sent:', info);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending status email:', error);
    res.json({ success: false, message: 'Failed to send status email.', error: error.message });
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

// Get all users for admin panel (Supabase Auth)
app.get('/api/user-list', async (req, res) => {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    return res.json({ success: false, error: error.message });
  }
  res.json({ success: true, users: data.users });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

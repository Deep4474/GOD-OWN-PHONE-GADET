const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUsers, saveUsers } = require('./userData');
const { getProducts } = require('./productData');
const { orders } = require('./orderData');
const { authenticateAdmin } = require('./authMiddleware');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Admin Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  let users = getUsers();
  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ error: 'Admin already exists with this email' });
  }
  const hashed = await bcrypt.hash(password, 12);
  const newAdmin = {
    id: Date.now().toString(),
    name,
    email,
    password: hashed,
    role: 'admin',
    createdAt: new Date().toISOString()
  };
  users.push(newAdmin);
  saveUsers(users);
  // Generate token for auto-login
  const token = jwt.sign(
    { email: newAdmin.email, role: newAdmin.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
  res.json({ success: true, user: { name, email, role: 'admin' }, token });
});

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const user = getUsers().find(u => u.email === email && u.role === 'admin');
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign(
    { email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
  res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
});

// Admin Dashboard (protected)
router.get('/dashboard', authenticateAdmin, (req, res) => {
  const users = getUsers();
  const products = getProducts();
  // Calculate summary
  const totalUsers = users.length;
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  // Get recent orders (last 5)
  const recentOrders = orders.slice(-5).reverse().map(order => {
    const user = users.find(u => u.id === order.userId) || {};
    return {
      _id: order._id,
      userId: order.userId,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt
    };
  });

  res.json({
    stats: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      recentOrders
    }
  });
});

// DEBUG: List all admin users (REMOVE IN PRODUCTION)
router.get('/debug-admins', (req, res) => {
  const users = getUsers();
  const admins = users.filter(u => u.role === 'admin');
  res.json({ admins });
});

// DEBUG: Show current password hash for admin@example.com
router.get('/debug-admin-password', (req, res) => {
  const users = getUsers();
  const admin = users.find(u => u.email === 'admin@example.com');
  if (admin) {
    res.json({ email: admin.email, password: admin.password });
  } else {
    res.json({ error: 'admin@example.com not found' });
  }
});

// --- FORCE DELETE and recreate users.json with only the default admin user on server start ---
const usersFilePath = path.join(__dirname, './users.json');

(() => {
  try {
    if (fs.existsSync(usersFilePath)) {
      fs.unlinkSync(usersFilePath);
    }
  } catch (e) {
    console.error('Could not delete users.json:', e);
  }
  const hashed = bcrypt.hashSync('admin1234', 12);
  const users = [
    {
      id: Date.now().toString(),
      name: 'Default Admin',
      email: 'admin@example.com',
      password: hashed,
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ];
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  console.log('users.json forcibly recreated with only default admin user.');
})();

module.exports = router; 
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUsers, saveUsers } = require('./userData');
const { getProducts } = require('./productData');
const { orders } = require('./orderData');
const { authenticateAdmin } = require('./authMiddleware');
const router = express.Router();

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
  res.json({ success: true, user: { name, email, role: 'admin' } });
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

module.exports = router; 
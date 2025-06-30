const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { authenticateToken, isAdmin } = require('./authMiddleware');
const { v4: uuidv4 } = require('uuid');
const { orders, saveOrders } = require('./orderData');
const { products } = require('./productData');
const { users } = require('./userData');
const { notifications, saveNotifications } = require('./notificationData');

const ADMIN_USERS_FILE = path.join(__dirname, './admin-users.json');

// A simple test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin route is working' });
});

module.exports = router; 
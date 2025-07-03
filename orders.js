const express = require('express');
const router = express.Router();
const { orders, saveOrders } = require('./orderData');
const { authenticateToken } = require('./authMiddleware');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const { getUsers } = require('./userData');
const { getProducts } = require('./productData');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ayomideoluniyi49@gmail.com',
    pass: 'nlpy xohr iuli tszl',
  },
});

// Get all orders (admin)
router.get('/', (req, res) => {
  res.json({ orders });
});

// Get orders for the logged-in user
router.get('/user', authenticateToken, (req, res) => {
  try {
    
    const userOrders = orders.filter(order => order.userId === req.user.userId);
    res.json({ orders: userOrders });
  } catch (error) {
    console.error('Failed to get user orders:', error);
    res.status(500).json({ error: 'Failed to get user orders' });
  }
});

// Get orders for a user
router.get('/user/:userId', (req, res) => {
  const userOrders = orders.filter(o => o.userId === req.params.userId);
  res.json({ orders: userOrders });
});

// Create a new order
router.post('/create', async (req, res) => {
  const { userId, productId, quantity, deliveryOption, paymentMethod, deliveryAddress, totalAmount } = req.body;
  
  const requiredFields = { userId, productId, quantity, deliveryOption, paymentMethod, deliveryAddress, totalAmount };
  const missingFields = Object.entries(requiredFields)
    .filter(([key, value]) => value === undefined || value === null)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
  }

  const newOrder = {
    _id: Date.now().toString(),
    userId,
    productId,
    quantity,
    deliveryOption,
    paymentMethod,
    deliveryAddress,
    totalAmount,
    status: 'pending',
    createdAt: new Date().toISOString(),
    adminMessage: ''
  };
  orders.push(newOrder);
  saveOrders(orders);

  // Send order confirmation email to user
  try {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    const products = getProducts();
    const product = products.find(p => p._id === productId || p.id === productId);
    if (user && user.email) {
      let orderDetails = `Order Details:\n`;
      orderDetails += `Order ID: ${newOrder._id}\n`;
      orderDetails += `Product: ${product ? product.name : productId}\n`;
      orderDetails += `Quantity: ${quantity}\n`;
      orderDetails += `Total: ₦${totalAmount}\n`;
      orderDetails += `Status: pending\n`;
      orderDetails += `Date: ${new Date(newOrder.createdAt).toLocaleString()}\n`;
      await transporter.sendMail({
        from: `ONGOD Gadget Shop <ayomideoluniyi49@gmail.com>`,
        to: user.email,
        subject: "Order Confirmation - GOD'SOWN PHONE GADGET",
        text: `Thank you for your order!\n\n${orderDetails}\n\nWe will update you when your order status changes.`
      });
    }
  } catch (e) {
    console.error('Order confirmation email error:', e);
  }

  res.status(201).json({ success: true, order: newOrder });
});

// Update order status (admin)
router.put('/:id/update', async (req, res) => {
  const { status, message } = req.body;
  const order = orders.find(o => o._id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (status) order.status = status;
  if (message) order.adminMessage = message;
  saveOrders(orders);

  // Send order update email to user
  try {
    const users = getUsers();
    const user = users.find(u => u.id === order.userId);
    const products = getProducts();
    const product = products.find(p => p._id === order.productId || p.id === order.productId);
    if (user && user.email) {
      let updateDetails = `Order Update:\n`;
      updateDetails += `Order ID: ${order._id}\n`;
      updateDetails += `Product: ${product ? product.name : order.productId}\n`;
      updateDetails += `Status: ${order.status}\n`;
      if (order.adminMessage) updateDetails += `Admin Message: ${order.adminMessage}\n`;
      updateDetails += `Date: ${new Date().toLocaleString()}\n`;
      await transporter.sendMail({
        from: `ONGOD Gadget Shop <ayomideoluniyi49@gmail.com>`,
        to: user.email,
        subject: "Order Update - GOD'SOWN PHONE GADGET",
        text: `${updateDetails}`
      });
    }
  } catch (e) {
    console.error('Order update email error:', e);
  }

  res.json({ success: true, order });
});

module.exports = router; 
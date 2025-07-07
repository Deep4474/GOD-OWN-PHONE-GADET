const express = require('express');
const router = express.Router();
const orders = require('./orders.json');
const fs = require('fs');

router.get('/user', (req, res) => {
  res.json({ orders });
});

router.get('/', (req, res) => {
  res.json(orders);
});

router.post('/', (req, res) => {
  const newOrder = {
    _id: (orders.length + 1).toString(),
    ...req.body,
    status: req.body.status || 'pending',
    createdAt: new Date().toISOString()
  };
  orders.push(newOrder);
  fs.writeFileSync('./orders.json', JSON.stringify(orders, null, 2));
  res.status(201).json({ success: true, order: newOrder });
});

module.exports = router; 
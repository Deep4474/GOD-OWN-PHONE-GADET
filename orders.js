const express = require('express');
const router = express.Router();
const orders = require('./orders.json');

router.get('/user', (req, res) => {
  res.json({ orders });
});

module.exports = router; 
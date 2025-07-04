const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ notifications: [] });
});

router.get('/unread-count', (req, res) => {
  res.json({ count: 0 });
});

module.exports = router; 
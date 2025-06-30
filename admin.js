const express = require('express');
const router = express.Router();

// A simple test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin route is working' });
});

module.exports = router; 
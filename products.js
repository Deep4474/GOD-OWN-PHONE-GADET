const express = require('express');
const router = express.Router();
const products = require('./products.json');
const fs = require('fs');

router.get('/', (req, res) => {
  res.json(products);
});

router.post('/', (req, res) => {
  const newProduct = {
    _id: (products.length + 1).toString(),
    ...req.body
  };
  products.push(newProduct);
  fs.writeFileSync('./products.json', JSON.stringify(products, null, 2));
  res.status(201).json({ success: true, product: newProduct });
});

module.exports = router; 
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

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const index = products.findIndex(p => p._id === id || p.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  products.splice(index, 1);
  fs.writeFileSync('./products.json', JSON.stringify(products, null, 2));
  res.json({ success: true });
});

module.exports = router; 
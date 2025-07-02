const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, './products.json');

function loadProducts() {
  try {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveProducts(products) {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
}

function getProducts() {
  return loadProducts();
}

module.exports = { getProducts, saveProducts }; 
// Script to import products.json into MongoDB using your Product model
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || '';
if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env');
  process.exit(1);
}

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  category: String,
  description: String,
  stock: Number,
  images: [String]
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function importProducts() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const productsPath = path.join(__dirname, 'products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  // Remove all existing products (optional, comment out if you want to keep old ones)
  await Product.deleteMany({});
  // Insert new products
  await Product.insertMany(products);
  console.log('Products imported successfully!');
  await mongoose.disconnect();
}

importProducts().catch(err => {
  console.error('Error importing products:', err);
  process.exit(1);
});

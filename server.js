const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 4003; // or any other free port
const JWT_SECRET = 'demo_jwt_secret';

const usersFile = path.join(__dirname, 'users.json');
const productsFile = path.join(__dirname, 'products.json');
const ordersFile = path.join(__dirname, 'orders.json');
const updatesFile = path.join(__dirname, 'updates.json');
const notificationsFile = path.join(__dirname, 'customerMessages.json');

app.use(cors());
app.use(express.json());

// --- Helper functions ---
function readUsers() {
  if (!fs.existsSync(usersFile)) return [];
  return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
}
function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}
function readProducts() {
  if (!fs.existsSync(productsFile)) return [];
  return JSON.parse(fs.readFileSync(productsFile, 'utf8'));
}

function readOrders() {
  if (!fs.existsSync(ordersFile)) return [];
  return JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
}
function writeOrders(orders) {
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

function readUpdates() {
  if (!fs.existsSync(updatesFile)) return [];
  return JSON.parse(fs.readFileSync(updatesFile, 'utf8'));
}
function writeUpdates(updates) {
  fs.writeFileSync(updatesFile, JSON.stringify(updates, null, 2));
}

function readNotifications() {
  if (!fs.existsSync(notificationsFile)) return [];
  return JSON.parse(fs.readFileSync(notificationsFile, 'utf8'));
}
function writeNotifications(notifs) {
  fs.writeFileSync(notificationsFile, JSON.stringify(notifs, null, 2));
}
function addNotification(email, message) {
  const notifs = readNotifications();
  notifs.unshift({
    id: Date.now(),
    email,
    message,
    date: new Date().toISOString()
  });
  writeNotifications(notifs);
}

// Configure nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ayomideoluniyi49@gmail.com',
    pass: 'jqll jznz cdog uyix' // Use an App Password, not your real Gmail password!
  }
});

// --- Register ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || !confirmPassword) return res.status(400).json({ error: 'Missing fields' });
  if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });
  // Password strength: at least one number, one uppercase, one symbol, min 8 chars
  const strongPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!strongPassword.test(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters and include a number, an uppercase letter, and a symbol.' });
  }
  let users = readUsers();
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already registered' });
  const hashed = await bcrypt.hash(password, 10);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const user = { name, email, password: hashed, verified: false, code };
  users.push(user);
  writeUsers(users);

  // Send verification code to user's email
  try {
    await transporter.sendMail({
      from: "GOD'S OWN PHONE GADGET <YOUR_GMAIL_ADDRESS@gmail.com>",
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${code}`,
      html: `<p>Your verification code is: <b>${code}</b></p>`
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send verification email.' });
  }

  res.json({ user: { name, email }, message: 'Registered. Check your email for the code.' });
});

// --- Login ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  let users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  if (!user.verified) return res.status(403).json({ error: 'Please verify your email.' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ user: { name: user.name, email: user.email }, token });
});

// --- Verify Email ---
app.post('/api/auth/verify', (req, res) => {
  const { email, code } = req.body;
  let users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'User not found' });
  if (user.verified) return res.json({ success: true, message: 'Already verified' });
  if (user.code !== code) return res.status(400).json({ error: 'Invalid code' });
  user.verified = true;
  user.code = undefined;
  writeUsers(users);
  res.json({ success: true, message: 'Email verified' });
});

// --- Get Products ---
app.get('/api/products', (req, res) => {
  res.json(readProducts());
});

// --- Add new product (admin) ---
app.post('/api/products', (req, res) => {
  const { name, price, category, description, stock, imageUrl } = req.body;
  if (!name || !price || !category || !description || !stock || !imageUrl) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const products = readProducts();
  const newProduct = {
    id: Date.now(),
    name,
    price,
    category,
    description,
    stock,
    images: [imageUrl]
  };
  products.push(newProduct);
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  res.json({ success: true, product: newProduct });
});

// --- Delete product (admin) ---
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  let products = readProducts();
  const initialLength = products.length;
  products = products.filter(p => String(p.id) !== String(id) && String(p._id) !== String(id));
  if (products.length === initialLength) {
    return res.status(404).json({ error: 'Product not found' });
  }
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  res.json({ success: true });
});

// --- Edit product (admin) ---
app.patch('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, category, description, stock, imageUrl } = req.body;
  let products = readProducts();
  const product = products.find(p => String(p.id) === String(id) || String(p._id) === String(id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (name) product.name = name;
  if (price) product.price = price;
  if (category) product.category = category;
  if (description) product.description = description;
  if (stock) product.stock = stock;
  if (imageUrl) product.images = [imageUrl];
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  res.json({ success: true, product });
});

// --- Place Order ---
app.post('/api/orders', (req, res) => {
  const { productId, quantity, address, phone, email, deliveryMethod, paymentMethod } = req.body;
  if (!productId || !quantity || !phone || !email || !deliveryMethod || !paymentMethod) {
    return res.status(400).json({ error: 'Missing order details' });
  }
  if (deliveryMethod === 'Deliver' && !address) {
    return res.status(400).json({ error: 'Address required for delivery' });
  }
  const orders = readOrders();
  const newOrder = {
    id: Date.now(),
    productId,
    quantity,
    address: deliveryMethod === 'Deliver' ? address : '',
    phone,
    email,
    deliveryMethod,
    paymentMethod,
    status: 'pending',
    date: new Date().toISOString()
  };
  orders.push(newOrder);
  writeOrders(orders);
  addNotification(email, 'Your order has been placed successfully!');
  res.json({ success: true, message: 'Order placed successfully', order: newOrder });
});

// --- Update order status ---
app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status required' });
  const orders = readOrders();
  const order = orders.find(o => String(o.id) === String(id));
  if (!order) {
    console.log('Order not found! All IDs:', orders.map(o => o.id), 'Requested:', id);
    return res.status(404).json({ error: 'Order not found' });
  }
  order.status = status;
  writeOrders(orders);
  addNotification(order.email, `Your order status was updated to: ${status}`);
  res.json({ success: true, order });
});

// --- Get orders for a user or all orders (admin) ---
app.get('/api/orders', (req, res) => {
  const { email } = req.query;
  if (email) {
    const orders = readOrders().filter(o => o.email === email);
    return res.json(orders);
  }
  // If no email, return all orders (admin)
  res.json(readOrders());
});

// --- Get all users (admin) ---
app.get('/api/users', (req, res) => {
  const users = readUsers().map(u => ({
    name: u.name,
    email: u.email,
    verified: u.verified
  }));
  res.json(users);
});

// --- Send update to all users (admin) ---
app.post('/api/updates', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  const updates = readUpdates();
  const update = { id: Date.now(), message, date: new Date().toISOString() };
  updates.unshift(update);
  writeUpdates(updates);
  // (Optional: Email logic can be added here)
  res.json({ success: true, update });
});

// --- Get all updates (for users) ---
app.get('/api/updates', (req, res) => {
  res.json(readUpdates());
});

// --- Get notifications for a user ---
app.get('/api/notifications', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const notifs = readNotifications().filter(n => n.email === email);
  res.json(notifs);
});

// --- Delete all notifications (admin/user) ---
app.delete('/api/notifications', (req, res) => {
  writeNotifications([]);
  res.json({ success: true, message: 'All notifications deleted.' });
});

// --- Get current user info (token required) ---
app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let users = readUsers();
    const user = users.find(u => u.email === decoded.email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ name: user.name, email: user.email, verified: user.verified });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// --- Delete User by Email ---
app.delete('/api/auth/user', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  let users = readUsers();
  const initialLength = users.length;
  users = users.filter(u => u.email !== email);
  if (users.length === initialLength) {
    return res.status(404).json({ error: 'User not found' });
  }
  writeUsers(users);
  res.json({ success: true, message: `User ${email} deleted.` });
});

// --- Root welcome route ---
app.get('/', (req, res) => {
  res.send("Welcome to GOD'S OWN PHONE GADGET API!");
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
}); 
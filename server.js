require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 4003;
const JWT_SECRET = process.env.JWT_SECRET || 'demo_jwt_secret';

// Data file paths
const usersFile = path.join(__dirname, 'users.json');
const productsFile = path.join(__dirname, 'products.json');
const ordersFile = path.join(__dirname, 'orders.json');
const updatesFile = path.join(__dirname, 'updates.json');
const notificationsFile = path.join(__dirname, 'customerMessages.json');

app.use(cors());
app.use(express.json());

// Security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Helper functions ---
function safeRead(file) {
  try {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return [];
  }
}
function safeWrite(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// --- Nodemailer transporter (Gmail) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // set in Render env vars
    pass: process.env.EMAIL_PASS  // set in Render env vars
  }
});

// --- Register ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || !confirmPassword) return res.status(400).json({ error: 'Missing fields' });
  if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });
  const strongPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!strongPassword.test(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters and include a number, an uppercase letter, and a symbol.' });
  }
  let users = safeRead(usersFile);
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already registered' });
  const hashed = await bcrypt.hash(password, 10);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const user = { name, email, password: hashed, verified: false, code };
  users.push(user);
  safeWrite(usersFile, users);
  try {
    await transporter.sendMail({
      from: `GOD'S OWN PHONE GADGET <${process.env.EMAIL_USER}>`,
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
  let users = safeRead(usersFile);
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
  let users = safeRead(usersFile);
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'User not found' });
  if (user.verified) return res.json({ success: true, message: 'Already verified' });
  if (user.code !== code) return res.status(400).json({ error: 'Invalid code' });
  user.verified = true;
  user.code = undefined;
  safeWrite(usersFile, users);
  res.json({ success: true, message: 'Email verified' });
});

// --- Get Products ---
app.get('/api/products', (req, res) => {
  res.json(safeRead(productsFile));
});

// --- Add new product (admin) ---
app.post('/api/products', (req, res) => {
  const { name, price, category, description, stock, imageUrl } = req.body;
  if (!name || !price || !category || !description || !stock || !imageUrl) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const products = safeRead(productsFile);
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
  safeWrite(productsFile, products);
  res.json({ success: true, product: newProduct });
});

// --- Delete product (admin) ---
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  let products = safeRead(productsFile);
  const initialLength = products.length;
  products = products.filter(p => String(p.id) !== String(id));
  if (products.length === initialLength) {
    return res.status(404).json({ error: 'Product not found' });
  }
  safeWrite(productsFile, products);
  res.json({ success: true });
});

// --- Edit product (admin) ---
app.patch('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, category, description, stock, imageUrl } = req.body;
  let products = safeRead(productsFile);
  const product = products.find(p => String(p.id) === String(id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (name) product.name = name;
  if (price) product.price = price;
  if (category) product.category = category;
  if (description) product.description = description;
  if (stock) product.stock = stock;
  if (imageUrl) product.images = [imageUrl];
  safeWrite(productsFile, products);
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
  const orders = safeRead(ordersFile);
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
  safeWrite(ordersFile, orders);
  // Add notification
  const notifs = safeRead(notificationsFile);
  notifs.unshift({ id: Date.now(), email, message: 'Your order has been placed successfully!', date: new Date().toISOString() });
  safeWrite(notificationsFile, notifs);
  res.json({ success: true, message: 'Order placed successfully', order: newOrder });
});

// --- Update order status ---
app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status required' });
  const orders = safeRead(ordersFile);
  const order = orders.find(o => String(o.id) === String(id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = status;
  safeWrite(ordersFile, orders);
  // Add notification
  const notifs = safeRead(notificationsFile);
  notifs.unshift({ id: Date.now(), email: order.email, message: `Your order status was updated to: ${status}`, date: new Date().toISOString() });
  safeWrite(notificationsFile, notifs);
  res.json({ success: true, order });
});

// --- Get orders for a user or all orders (admin) ---
app.get('/api/orders', (req, res) => {
  const { email } = req.query;
  const orders = safeRead(ordersFile);
  if (email) {
    return res.json(orders.filter(o => o.email === email));
  }
  res.json(orders);
});

// --- Get all users (admin) ---
app.get('/api/users', (req, res) => {
  const users = safeRead(usersFile).map(u => ({ name: u.name, email: u.email, verified: u.verified }));
  res.json(users);
});

// --- Send update to all users (admin) ---
app.post('/api/updates', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  const updates = safeRead(updatesFile);
  const update = { id: Date.now(), message, date: new Date().toISOString() };
  updates.unshift(update);
  safeWrite(updatesFile, updates);
  res.json({ success: true, update });
});

// --- Get all updates (for users) ---
app.get('/api/updates', (req, res) => {
  res.json(safeRead(updatesFile));
});

// --- Get notifications for a user ---
app.get('/api/notifications', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const notifs = safeRead(notificationsFile).filter(n => n.email === email);
  res.json(notifs);
});

// --- Delete all notifications (admin/user) ---
app.delete('/api/notifications', (req, res) => {
  safeWrite(notificationsFile, []);
  res.json({ success: true, message: 'All notifications deleted.' });
});

// --- Get current user info (token required) ---
app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let users = safeRead(usersFile);
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
  let users = safeRead(usersFile);
  const initialLength = users.length;
  users = users.filter(u => u.email !== email);
  if (users.length === initialLength) {
    return res.status(404).json({ error: 'User not found' });
  }
  safeWrite(usersFile, users);
  res.json({ success: true, message: `User ${email} deleted.` });
});

// --- Serve frontend (React or static HTML) ---
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'build', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Frontend not found. Please build your frontend and place it in the 'build' folder.");
  }
});

// --- Root welcome route (for API only) ---
// (Handled by frontend catch-all above)

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
}); 
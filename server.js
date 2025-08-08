



const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
// const supabase = require('./supabaseClient');

const { sendVerificationEmail, sendOrderEmail } = require('./emailUtil');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

// API endpoint to get products from products.json
app.get('/api/products', (req, res) => {
	const productsPath = path.join(__dirname, 'products.json');
	fs.readFile(productsPath, 'utf8', (err, data) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to read products database.' });
		}
		try {
			const products = JSON.parse(data || '[]');
			res.json(products);
		} catch (e) {
			res.status(500).json({ error: 'Invalid products data.' });
		}
	});
});


// API endpoint for login (local file, only if verified)
app.post('/api/login', (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password required.' });
	}
	const usersPath = path.join(__dirname, 'users.json');
	fs.readFile(usersPath, 'utf8', (err, data) => {
		if (err) return res.status(500).json({ error: 'Failed to read users database.' });
		let users = [];
		try { users = JSON.parse(data || '[]'); } catch { users = []; }
		const user = users.find(u => u.email === email && u.password === password);
		if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
		if (!user.verified) return res.status(403).json({ error: 'Please verify your email before logging in.' });
		res.json({ id: user.id, name: user.name, email: user.email });
	});
});

// API endpoint for registration (local file, with email verification)
app.post('/api/register', async (req, res) => {
	const { name, email, password } = req.body;
	if (!name || !email || !password) {
		return res.status(400).json({ error: 'Name, email, and password required.' });
	}
	const usersPath = path.join(__dirname, 'users.json');
	fs.readFile(usersPath, 'utf8', async (err, data) => {
		if (err && err.code !== 'ENOENT') return res.status(500).json({ error: 'Failed to read users database.' });
		let users = [];
		try { users = JSON.parse(data || '[]'); } catch { users = []; }
		if (users.find(u => u.email === email)) {
			return res.status(409).json({ error: 'User already exists.' });
		}
		const code = Math.floor(100000 + Math.random() * 900000).toString();
		const newUser = { id: Date.now().toString(), name, email, password, verified: false, code };
		users.push(newUser);
		fs.writeFile(usersPath, JSON.stringify(users, null, 2), async err2 => {
			if (err2) return res.status(500).json({ error: 'Failed to save user.' });
			try {
				await sendVerificationEmail(email, code);
			} catch (e) {
				return res.status(500).json({ error: 'Failed to send verification email.' });
			}
			res.json({ success: true, message: 'Registration successful. Please check your email for the verification code.' });
		});
	});
});

// API endpoint to verify code
app.post('/api/verify', (req, res) => {
	const { email, code } = req.body;
	if (!email || !code) return res.status(400).json({ error: 'Email and code required.' });
	const usersPath = path.join(__dirname, 'users.json');
	fs.readFile(usersPath, 'utf8', (err, data) => {
		if (err) return res.status(500).json({ error: 'Failed to read users database.' });
		let users = [];
		try { users = JSON.parse(data || '[]'); } catch { users = []; }
		const user = users.find(u => u.email === email);
		if (!user) return res.status(404).json({ error: 'User not found.' });
		if (user.verified) return res.json({ success: true, message: 'Already verified.' });
		if (user.code !== code) return res.status(400).json({ error: 'Invalid code.' });
		user.verified = true;
		delete user.code;
		fs.writeFile(usersPath, JSON.stringify(users, null, 2), err2 => {
			if (err2) return res.status(500).json({ error: 'Failed to update user.' });
			res.json({ success: true, message: 'Email verified.' });
		});
	});
});

// API endpoint for order confirmation email
app.post('/api/order-email', (req, res) => {
	const { email, order } = req.body;
	if (!email || !order) return res.status(400).json({ error: 'Email and order required.' });
	sendOrderEmail(email, order)
		.then(() => res.json({ success: true }))
		.catch(() => res.status(500).json({ error: 'Failed to send order email.' }));
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});

// Enable CORS for all routes
const cors = require('cors');
app.use(cors());

// Express app setup
const express = require('express');
const app = express();
app.use(express.json());

// Get user info by id (requires user to be logged in)
app.get('/api/user/:id', async (req, res) => {
	const { id } = req.params;
	const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
	if (error) return res.status(404).json({ error: 'User not found.' });
	res.json(data);
});

// Update user profile info (name, address, profile_image)
app.put('/api/user/:id', async (req, res) => {
	const { id } = req.params;
	const { name, address, profile_image } = req.body;
	const updates = {};
	if (name) updates.name = name;
	if (address) updates.address = address;
	if (profile_image) updates.profile_image = profile_image;
	const { data, error } = await supabase.from('users').update(updates).eq('id', id).select();
	if (error) return res.status(400).json({ error: 'Update failed.' });
	res.json({ message: 'Profile updated!', user: data[0] });
});

// Admin: List all users (for management)
app.get('/api/users', async (req, res) => {
	const { data, error } = await supabase.from('users').select('*');
	if (error) return res.status(500).json({ error: 'Failed to fetch users.' });
	res.json(data);
});

// Serve favicon.ico and other static files from root
const path = require('path');
app.use(express.static(__dirname));


// Email verification code store (in-memory)
const verificationCodes = {};

// Email sending setup (Nodemailer, Gmail)
const nodemailer = require('nodemailer');
const EMAIL_USER = process.env.EMAIL_USER || 'ayomideoluniyi49@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'qpfa qypc nfbb rgaf';
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: EMAIL_USER,
		pass: EMAIL_PASS
	}
});



// Registration endpoint using Supabase Auth and insert into users table
app.post('/api/register', async (req, res) => {
	const { name, email, password } = req.body;
	if (!name || !email || !password) {
		return res.status(400).json({ error: 'Name, email, and password are required.' });
	}
	try {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { name } }
		});
		if (error) {
			if (error.message && error.message.includes('already registered')) {
				return res.status(400).json({ error: 'Email is already registered.' });
			}
			return res.status(400).json({ error: error.message || 'Registration failed.' });
		}
		// Insert user info into public.users table
		if (data && data.user) {
			await supabase.from('users').insert([
				{
					id: data.user.id,
					email: data.user.email,
					name: name
				}
			]);
		}
		res.json({ message: 'Registration successful! Please check your email to verify your account.' });
	} catch (err) {
		res.status(500).json({ error: 'Registration failed.' });
	}
});

// Verification endpoint
app.post('/api/verify', (req, res) => {
	const { email, code } = req.body;
	if (!email || !code) {
		return res.status(400).json({ error: 'Email and code are required.' });
	}
	if (verificationCodes[email] && verificationCodes[email] === code) {
		delete verificationCodes[email];
		res.json({ message: 'Email verified! You can now log in.' });
	} else {
		res.status(400).json({ error: 'Invalid code or email.' });
	}
});


// Login endpoint using Supabase Auth
app.post('/api/login', async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password are required.' });
	}
	try {
		const { data, error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			return res.status(400).json({ error: error.message || 'Login failed.' });
		}
		// Return session info to frontend
		res.json({ message: 'Login successful!', session: data.session, user: data.user });
	} catch (err) {
		res.status(500).json({ error: 'Login failed.' });
	}
});

// Supabase client setup
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://jlwxkykznyjmstpjcgks.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Homepage route
app.get('/', (req, res) => {
	res.send("Welcome to GOD'S OWN PHONE GADGET API!");
});

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

// Products endpoint (fetch from Supabase)
app.get('/api/products', async (req, res) => {
	const { data, error } = await supabase.from('products').select('*');
	if (error) return res.status(500).json({ error: 'Failed to fetch products from Supabase.' });
	res.json(data);
});

// Order endpoint (save order to Supabase)
app.post('/api/order', async (req, res) => {
	const order = req.body;
	if (!order || !order.email || !order.product_name) {
		return res.status(400).json({ error: 'Order must include email and product_name.' });
	}
	const { data, error } = await supabase.from('orders').insert([order]);
	if (error) return res.status(500).json({ error: 'Failed to save order to Supabase.' });
	// You can add email sending logic here if needed
	res.json({ success: true, data });
});

// Global error handler middleware (should be after all routes)
app.use((err, req, res, next) => {
	console.error('Global error:', err);
	res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Catch unhandled promise rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err);
	process.exit(1);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

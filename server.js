
// Express app setup
const express = require('express');
const app = express();
app.use(express.json());

// Placeholder registration endpoint
app.post('/api/register', (req, res) => {
	const { name, email, password } = req.body;
	if (!name || !email || !password) {
		return res.status(400).json({ error: 'Name, email, and password are required.' });
	}
	// Simulate registration success
	res.json({ message: 'Registration successful! Please verify your email.' });
});

// Placeholder verification endpoint
app.post('/api/verify', (req, res) => {
	const { email, code } = req.body;
	if (!email || !code) {
		return res.status(400).json({ error: 'Email and code are required.' });
	}
	// Simulate verification success
	res.json({ message: 'Email verified! You can now log in.' });
});

// Placeholder login endpoint
app.post('/api/login', (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password are required.' });
	}
	// Simulate login success
	res.json({ message: 'Login successful!' });
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

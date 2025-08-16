
// Express app and CORS setup


// --- Express and CORS setup (must be first!) ---
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({
    origin: ['https://glittery-torrone-d1184e.netlify.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://jlwxkykznyjmstpjcgks.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Email verification code store (in-memory)
// ...existing code...

// Email sending setup (Nodemailer, Gmail)
const nodemailer = require('nodemailer');
const verificationCodes = {};
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'ayomideoluniyi49@gmail.com',
		pass: 'qpfa qypc nfbb rgaf'
	}
});
const PORT = process.env.PORT || 3000;
// ...existing code...

// Serve favicon.ico and other static files from root
// ...existing code...
app.use(express.static(__dirname));



// Registration endpoint using Supabase Auth and insert into users table
app.post('/api/register', async (req, res) => {
	const { name, email, password } = req.body;
	console.log('Register request:', { name, email });
	if (!name || !email || !password) {
		console.log('Missing fields:', { name, email, password });
		return res.status(400).json({ error: 'Name, email, and password are required.' });
	}
	try {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { name } }
		});
		console.log('Supabase signUp result:', { data, error });
		if (error) {
			if (error.message && error.message.includes('already registered')) {
				console.log('Email already registered:', email);
				return res.status(400).json({ error: 'Email is already registered.' });
			}
			console.log('Registration error:', error);
			return res.status(400).json({ error: error.message || 'Registration failed.' });
		}
		// Insert user info into public.users table only if not already present
		if (data && data.user) {
			const { data: existingUser, error: existingError } = await supabase.from('users').select('id').eq('Email', data.user.email).single();
			if (!existingUser) {
				const insertRes = await supabase.from('users').insert([
					{
						id: data.user.id,
						Email: data.user.email,
						Name: name,
						verified: false
					}
				]);
				console.log('Insert response from supabase.from(users).insert:', insertRes);
				if (insertRes.error) {
					console.log('Error inserting user into users table:', insertRes.error);
				}
				if (insertRes.data) {
					console.log('Inserted user data:', insertRes.data);
				}
			} else {
				console.log('User already exists in users table:', data.user.email);
			}
			// Generate verification code and send email
			const code = Math.floor(100000 + Math.random() * 900000).toString();
			verificationCodes[email] = code;
			const mailOptions = {
				from: 'GODSOWN PHONE GADGET <ayomideoluniyi49@gmail.com>',
				to: email,
				subject: "GODSOWN PHONE GADGET Email Verification Code",
				text: `Welcome to GODSOWN PHONE GADGET! Your verification code is: ${code}`
			};
			transporter.sendMail(mailOptions, (err, info) => {
				if (err) {
					console.log('Error sending verification email:', err);
				} else {
					console.log('Verification email sent:', info.response);
				}
			});
		} else {
			console.log('No user data returned from signUp.');
		}
		res.json({ message: 'Registration successful! Please check your email for the verification code.' });
	} catch (err) {
		console.log('Registration catch error:', err);
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
		// Mark user as verified in Supabase users table
		supabase.from('users').update({ verified: true }).eq('Email', email)
			.then(() => {
				res.json({ message: 'Email verified! You can now log in.' });
			})
			.catch((err) => {
				res.status(500).json({ error: 'Verification succeeded, but failed to update user status.' });
			});
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
		// Check if user is verified in users table
		const { data: userRows, error: userError } = await supabase.from('users').select('verified').eq('Email', email).single();
		if (userError || !userRows) {
			return res.status(400).json({ error: 'User not found.' });
		}
		if (!userRows.verified) {
			return res.status(400).json({ error: 'Please verify your email before logging in.' });
		}
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
// ...existing code...

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
	console.log('Supabase products data:', data);
	if (error) {
		console.error('Supabase products error:', error);
		return res.status(500).json({ error: 'Failed to fetch products from Supabase.' });
	}
	res.json(data);
});

// Order endpoint (save order to Supabase)
// User profile endpoint
app.get('/api/user/:id', async (req, res) => {
	const { id } = req.params;
	if (!id) {
		return res.status(400).json({ error: 'User ID is required.' });
	}
	try {
		console.log('Fetching user with ID:', id);
		const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
		console.log('Supabase response:', { data, error });
		
		if (error) {
			console.error('Supabase error:', error);
			return res.status(500).json({ error: error.message });
		}
		if (!data) {
			return res.status(404).json({ error: 'User not found.' });
		}
		res.json(data);
	} catch (err) {
		console.error('Server error:', err);
		res.status(500).json({ error: 'Failed to fetch user profile.' });
	}
});
app.post('/api/order', async (req, res) => {
	const {
		email,
		product_name,
		quantity,
		phone,
		delivery_method,
		address,
		payment_method,
		location
	} = req.body;

	console.log('Received order:', req.body);

	// Only require product_name and quantity
	if (!product_name || !quantity) {
		console.log('Order validation failed:', req.body);
		return res.status(400).json({ error: 'Product name and quantity are required.' });
	}

	const order = {
		email,
		product_name,
		quantity,
		phone,
		delivery_method,
		address: delivery_method === 'Delivery' ? address : null,
		payment_method,
		location
	};

	const { data, error } = await supabase.from('orders').insert([order]);
	if (error) {
		console.error('Supabase order insert error:', error);
		return res.status(500).json({ error: 'Failed to save order to Supabase.' });
	}
	console.log('Order saved to Supabase:', data);
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
// ...existing code...
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

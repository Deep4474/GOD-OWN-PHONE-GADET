// Supabase client setup
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://jlwxkykznyjmstpjcgks.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
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

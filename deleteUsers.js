// Delete all users from Supabase 'users' table and Auth
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://jlwxkykznyjmstpjcgks.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const app = express();
app.use(express.json());

app.delete('/api/delete-all-users', async (req, res) => {
  try {
    // Get all users from users table
    const { data: users, error } = await supabase.from('users').select('id');
    if (error) return res.status(500).json({ error: error.message });
    if (!users || users.length === 0) return res.json({ message: 'No users to delete.' });
    // Delete users from users table
    const { error: delError } = await supabase.from('users').delete().neq('id', '');
    if (delError) return res.status(500).json({ error: delError.message });
    // Optionally: delete from Auth (requires admin API, not supported by client SDK)
    res.json({ message: 'All users deleted from users table.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => {
  console.log('Delete users API running on port 4000');
});

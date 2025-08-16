// Initialize Supabase Client
if (typeof window.supabaseClient === 'undefined') {
    window.supabaseUrl = 'https://jlwxkykznyjmstpjcgks.supabase.co';
    window.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ';
    window.supabaseClient = supabase.createClient(window.supabaseUrl, window.supabaseKey);
}

// Initialize Supabase Client
const initSupabase = () => {
    if (typeof window.supabaseClient === 'undefined') {
        window.supabaseUrl = 'https://jlwxkykznyjmstpjcgks.supabase.co';
        window.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ';
        
        try {
            window.supabaseClient = supabase.createClient(window.supabaseUrl, window.supabaseKey, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            });
            console.log('Supabase client initialized successfully');
            
            // Test the connection immediately
            window.supabaseClient.auth.getSession()
                .then(({ data: { session } }) => {
                    console.log('Auth state checked:', session ? 'Logged in' : 'Not logged in');
                })
                .catch(err => {
                    console.error('Auth check failed:', err.message);
                });
            
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
        }
    }
};

// Call initialization when the script loads
initSupabase();

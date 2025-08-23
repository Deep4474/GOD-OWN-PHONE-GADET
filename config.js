// Supabase configuration
const supabaseUrl = 'https://jlwxkykznyjmstpjcgks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ';

// Initialize Supabase Client
async function initSupabase() {
    if (typeof globalThis.supabaseClient === 'undefined') {
        try {
            globalThis.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            });
            console.log('Supabase client initialized successfully');
            
            // Test the connection immediately
            const { data: { session } } = await globalThis.supabaseClient.auth.getSession();
            console.log('Auth state checked:', session ? 'Logged in' : 'Not logged in');
            
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            throw error;
        }
    }
    return globalThis.supabaseClient;
}

// Initialize when imported
const supabaseClient = await initSupabase();

export default supabaseClient;

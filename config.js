// Initialize Supabase Client
if (typeof window.supabaseClient === 'undefined') {
    window.supabaseClient = supabase.createClient(AUTH_CONFIG.supabaseUrl, AUTH_CONFIG.supabaseKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
}

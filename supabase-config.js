// Supabase configuration
const SUPABASE_CONFIG = {
    url: 'https://jlwxkykznyjmstpjcgks.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ',
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storage: globalThis.localStorage,
            storageKey: 'supabase-auth-token',
        },
        db: {
            schema: 'public'
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    }
};

// Create Supabase client with retries
async function createSupabaseClient(retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const client = supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.key,
                SUPABASE_CONFIG.options
            );

            // Test the connection
            const { data: _data, error } = await client.auth.getSession();
            if (error) throw error;

            console.log('Supabase client created successfully');
            return client;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

// Initialize client
async function initializeSupabase() {
    try {
        globalThis.supabaseClient = await createSupabaseClient();
        return globalThis.supabaseClient;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        // Show error in UI
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => {
            el.textContent = 'Authentication service is temporarily unavailable. Please try again later.';
        });
        throw error;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        globalThis.supabaseClient = await initializeSupabase();
        // Dispatch event when Supabase is ready
        const event = new Event('supabaseready');
        globalThis.dispatchEvent(event);
    } catch (error) {
        console.error('Supabase initialization failed:', error);
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => {
            el.textContent = 'Authentication service is temporarily unavailable. Please try again later.';
        });
    }
});

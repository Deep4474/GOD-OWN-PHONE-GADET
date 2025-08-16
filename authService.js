// Authentication Service
class AuthService {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }

    // Register a new user
    async register(email, password, fullName, phone) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone
                    },
                    emailRedirectTo: 'https://glittery-torrone-d1184e.netlify.app/auth.html'
                }
            });

            if (error) throw error;

            // Send verification email
            await this.sendVerificationEmail(email);

            return { data, error: null };
        } catch (error) {
            console.error('Registration error:', error);
            return { data: null, error };
        }
    }

    // Send verification email
    async sendVerificationEmail(email) {
        try {
            const { error } = await this.supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: false,
                    emailRedirectTo: 'https://glittery-torrone-d1184e.netlify.app/auth.html'
                }
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Verification email error:', error);
            return { error };
        }
    }

    // Login with email
    async loginWithEmail(email) {
        try {
            const { error } = await this.supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: 'https://glittery-torrone-d1184e.netlify.app/auth.html?confirmation=true'
                }
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Login error:', error);
            return { error };
        }
    }

    // Get current session
    async getSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            if (error) throw error;
            return { session, error: null };
        } catch (error) {
            console.error('Get session error:', error);
            return { session: null, error };
        }
    }

    // Sign out
    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Sign out error:', error);
            return { error };
        }
    }

    // Get current user
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();
            if (error) throw error;
            return { user, error: null };
        } catch (error) {
            console.error('Get user error:', error);
            return { user: null, error };
        }
    }
}

// Create auth service instance
const authService = new AuthService(supabaseClient);

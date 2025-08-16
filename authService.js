// Authentication Service
class AuthService {
    constructor(supabaseClient) {
        if (!supabaseClient) {
            throw new Error('Supabase client is required');
        }
        this.supabase = supabaseClient;
    }

    // Register a new user
    async register(email, password, fullName, phone) {
        try {
            console.log('Starting registration process for:', email);
            
            // Input validation
            if (!email || !password || !fullName || !phone) {
                throw new Error('All fields are required');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            // Register user with Supabase
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone
                    },
                    // Use current domain for redirect
                    emailRedirectTo: `${window.location.origin}/auth.html`
                }
            });

            if (error) throw error;

            console.log('Registration successful:', data);

            // Send verification email
            await this.sendVerificationEmail(email);

            return { 
                data, 
                error: null,
                message: 'Registration successful! Please check your email for verification.' 
            };
        } catch (error) {
            console.error('Registration error:', error);
            return { 
                data: null, 
                error,
                message: error.message || 'Registration failed. Please try again.' 
            };
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

    // Login with email and password
    async loginWithEmail(email, password) {
        try {
            console.log('Attempting login for:', email);

            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // First try password login
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                // If password login fails, try magic link
                console.log('Password login failed, trying magic link...');
                const { error: otpError } = await this.supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth.html?confirmation=true`
                    }
                });

                if (otpError) throw otpError;
                
                return {
                    data: null,
                    error: null,
                    message: 'Magic link sent! Please check your email.'
                };
            }

            // Password login successful
            return {
                data,
                error: null,
                message: 'Login successful!'
            };

        } catch (error) {
            console.error('Login error:', error);
            return {
                data: null,
                error,
                message: error.message || 'Login failed. Please try again.'
            };
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

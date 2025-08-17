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
            
            // Basic validation
            if (!email || !password || !fullName) {
                throw new Error('Email, password, and name are required');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            // First check if user exists
            const { data: existingUser } = await this.supabase.auth.signInWithPassword({
                email,
                password: 'temp-check-123'
            }).catch(() => ({ data: null }));

            if (existingUser?.user) {
                throw new Error('Email already registered. Please login instead.');
            }

            // Proceed with sign up
            const { data: { user }, error: signUpError } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone_number: phone,
                        role: 'customer',
                        created_at: new Date().toISOString()
                    },
                    emailRedirectTo: window.location.origin + '/auth.html'
                }
            });

            if (signUpError) {
                console.error('Registration error:', signUpError.message);
                // Check for specific error types
                if (signUpError.message?.includes('already registered')) {
                    throw new Error('This email is already registered. Please try logging in instead.');
                } else if (signUpError.status === 500) {
                    throw new Error('Server error. Please try again in a few moments.');
                } else {
                    throw new Error(signUpError.message || 'Registration failed. Please try again.');
                }
            }

            if (!user) throw new Error('User registration failed');

            if (updateError) {
                console.error('Profile update error:', updateError);
                throw new Error('Failed to update user profile. Please try again.');
            }

            console.log('Registration successful:', user);

            // Send verification email
            await this.sendVerificationEmail(email);

            return { 
                data: { user },
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

            // Try password login first
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    throw new Error('Incorrect email or password');
                }
                
                // If password login fails with other error, try magic link
                console.log('Password login failed, trying magic link...');
                const { error: otpError } = await this.supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: window.location.origin + '/auth.html?confirmation=true'
                    }
                });

                if (otpError) {
                    if (otpError.message.includes('Email rate limit exceeded')) {
                        throw new Error('Too many attempts. Please try again later.');
                    }
                    throw otpError;
                }
                
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

// Create auth service instance and make it globally available
window.authService = new AuthService(window.supabaseClient);

// Signal that auth service is ready
window.dispatchEvent(new Event('authserviceready'));

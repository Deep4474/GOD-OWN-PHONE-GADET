// Admin registration handler
document.addEventListener('DOMContentLoaded', () => {
    // Ensure Supabase client exists
    if (!globalThis.supabaseClient) {
        console.error('Supabase client not initialized');
        const errorDiv = document.getElementById('registerError');
        errorDiv.textContent = 'System initialization error. Please refresh the page.';
        errorDiv.style.display = 'block';
        return;
    }

    const registerForm = document.getElementById('registerForm');
    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const submitButton = document.querySelector('.auth-button');

        try {
            // Reset error display
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';
            
            // Validate inputs
            if (!email || !password || !fullName || !phone) {
                throw new Error('Please fill in all required fields');
            }

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            // Validate phone number (Nigerian format)
            const phoneRegex = /^(\+?234|0)[789]\d{9}$/;
            const cleanPhone = phone.replace(/\s+/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                throw new Error('Please enter a valid Nigerian phone number (e.g., 0801234XXXX or +2348012345XXX)');
            }

            // Show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Creating Account...';

            // Create admin account with retry mechanism
            let retryCount = 0;
            const maxRetries = 3;
            let signUpError;
            let user;

            while (retryCount < maxRetries) {
                try {
                    const { data, error } = await globalThis.supabaseClient.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                full_name: fullName,
                                phone_number: cleanPhone,
                                isAdmin: true,
                                role: 'admin'
                            }
                        }
                    });

                    if (!error) {
                        user = data.user;
                        break;
                    }

                    signUpError = error;
                    
                    if (error.message.includes('already registered')) {
                        throw error;
                    }

                    if (error.message.includes('database')) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                        retryCount++;
                        continue;
                    }

                    throw error;
                } catch (e) {
                    if (!e.message.includes('database') || retryCount === maxRetries - 1) {
                        throw e;
                    }
                    retryCount++;
                }
            }

            if (signUpError) throw signUpError;

            if (!user) {
                throw new Error('Failed to create account');
            }

            // Show success message
            errorDiv.style.display = 'none';
            successDiv.textContent = 'Registration successful! Redirecting to login...';
            successDiv.style.display = 'block';

            // Clear form
            registerForm.reset();

            // Redirect to login after a delay
            setTimeout(() => {
                globalThis.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            
            // Handle different types of errors
            let errorMessage = error.message || 'Failed to create account. Please try again.';
            
            if (!navigator.onLine) {
                errorMessage = 'Please check your internet connection and try again.';
            } else if (error.message.includes('already registered') || error.message.includes('already been taken')) {
                errorMessage = 'This email is already registered. Please try logging in instead.';
            } else if (error.message.includes('database') || error.message.includes('Database')) {
                errorMessage = 'Server is busy. We will retry in 5 seconds...';
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Try Again';
                }, 5000);
            }

            // Show error with improved visibility on mobile
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
            errorDiv.style.color = '#dc3545';
            errorDiv.style.padding = '12px';
            errorDiv.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
            errorDiv.style.borderRadius = '4px';
            errorDiv.style.marginBottom = '15px';

            // Vibrate on mobile for error feedback
            if (navigator.vibrate) {
                navigator.vibrate(200);
            }
        } finally {
            if (!errorDiv.textContent.includes('Server is busy')) {
                submitButton.disabled = false;
                submitButton.textContent = 'Register';
            }
        }
    });
});

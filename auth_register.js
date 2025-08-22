// Form elements
const registerForm = document.getElementById('registerForm');
const verificationForm = document.getElementById('verificationForm');

// Initialize registration handlers
document.addEventListener('DOMContentLoaded', () => {
    if (!globalThis.supabaseClient) {
        console.error('Supabase client not initialized');
        return;
    }

    // Handle registration
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent any other submit handlers
        
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const fullName = document.getElementById('regFullName').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const submitButton = registerForm.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('registerError');

        // Basic validation
        if (!email || !password || !fullName || !phone) {
            globalThis.utils.showError('registerError', 'Please fill in all fields');
            return;
        }
        
        if (password.length < 6) {
            globalThis.utils.showError('registerError', 'Password must be at least 6 characters long');
            return;
        }

        try {
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            errorDiv.style.display = 'none';

            // Validate phone number (Nigerian format)
            const phoneRegex = /^(\+?234|0)[789]\d{9}$/;
            const cleanPhone = phone.replace(/\s+/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                throw new Error('Please enter a valid Nigerian phone number (e.g., 0801234XXXX or +2348012345XXX)');
            }

            // Create user account with password
            const { data, error } = await globalThis.supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone_number: cleanPhone,
                        role: 'customer',
                        created_at: new Date().toISOString()
                    }
                }
            });

            // Check if user was created successfully
            if (data?.user) {
                // Attempt immediate sign in
                const { error: signInError } = await globalThis.supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

                if (signInError) throw signInError;
            }

            if (error) throw error;

            // Show success message
            const successMessage = `
                <div class="success-animation">
                    <i class="fas fa-check-circle"></i>
                </div>
                <p>Registration successful!</p>
                <p class="success-details">Redirecting to the main page...</p>
            `;
            
            // Create a dedicated success box if it doesn't exist
            let successBox = document.getElementById('registerSuccess');
            if (!successBox) {
                successBox = document.createElement('div');
                successBox.id = 'registerSuccess';
                successBox.className = 'success-message';
                registerForm.insertBefore(successBox, submitButton);
            }
            
            successBox.innerHTML = successMessage;
            successBox.style.display = 'block';
            
            // Hide error message if any
            errorDiv.style.display = 'none';

            // Store email for verification
            localStorage.setItem('verificationEmail', email);

            // Disable form fields but don't reset
            const formInputs = registerForm.querySelectorAll('input');
            formInputs.forEach(input => {
                input.disabled = true;
            });
            
            // Change button text and style
            submitButton.innerHTML = '<i class="fas fa-check-circle"></i> Registration Complete';
            submitButton.style.backgroundColor = '#28a745';
            submitButton.disabled = true;
            
            // Add verification box with smooth transition
            const verificationBox = document.getElementById('verificationBox');
            if (verificationBox) {
                setTimeout(() => {
                    // Prepare verification form
                    const verificationEmail = document.getElementById('verificationEmail');
                    if (verificationEmail) {
                        verificationEmail.value = email;
                        verificationEmail.readOnly = true; // Prevent editing
                    }
                    
                    // Use the utility function to show verification form with animation
                    verificationBox.style.opacity = '0';
                    globalThis.utils.showForm(verificationBox);
                    requestAnimationFrame(() => {
                        verificationBox.style.transition = 'opacity 0.5s ease-in-out';
                        verificationBox.style.opacity = '1';
                    });
                }, 2000); // Show verification form after 2 seconds
            }

        } catch (error) {
            console.error('Registration error:', error);
            
            let errorMessage = error.message;
            if (!navigator.onLine) {
                errorMessage = 'Please check your internet connection and try again.';
            } else if (error.message.includes('already registered')) {
                errorMessage = 'This email is already registered. Please try logging in instead.';
            } else if (error.message.includes('rate limit')) {
                errorMessage = 'Too many attempts. Please try again in a few minutes.';
            }

            // Show error message using utility function
            globalThis.utils.showError('registerError', errorMessage);
            
            // Enable inputs in case they were disabled
            const formInputs = registerForm.querySelectorAll('input');
            formInputs.forEach(input => {
                input.disabled = false;
            });

            // Vibrate for error feedback on mobile
            if (navigator.vibrate) {
                navigator.vibrate(200);
            }
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Register';
        }
    });

    // Handle verification if verification form exists
    if (verificationForm) {
        verificationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('verificationEmail').value;
            const code = document.getElementById('verificationCode').value;
            const errorDiv = document.getElementById('verificationError');
            const submitButton = verificationForm.querySelector('button[type="submit"]');

            try {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
                errorDiv.style.display = 'none';

                // Verify the email
                const { error } = await globalThis.supabaseClient.auth.verifyOtp({
                    email,
                    token: code,
                    type: 'signup'
                });

                if (error) throw error;

                // Show success using utility function
                globalThis.utils.showSuccess('verificationSuccess', 'Email verified! Redirecting to login...');
                
                // Clear stored email
                localStorage.removeItem('verificationEmail');

                // Use the utility function to show login form after a delay
                setTimeout(() => {
                    const loginBox = document.getElementById('loginBox');
                    if (loginBox) {
                        globalThis.utils.showForm(loginBox);
                    }
                }, 2000);

            } catch (error) {
                console.error('Verification error:', error);
                errorDiv.textContent = 'Invalid or expired verification code. Please try again.';
                errorDiv.style.color = '#dc3545';
                errorDiv.style.display = 'block';
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Verify Email';
            }
        });
    }

    // Mobile enhancements
    if ('ontouchstart' in window) {
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('focus', () => {
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        });
    }
});

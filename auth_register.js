// Form elements
const registerBox = document.getElementById('registerBox');
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
        
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const fullName = document.getElementById('regFullName').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const submitButton = registerForm.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('registerError');

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

            // Create user account
            const { data: _data, error } = await globalThis.supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone_number: cleanPhone,
                        role: 'customer',
                        created_at: new Date().toISOString()
                    },
                    emailRedirectTo: globalThis.location.origin + '/auth.html'
                }
            });

            if (error) throw error;

            // Show success message
            errorDiv.textContent = 'Registration successful! Please check your email to verify your account.';
            errorDiv.style.color = '#28a745';
            errorDiv.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
            errorDiv.style.display = 'block';

            // Clear form
            registerForm.reset();

            // Store email for verification
            localStorage.setItem('verificationEmail', email);

            // Switch to verification form if it exists
            const verificationBox = document.getElementById('verificationBox');
            if (verificationBox) {
                const verificationEmail = document.getElementById('verificationEmail');
                if (verificationEmail) verificationEmail.value = email;
                verificationBox.classList.remove('hidden');
                registerBox.classList.add('hidden');
                verificationBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

            // Show error message
            errorDiv.textContent = errorMessage;
            errorDiv.style.color = '#dc3545';
            errorDiv.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
            errorDiv.style.display = 'block';
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

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

                // Show success and redirect
                errorDiv.textContent = 'Email verified! Redirecting to login...';
                errorDiv.style.color = '#28a745';
                errorDiv.style.display = 'block';

                // Redirect to login after successful verification
                setTimeout(() => {
                    globalThis.location.href = '/auth.html';
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

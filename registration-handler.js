// Initialize error element
const registerError = document.getElementById('registerError') || document.createElement('div');

// Handle registration form submission
async function handleRegistration(e) {
    e.preventDefault();
    
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const fullName = document.getElementById('regFullName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();

    // Add touch feedback for mobile
    if ('ontouchstart' in window) {
        e.target.classList.add('touch-feedback');
        setTimeout(() => e.target.classList.remove('touch-feedback'), 200);
    }

    // Get button and show loading state
    const submitButton = registerForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

    try {
        // Enhanced validation
        if (!email || !password || !fullName) {
            throw new Error('Please fill in all required fields');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Please enter a valid email address');
        }

        // Password validation
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        // Phone validation (Nigerian format)
        const phoneRegex = /^(\+?234|0)[789]\d{9}$/;
        const cleanPhone = phone.replace(/\s+/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            throw new Error('Please enter a valid Nigerian phone number (e.g., 0801234XXXX or +2348012345XXX)');
        }

        // Name validation
        if (fullName.length < 2) {
            throw new Error('Please enter your full name');
        }

        // Clear previous errors
        registerError.textContent = '';
        registerError.style.display = 'none';

        // Register the user with Supabase
        let data, error;
        let retryCount = 0;
        const maxRetries = 3;
        
        // Log registration attempt
        console.log('Attempting registration for:', email);

        while (retryCount < maxRetries) {
            try {
                const result = await window.supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            phone_number: cleanPhone, // Use cleaned phone number
                            role: 'customer'
                        },
                        emailRedirectTo: window.location.origin + '/auth.html'
                    }
                });
                
                data = result.data;
                error = result.error;

                if (!error) {
                    break; // Success - exit retry loop
                }

                if (error.message.includes('already registered')) {
                    throw error; // Don't retry for existing users
                }

                // If it's a database error, wait before retrying
                if (error.message.includes('database')) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                    retryCount++;
                    continue;
                }

                throw error; // For non-database errors, throw immediately
            } catch (e) {
                if (!e.message.includes('database') || retryCount === maxRetries - 1) {
                    throw e;
                }
                retryCount++;
            }
        }

        if (error) {
            console.error('Supabase registration error:', error);
            throw error;
        }

        if (!data?.user) {
            throw new Error('Failed to create user account. Please try again.');
        }

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Registration successful! Please check your email to verify your account.</span>
        `;
        registerForm.appendChild(successMessage);

        // Store email for verification
        localStorage.setItem('verificationEmail', email);

        // Switch to verification form
        setTimeout(() => {
            showForm(verificationBox);
            verificationEmail.value = email;
            otpInputContainer.classList.remove('hidden');
            sendVerificationBtn.textContent = 'Verify Code';
        }, 2000);

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle different types of errors
        let errorMessage = error.message;
        let retryTimeout = 0;

        if (!navigator.onLine) {
            errorMessage = 'Please check your internet connection and try again.';
        } else if (error.message.includes('already registered') || error.message.includes('already been taken')) {
            errorMessage = 'This email is already registered. Please try logging in instead.';
            // Show login link
            const loginLink = document.createElement('a');
            loginLink.href = '#';
            loginLink.textContent = 'Click here to login';
            loginLink.onclick = (e) => {
                e.preventDefault();
                showForm(loginBox);
            };
            registerError.appendChild(document.createElement('br'));
            registerError.appendChild(loginLink);
        } else if (error.message.includes('database') || error.message.includes('Database')) {
            errorMessage = 'Unable to create account at this time. Please try again later.';
            // Remove auto-retry for database errors
            retryTimeout = 0;
        } else if (error.message.includes('password')) {
            errorMessage = 'Password must be at least 6 characters long and contain both letters and numbers.';
        } else if (error.message.includes('rate') || error.message.includes('Rate')) {
            errorMessage = 'Too many attempts. Please wait a moment before trying again.';
            retryTimeout = 10000;
        }

        // Show error message with improved mobile visibility
        registerError.textContent = errorMessage;
        registerError.style.display = 'block';
        registerError.style.color = '#e74c3c';
        registerError.style.padding = '12px';
        registerError.style.borderRadius = '8px';
        registerError.style.marginBottom = '15px';
        registerError.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
        registerError.style.fontSize = '14px';

        // For mobile devices, ensure the error is visible
        if (window.innerWidth <= 768) {
            registerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Vibrate on mobile for error feedback
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }

        // If it's a temporary error, auto-retry
        if (retryTimeout > 0) {
            submitButton.disabled = true;
            let countdown = retryTimeout / 1000;
            // Only attempt one retry after timeout
            if (retryTimeout > 0) {
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                }, retryTimeout);
            }
        }

        // Vibrate on mobile for error feedback
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }

    } finally {
        // Restore button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
} // Close handleRegistration function

// Initialize registration form
if (registerForm) {
    registerForm.addEventListener('submit', handleRegistration);
}
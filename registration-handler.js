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

        // Register the user with Supabase directly
        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone_number: phone,
                    role: 'customer'
                }
            }
        });

        if (error) {
            console.error('Supabase registration error:', error);
            throw new Error(error.message);
        }

        if (!data.user) {
            throw new Error('Failed to create user account');
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
        if (!navigator.onLine) {
            errorMessage = 'Please check your internet connection and try again.';
        } else if (error.message.includes('already registered') || error.message.includes('already been taken')) {
            errorMessage = 'This email is already registered. Please try logging in instead.';
        } else if (error.message.includes('database') || error.message.includes('Database')) {
            errorMessage = 'Unable to create account at the moment. Please try again in a few minutes.';
        } else if (error.message.includes('password')) {
            errorMessage = 'Password must be at least 6 characters long and contain both letters and numbers.';
        }

        // Show error message with improved mobile visibility
        registerError.textContent = errorMessage;
        registerError.style.display = 'block';
        registerError.style.color = '#e74c3c';
        registerError.style.padding = '12px';
        registerError.style.borderRadius = '4px';
        registerError.style.marginBottom = '15px';
        registerError.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';

        // Vibrate on mobile for error feedback
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }

    } finally {
        // Restore button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

// Initialize registration form
if (registerForm) {
    registerForm.addEventListener('submit', handleRegistration);
}

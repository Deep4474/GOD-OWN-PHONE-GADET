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

        // Phone validation (if provided)
        if (phone) {
            const phoneRegex = /^\+?[\d\s-]{10,}$/;
            if (!phoneRegex.test(phone)) {
                throw new Error('Please enter a valid phone number');
            }
        }

        // Name validation
        if (fullName.length < 2) {
            throw new Error('Please enter your full name');
        }

        // Clear previous errors
        registerError.textContent = '';
        registerError.style.display = 'none';

        // Register the user
        const { data, error } = await authService.register(email, password, fullName, phone);

        if (error) throw error;

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
        } else if (error.message.includes('already registered')) {
            errorMessage = 'This email is already registered. Please try logging in instead.';
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

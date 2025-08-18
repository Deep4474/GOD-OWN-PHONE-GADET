// Check if user is already logged in immediately
async function checkAndRedirectLoggedInUser() {
    try {
        const { data: { session }, error: _error } = await supabaseClient.auth.getSession();
        if (session && !localStorage.getItem('preventRedirect')) {
            // User is logged in, show a confirmation dialog
            if (confirm('You are already logged in. Would you like to go to the main page?')) {
                globalThis.location.href = 'https://glittery-torrone-d1184e.netlify.app/index.html';
            } else {
                localStorage.setItem('preventRedirect', 'true');
            }
            return true;
        }
    } catch (error) {
        console.error('Error checking session:', error);
    }
    return false;
}

// Only run session check if not prevented
if (!localStorage.getItem('preventRedirect')) {
    checkAndRedirectLoggedInUser();
}

// Form containers
const loginBox = document.getElementById('loginBox');
const registerBox = document.getElementById('registerBox');
const confirmationBox = document.getElementById('confirmationBox');
const verificationBox = document.getElementById('verificationBox');

// Form elements
const loginForm = document.getElementById('loginForm');
const _loginEmail = document.getElementById('loginEmail');
const loginError = document.getElementById('loginError');
const loginSuccess = document.getElementById('loginSuccess');

// Register form elements
const registerForm = document.getElementById('registerForm');
const _regEmail = document.getElementById('regEmail');
const _regFullName = document.getElementById('regFullName');
const _regPhone = document.getElementById('regPhone');
const _regPassword = document.getElementById('regPassword');
const registerError = document.getElementById('registerError');

// Verification form elements
const _verificationForm = document.getElementById('verificationForm');
const verificationEmail = document.getElementById('verificationEmail');
const _verificationCode = document.getElementById('verificationCode');
const otpInputContainer = document.getElementById('otpInputContainer');
const _verificationError = document.getElementById('verificationError');
const _verificationSuccess = document.getElementById('verificationSuccess');
const sendVerificationBtn = document.getElementById('sendVerificationBtn');

// Navigation elements
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const _backToLoginFromVerification = document.getElementById('backToLoginFromVerification');

// Confirmation elements
const confirmYesBtn = document.getElementById('confirmYes');
const confirmNoBtn = document.getElementById('confirmNo');
const _confirmError = document.getElementById('confirmError');

// Form visibility toggling
function showForm(formToShow) {
    const forms = [loginBox, registerBox, confirmationBox, verificationBox];
    forms.forEach(form => {
        if (form === formToShow) {
            form.style.display = 'block';
            // Trigger reflow
            form.offsetHeight;
            form.classList.remove('hidden');
        } else {
            form.classList.add('hidden');
            setTimeout(() => {
                if (form.classList.contains('hidden')) {
                    form.style.display = 'none';
                }
            }, 300); // Match transition duration
        }
    });

    // Scroll to top of form with smooth animation
    globalThis.scrollTo({
        top: formToShow.offsetTop - 80,
        behavior: 'smooth'
    });

    // Clear any error messages
    const errorMessages = formToShow.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.textContent = '');
}

// Event listeners for form navigation
if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showForm(registerBox);
    });

    // Add touch feedback
    showRegisterLink.addEventListener('touchstart', () => {
        showRegisterLink.style.opacity = '0.7';
    });

    showRegisterLink.addEventListener('touchend', () => {
        showRegisterLink.style.opacity = '1';
    });
}

if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showForm(loginBox);
    });

    // Add touch feedback
    showLoginLink.addEventListener('touchstart', () => {
        showLoginLink.style.opacity = '0.7';
    });

    showLoginLink.addEventListener('touchend', () => {
        showLoginLink.style.opacity = '1';
    });
}

// Add input focus handling for mobile
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
        // Add slight delay to ensure keyboard is shown
        setTimeout(() => {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    });

    // Add visual feedback for touch
    input.addEventListener('touchstart', () => {
        input.style.backgroundColor = '#f0f0f0';
    });

    input.addEventListener('touchend', () => {
        input.style.backgroundColor = '#f8f9fa';
    });
});

// Form submission handlers
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Reset error/success messages
    loginError.textContent = "";
    loginSuccess.textContent = "";
    
    // Basic validation
    if (!email) {
        loginError.textContent = "Email is required";
        loginError.style.color = '#e74c3c';
        return;
    }

    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

    try {
        loginSuccess.textContent = "Attempting to log in...";
        loginSuccess.style.color = '#3498db';

        // Try login with password first, falls back to magic link
        const { data, error, message } = await authService.loginWithEmail(email, password);
        
        if (error) throw error;

        if (data) {
            // Regular login successful
            loginSuccess.textContent = "Login successful! Click here to continue to main page.";
            loginSuccess.style.color = '#2ecc71';
            
            // Create continue button
            const continueBtn = document.createElement('button');
            continueBtn.className = 'auth-button';
            continueBtn.textContent = 'Continue to Main Page';
            continueBtn.onclick = () => {
                globalThis.location.href = '/index.html';
            };
            loginBox.appendChild(continueBtn);
        } else {
            // Magic link sent
            loginSuccess.textContent = message;
            loginSuccess.style.color = '#2ecc71';
            localStorage.setItem('loginEmail', email);
        }

        // Add visual feedback
        showSuccessAnimation(loginBox);

    } catch (err) {
        console.error('Login error:', err);
        let errorMessage = err.message || 'Login failed. Please try again.';
        
        // Handle specific error cases
        if (errorMessage.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please try again.';
        } else if (errorMessage.includes('security purposes')) {
            errorMessage = 'Please wait a few seconds before trying again.';
        }
        
        loginError.textContent = errorMessage;
        loginError.style.color = '#e74c3c';
        loginSuccess.textContent = '';
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Login';
    }
});

// Handle registration form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const fullName = document.getElementById('regFullName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();

    // Get button and show loading state
    const submitButton = registerForm.querySelector('button[type="submit"]');
    globalThis.originalButtonText = submitButton.innerHTML; // Store it globally for access in finally block
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

    try {
        // Use registration helper for validation
        await globalThis.registrationHelpers.validateRegistration(email, password, fullName, phone);
        
        registerError.textContent = "";
        registerError.style.display = "none";
        // Show loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading-message';
        loadingMessage.innerHTML = `
            <div class="spinner"></div>
            <span>Creating your account...</span>
        `;
        registerForm.appendChild(loadingMessage);
        
        console.log('Attempting registration with email:', email);
        
        // Use authService for registration
        const { data, error } = await authService.register(email, password, fullName, phone);

        if (error) {
            // Use registration helper for error handling
            const errorMessage = await globalThis.registrationHelpers.handleRegistrationError(error);
            showError('registerError', errorMessage);
            throw error;
        }

        console.log('Registration successful:', data);

        // Store email for verification
        localStorage.setItem('verificationEmail', email);
        
        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Registration successful! Please check your email for the verification code.</span>
        `;
        registerForm.appendChild(successDiv);

        // Add success animation
        showSuccessAnimation(registerBox);
        
        // Switch to verification form after animation
        setTimeout(() => {
            showForm(verificationBox);
            verificationEmail.value = email;
            otpInputContainer.classList.remove('hidden');
            sendVerificationBtn.textContent = 'Verify Code';
        }, 2000);

    } catch (error) {
        console.error('Registration error details:', error);
        
        // Handle network errors specially
        if (!navigator.onLine) {
            showError('registerError', 'Please check your internet connection and try again.');
        } else {
            const errorMessage = error.message || 'Failed to register. Please try again.';
            showError('registerError', errorMessage);
        }

        // Add vibration feedback on mobile for errors
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }

    } finally {
        // Remove loading message if it exists
        const loadingMessage = registerForm.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
        
        // Restore button state
        submitButton.disabled = false;
        submitButton.innerHTML = globalThis.originalButtonText;
        
        // Scroll error into view if on mobile
        if (globalThis.innerWidth <= 768 && registerError.textContent) {
            registerError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
});

// Success animation
function showSuccessAnimation(container) {
    const successIcon = document.createElement('div');
    successIcon.className = 'success-icon';
    successIcon.innerHTML = '✓';
    container.appendChild(successIcon);

    setTimeout(() => {
        successIcon.remove();
    }, 2000);
}

// Handle confirmation box actions
confirmYesBtn.addEventListener('click', async () => {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;

        if (session) {
            // Store the session
            localStorage.setItem('sb-token', session.access_token);
            localStorage.setItem('user', JSON.stringify(session.user));
            
            // Check if the user is an admin
            const isAdmin = session.user?.user_metadata?.role === 'admin';
            
            // Show confirmation message with continue button
            const confirmMessage = document.createElement('div');
            confirmMessage.className = 'success-message';
            confirmMessage.innerHTML = `
                <p>Login confirmed! Click below to continue:</p>
                <button class="auth-button" onclick="globalThis.location.href='${
                    isAdmin ? 
                    'https://glittery-torrone-d1184e.netlify.app/admin/index.html' : 
                    'https://glittery-torrone-d1184e.netlify.app/index.html'
                }'">
                    Continue to ${isAdmin ? 'Admin' : 'Main'} Page
                </button>
            `;
            confirmationBox.appendChild(confirmMessage);
        } else {
            throw new Error('No session found');
        }
    } catch (error) {
        const _confirmError = document.getElementById('confirmError');
        confirmError.textContent = error.message || 'Failed to confirm login';
        confirmError.style.color = '#e74c3c';
    }
});

confirmNoBtn.addEventListener('click', async () => {
    try {
        // Sign out and clear any session
        await supabaseClient.auth.signOut();
        localStorage.removeItem('sb-token');
        localStorage.removeItem('user');
        localStorage.removeItem('loginEmail');
        
        // Show login form
        showForm(loginBox);
    } catch (error) {
        console.error('Error signing out:', error);
    }
});

// Mobile menu functionality
function initializeMobileNav() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    let isMenuOpen = false;

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            navLinks.classList.toggle('active');
            mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
            mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isMenuOpen ? 'hidden' : '';
            
            // Animate menu items
            const menuItems = navLinks.querySelectorAll('li');
            menuItems.forEach((item, index) => {
                item.style.transitionDelay = isMenuOpen ? `${index * 0.1}s` : '0s';
            });
        });

        // Close menu when clicking a link
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                isMenuOpen = false;
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                document.body.style.overflow = '';
            }
        });
    }
}

// Check URL parameters and user session on load
globalThis.addEventListener('load', async () => {
    // Initialize mobile navigation
    initializeMobileNav();
    
    // Check if this is a confirmation redirect
    const urlParams = new URLSearchParams(globalThis.location.search);
    const isConfirmation = urlParams.get('confirmation') === 'true';

    if (isConfirmation) {
        // Show confirmation box
        showForm(confirmationBox);
        return;
    }
    
    // Check if user is already logged in (if not already redirected)
    await checkAndRedirectLoggedInUser();
});

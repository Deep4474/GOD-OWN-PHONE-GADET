// Form containers
const loginBox = document.getElementById('loginBox');
const registerBox = document.getElementById('registerBox');
const confirmationBox = document.getElementById('confirmationBox');
const verificationBox = document.getElementById('verificationBox');

// Form elements
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginError = document.getElementById('loginError');
const loginSuccess = document.getElementById('loginSuccess');

// Register form elements
const registerForm = document.getElementById('registerForm');
const regEmail = document.getElementById('regEmail');
const regFullName = document.getElementById('regFullName');
const regPhone = document.getElementById('regPhone');
const regPassword = document.getElementById('regPassword');
const registerError = document.getElementById('registerError');

// Verification form elements
const verificationForm = document.getElementById('verificationForm');
const verificationEmail = document.getElementById('verificationEmail');
const verificationCode = document.getElementById('verificationCode');
const otpInputContainer = document.getElementById('otpInputContainer');
const verificationError = document.getElementById('verificationError');
const verificationSuccess = document.getElementById('verificationSuccess');
const sendVerificationBtn = document.getElementById('sendVerificationBtn');

// Navigation elements
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const backToLoginFromVerification = document.getElementById('backToLoginFromVerification');

// Confirmation elements
const confirmYesBtn = document.getElementById('confirmYes');
const confirmNoBtn = document.getElementById('confirmNo');
const confirmError = document.getElementById('confirmError');

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
    window.scrollTo({
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
    
    // Basic validation
    if (!email) {
        loginError.textContent = "Email is required";
        return;
    }

    try {
        loginError.textContent = "";
        loginSuccess.textContent = "Sending login link...";
        loginSuccess.style.color = '#3498db';

        // Send magic link for authentication
        const { error: otpError } = await supabaseClient.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: 'https://glittery-torrone-d1184e.netlify.app/auth.html?confirmation=true'
            }
        });
        
        if (otpError) throw otpError;

        // Show success message
        loginSuccess.textContent = "Login link sent! Please check your email (including spam folder).";
        loginSuccess.style.color = '#2ecc71';

        // Store email for confirmation
        localStorage.setItem('loginEmail', email);

    } catch (err) {
        console.error('Login error:', err);
        let errorMessage = err.message || 'Failed to send login link. Please try again.';
        
        // Handle rate limiting error specifically
        if (errorMessage.includes('security purposes')) {
            errorMessage = 'Please wait a few seconds before requesting another login link.';
        }
        
        loginError.textContent = errorMessage;
        loginError.style.color = '#e74c3c';
        loginSuccess.textContent = '';
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const fullName = document.getElementById('regFullName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();

    // Basic validation
    if (!email || !password || !fullName || !phone) {
        registerError.textContent = "All fields are required";
        registerError.style.color = '#e74c3c';
        return;
    }

    // Password validation
    if (password.length < 6) {
        registerError.textContent = "Password must be at least 6 characters long";
        registerError.style.color = '#e74c3c';
        return;
    }

    const submitButton = registerForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        registerError.textContent = "Creating your account...";
        console.log('Attempting registration with email:', email);
        
        // First create the user account
        const { data, error } = await supabaseClient.auth.signUp({
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

        // Then explicitly send the verification email
        const { error: otpError } = await supabaseClient.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false,
                emailRedirectTo: 'https://glittery-torrone-d1184e.netlify.app/auth.html'
            }
        });

        if (error) {
            console.error('Registration error:', error);
            throw error;
        }

        console.log('Registration successful:', data);

        // Store email for verification
        localStorage.setItem('verificationEmail', email);
        
        // Show success message and switch to verification form
        registerError.textContent = 'Registration successful! Please check your email for the verification code.';
        registerError.style.color = '#2ecc71';
        
        // Switch to verification form after 2 seconds
        setTimeout(() => {
            showForm(verificationBox);
            document.getElementById('verificationEmail').value = email;
            document.getElementById('otpInputContainer').classList.remove('hidden');
            document.getElementById('sendVerificationBtn').textContent = 'Verify Code';
        }, 2000);

    } catch (error) {
        console.error('Registration error details:', error);
        registerError.textContent = error.message || 'Failed to register. Please try again.';
        registerError.style.color = '#e74c3c';
    } finally {
        submitButton.disabled = false;
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
            
            // Redirect based on user role
            if (isAdmin) {
                window.location.href = 'https://glittery-torrone-d1184e.netlify.app/admin/index.html';
            } else {
                window.location.replace('https://glittery-torrone-d1184e.netlify.app/index.html');
            }
        } else {
            throw new Error('No session found');
        }
    } catch (error) {
        const confirmError = document.getElementById('confirmError');
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
window.addEventListener('load', async () => {
    // Initialize mobile navigation
    initializeMobileNav();
    // Check if this is a confirmation redirect
    const urlParams = new URLSearchParams(window.location.search);
    const isConfirmation = urlParams.get('confirmation') === 'true';

    if (isConfirmation) {
        // Show confirmation box
        showForm(confirmationBox);
        return;
    }

    // Check if user is already logged in
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
        window.location.href = 'https://glittery-torrone-d1184e.netlify.app/index.html';
    }
});

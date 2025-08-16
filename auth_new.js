<<<<<<< HEAD
// Form elements
const loginBox = document.getElementById('loginBox');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginError = document.getElementById('loginError');
const loginSuccess = document.getElementById('loginSuccess');

// Confirmation elements
const confirmationBox = document.getElementById('confirmationBox');
const confirmYesBtn = document.getElementById('confirmYes');
const confirmNoBtn = document.getElementById('confirmNo');
const confirmError = document.getElementById('confirmError');

// Navigation elements
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');

// Form visibility toggling
function showForm(formToShow) {
    [loginBox, confirmationBox].forEach(form => {
        if (form) form.classList.add('hidden');
    });
    if (formToShow) formToShow.classList.remove('hidden');
}

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim();
    
    // Basic validation
    if (!email) {
        loginError.textContent = "Please enter your email address";
        return;
    }

    try {
        // Disable form submission
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        loginError.textContent = "";
        loginSuccess.textContent = "Sending login link...";
        loginSuccess.style.color = '#3498db';

        // Send magic link for authentication
        const { error: otpError } = await supabaseClient.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin + '/auth.html?confirmation=true'
            }
        });
        
        if (otpError) throw otpError;

        // Show success message
        loginSuccess.textContent = "Login link sent! Please check your email (including spam folder).";
        loginSuccess.style.color = '#2ecc71';
        submitButton.textContent = "Link Sent";
        
        // Store email for confirmation
        localStorage.setItem('loginEmail', email);

    } catch (err) {
        console.error('Login error:', err);
        loginError.textContent = err.message || 'Failed to send login link. Please try again.';
        loginError.style.color = '#e74c3c';
        loginSuccess.textContent = '';
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = false;
    }
});

// Handle confirmation
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
                window.location.href = '/admin/index.html';
            } else {
                window.location.replace('/index.html');
            }
        } else {
            throw new Error('No session found');
        }
    } catch (error) {
        console.error('Confirmation error:', error);
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
        confirmError.textContent = error.message || 'Failed to cancel login';
        confirmError.style.color = '#e74c3c';
    }
});

// Handle navigation
if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/register.html';
    });
}

// Check URL parameters and session on load
window.addEventListener('load', async () => {
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
        // Redirect to appropriate page based on role
        const isAdmin = user.user_metadata?.role === 'admin';
        window.location.replace(isAdmin ? '/admin/index.html' : '/index.html');
    } else {
        // Show login form
        showForm(loginBox);
    }
});
=======
// Form elements
const loginBox = document.getElementById('loginBox');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginError = document.getElementById('loginError');
const loginSuccess = document.getElementById('loginSuccess');

// Confirmation elements
const confirmationBox = document.getElementById('confirmationBox');
const confirmYesBtn = document.getElementById('confirmYes');
const confirmNoBtn = document.getElementById('confirmNo');
const confirmError = document.getElementById('confirmError');

// Navigation elements
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');

// Form visibility toggling
function showForm(formToShow) {
    [loginBox, confirmationBox].forEach(form => {
        if (form) form.classList.add('hidden');
    });
    if (formToShow) formToShow.classList.remove('hidden');
}

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim();
    
    // Basic validation
    if (!email) {
        loginError.textContent = "Please enter your email address";
        return;
    }

    try {
        // Disable form submission
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        loginError.textContent = "";
        loginSuccess.textContent = "Sending login link...";
        loginSuccess.style.color = '#3498db';

        // Send magic link for authentication
        const { error: otpError } = await supabaseClient.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin + '/auth.html?confirmation=true'
            }
        });
        
        if (otpError) throw otpError;

        // Show success message
        loginSuccess.textContent = "Login link sent! Please check your email (including spam folder).";
        loginSuccess.style.color = '#2ecc71';
        submitButton.textContent = "Link Sent";
        
        // Store email for confirmation
        localStorage.setItem('loginEmail', email);

    } catch (err) {
        console.error('Login error:', err);
        loginError.textContent = err.message || 'Failed to send login link. Please try again.';
        loginError.style.color = '#e74c3c';
        loginSuccess.textContent = '';
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = false;
    }
});

// Handle confirmation
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
                window.location.href = '/admin/index.html';
            } else {
                window.location.replace('/index.html');
            }
        } else {
            throw new Error('No session found');
        }
    } catch (error) {
        console.error('Confirmation error:', error);
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
        confirmError.textContent = error.message || 'Failed to cancel login';
        confirmError.style.color = '#e74c3c';
    }
});

// Handle navigation
if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/register.html';
    });
}

// Check URL parameters and session on load
window.addEventListener('load', async () => {
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
        // Redirect to appropriate page based on role
        const isAdmin = user.user_metadata?.role === 'admin';
        window.location.replace(isAdmin ? '/admin/index.html' : '/index.html');
    } else {
        // Show login form
        showForm(loginBox);
    }
});
>>>>>>> c244ea11b21dc4ddcf325b735f3bbe3e72b2736f

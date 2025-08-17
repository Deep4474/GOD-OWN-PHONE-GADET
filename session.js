// Check user session and handle authentication
async function checkSession() {
    try {
        // First check if we're on the auth page
        const isAuthPage = window.location.pathname.includes('auth.html');
        
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error || !user) {
            // No valid session
            if (!isAuthPage) {
                // Only redirect to login if we're not already on the auth page
                window.location.replace('https://glittery-torrone-d1184e.netlify.app/auth.html');
            }
            return;
        }

        // User is logged in
        if (isAuthPage) {
            // If we're on the auth page and logged in, redirect to main page
            window.location.replace('https://glittery-torrone-d1184e.netlify.app/index.html');
            return;
        }

        // Store user info for use in the application
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update UI based on authentication
        updateAuthUI(user);
        
    } catch (error) {
        console.error('Session check failed:', error);
        if (!window.location.pathname.includes('auth.html')) {
            window.location.replace('https://glittery-torrone-d1184e.netlify.app/auth.html');
        }
    }
}

// Update UI based on authentication status
function updateAuthUI(user) {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // Remove existing auth-related links
    const existingAuthLinks = navLinks.querySelectorAll('.auth-link');
    existingAuthLinks.forEach(link => link.remove());

    if (user) {
        // User is logged in
        const logoutLink = document.createElement('li');
        logoutLink.innerHTML = `
            <a href="#" class="auth-link">
                <span>${user.email}</span>
                <button class="logout-btn">Logout</button>
            </a>
        `;
        
        // Add logout functionality
        const logoutBtn = logoutLink.querySelector('.logout-btn');
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await supabaseClient.auth.signOut();
                localStorage.removeItem('sb-token');
                localStorage.removeItem('user');
                window.location.replace('https://glittery-torrone-d1184e.netlify.app/auth.html');
            } catch (error) {
                console.error('Logout failed:', error);
            }
        });

        navLinks.appendChild(logoutLink);
    } else {
        // User is not logged in
        const loginLink = document.createElement('li');
        loginLink.innerHTML = '<a href="https://glittery-torrone-d1184e.netlify.app/auth.html" class="auth-link">Login / Register</a>';
        navLinks.appendChild(loginLink);
    }
}

// Run session check when page loads
document.addEventListener('DOMContentLoaded', checkSession);


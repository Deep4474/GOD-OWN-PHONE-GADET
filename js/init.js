// Initialize forms and handle errors
export function initializeApp() {
    // Show initial form
    const urlParams = new URLSearchParams(globalThis.location.search);
    const showRegister = urlParams.get('register') === 'true';
    globalThis.utils.showForm(
        document.getElementById(showRegister ? 'registerBox' : 'loginBox')
    );

    // Add click handlers for form toggling
    document.getElementById('showRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        globalThis.utils.showForm(document.getElementById('registerBox'));
    });

    document.getElementById('showLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        globalThis.utils.showForm(document.getElementById('loginBox'));
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

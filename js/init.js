import utils from './utils.js';

// Initialize forms and handle errors
export function initializeApp() {
    // Show initial form
    const urlParams = new URLSearchParams(globalThis.location.search);
    const showRegister = urlParams.get('register') === 'true';
    const formToShow = document.getElementById(showRegister ? 'registerBox' : 'loginBox');
    
    if (formToShow) {
        utils.showForm(formToShow);

        // Add click handlers for form toggling
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            const registerBox = document.getElementById('registerBox');
            if (registerBox) utils.showForm(registerBox);
        });

        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            const loginBox = document.getElementById('loginBox');
            if (loginBox) utils.showForm(loginBox);
        });
    }
}

// Error handling utilities
function showError(message, container) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <p>${message}</p>
        <button onclick="this.parentElement.remove()">Dismiss</button>
    `;
    container.prepend(errorDiv);
}

function _handleLoadingError(error, section) {
    console.error(`Error in ${section}:`, error);
    const container = document.querySelector('.main-content');
    showError(`Unable to load ${section}. Please try refreshing the page.`, container);
}

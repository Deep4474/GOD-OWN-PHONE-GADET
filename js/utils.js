// Utility functions for form handling and UI
const utils = {
    showForm: function(formToShow) {
        const forms = ['loginBox', 'registerBox', 'confirmationBox', 'verificationBox']
            .map(id => document.getElementById(id))
            .filter(Boolean);
            
        forms.forEach(form => {
            if (form === formToShow) {
                form.classList.remove('hidden');
                form.style.display = 'block';
                // Trigger reflow
                form.offsetHeight;
            } else {
                form.classList.add('hidden');
                setTimeout(() => {
                    if (form.classList.contains('hidden')) {
                        form.style.display = 'none';
                    }
                }, 300);
            }
        });

        // Scroll to form
        if (formToShow) {
            formToShow.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    showError: function(elementId, message) {
        const errorDiv = document.getElementById(elementId);
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.color = '#dc3545';
            errorDiv.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
            errorDiv.style.display = 'block';
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    showSuccess: function(elementId, message) {
        const successDiv = document.getElementById(elementId);
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.style.color = '#28a745';
            successDiv.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
            successDiv.style.display = 'block';
        }
    }
};

export default utils;
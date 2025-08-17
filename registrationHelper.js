// Registration helper functions
async function validateRegistration(email, password, fullName, phone) {
    // Basic validation
    if (!email || !password || !fullName) {
        throw new Error('Email, password, and name are required');
    }

    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error('Please enter a valid email address');
    }

    if (phone && !phone.match(/^\d{11}$/)) {
        throw new Error('Please enter a valid phone number (11 digits)');
    }
}

async function handleRegistrationError(error) {
    console.error('Registration error:', error);
    
    // Check for common errors and provide user-friendly messages
    if (error.message.includes('already registered')) {
        return 'This email is already registered. Please try logging in instead.';
    }
    if (error.message.includes('rate limit')) {
        return 'Too many attempts. Please try again in a few minutes.';
    }
    if (error.message.includes('valid email')) {
        return 'Please enter a valid email address.';
    }
    if (error.message.includes('password')) {
        return 'Password must be at least 6 characters long.';
    }
    
    // Default error message
    return 'Registration failed. Please try again.';
}

// Export the helpers
window.registrationHelpers = {
    validateRegistration,
    handleRegistrationError
};

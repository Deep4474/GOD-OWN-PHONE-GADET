// Contact form handling
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('formFeedback');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: contactForm.name.value.trim(),
                email: contactForm.email.value.trim(),
                message: contactForm.message.value.trim()
            };

            // Basic validation
            if (!formData.name || !formData.email || !formData.message) {
                showFeedback('Please fill in all fields', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                showFeedback('Please enter a valid email address', 'error');
                return;
            }

            try {
                // Disable submit button
                const submitButton = contactForm.querySelector('.submit-button');
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';

                // Store message in Supabase
                const { data, error } = await supabaseClient
                    .from('customer_messages')
                    .insert([{
                        name: formData.name,
                        email: formData.email,
                        message: formData.message,
                        status: 'new'
                    }]);

                if (error) throw error;

                // Show success message
                showFeedback('Message sent successfully! We\'ll get back to you soon.', 'success');
                contactForm.reset();

            } catch (error) {
                console.error('Error sending message:', error);
                showFeedback('There was an error sending your message. Please try again.', 'error');
            } finally {
                // Re-enable submit button
                const submitButton = contactForm.querySelector('.submit-button');
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
            }
        });
    }

    function showFeedback(message, type) {
        formFeedback.textContent = message;
        formFeedback.className = 'form-feedback ' + type;
        
        // Hide feedback after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                formFeedback.style.display = 'none';
            }, 5000);
        }
    }
});

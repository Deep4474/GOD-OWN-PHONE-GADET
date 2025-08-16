    // Modal scroll functionality
function initializeModalScroll() {
    const modalContent = document.querySelector('.modal-content');
    if (!modalContent) return;

    // No auto-scroll, just manual scroll with touch handling
    let touchStartY = 0;
    let isTouching = false;    // Handle touch events for mobile scroll
    modalContent.addEventListener('touchstart', (e) => {
        isTouching = true;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    modalContent.addEventListener('touchend', () => {
        isTouching = false;
    }, { passive: true });

    modalContent.addEventListener('touchmove', (e) => {
        if (!isTouching) return;
        
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        
        modalContent.scrollTop += deltaY;
        touchStartY = touchY;
    }, { passive: true });

    // Handle focus events for form inputs
    const formInputs = modalContent.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            isPaused = true;
        });
        input.addEventListener('blur', () => {
            if (!isTouching) {
                isPaused = false;
            }
        });
    });

    // Reset scroll position when modal opens
    function resetScroll() {
        scrollPosition = 0;
        modalContent.scrollTop = 0;
    }

    // Smooth scroll function
    function smoothScroll(target) {
        const start = modalContent.scrollTop;
        const distance = target - start;
        const duration = 1000;
        let startTime = null;

        function animation(currentTime) {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            modalContent.scrollTop = start + distance * easeInOutQuad(progress);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    // Easing function for smoother scroll
    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    // Smooth scroll to sections when needed
    function smoothScrollTo(element) {
        if (!element) return;
        
        const elementTop = element.offsetTop;
        modalContent.scrollTo({
            top: elementTop - 20, // Add some padding
            behavior: 'smooth'
        });
    }

    return { resetScroll };
}

// Purchase Form Handler
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auto-scroll
    const scrollControls = initializeModalScroll();

    // Elements
    const modal = document.getElementById('buyNowModal');
    const closeBtn = document.querySelector('.close-modal');
    const form = document.getElementById('purchaseForm');
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    const deliveryOptions = document.querySelectorAll('input[name="deliveryMethod"]');
    const deliveryAddressDiv = document.getElementById('deliveryAddress');
    const addressTextarea = document.getElementById('address');
    
    // Price elements
    const subtotalAmount = document.getElementById('subtotalAmount');
    const deliveryFeeAmount = document.getElementById('deliveryFee');
    const totalAmount = document.getElementById('totalAmount');
    
    let currentPrice = 0;

    // Update all amounts based on quantity and delivery method
    function updateAmounts() {
        const quantity = parseInt(quantityInput.value);
        const subtotal = currentPrice * quantity;
        const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked').value;
        const deliveryFee = deliveryMethod === 'delivery' ? 2000 : 0;
        const total = subtotal + deliveryFee;

        subtotalAmount.textContent = subtotal.toLocaleString();
        deliveryFeeAmount.textContent = deliveryFee.toLocaleString();
        totalAmount.textContent = total.toLocaleString();
    }

    // Quantity Controls
    function updateQuantityControls() {
        const quantity = parseInt(quantityInput.value);
        minusBtn.disabled = quantity <= 1;
        plusBtn.disabled = quantity >= 99;
    }

    minusBtn.addEventListener('click', () => {
        if (parseInt(quantityInput.value) > 1) {
            quantityInput.value = parseInt(quantityInput.value) - 1;
            updateQuantityControls();
            updateAmounts();
        }
    });

    plusBtn.addEventListener('click', () => {
        if (parseInt(quantityInput.value) < 99) {
            quantityInput.value = parseInt(quantityInput.value) + 1;
            updateQuantityControls();
            updateAmounts();
        }
    });

    // Delivery Method Change
    deliveryOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            const isDelivery = e.target.value === 'delivery';
            deliveryAddressDiv.classList.toggle('hidden', !isDelivery);
            addressTextarea.required = isDelivery;
            updateAmounts();
        });
    });

    // Close Modal
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            form.reset();
            quantityInput.value = 1;
            updateQuantityControls();
            updateAmounts();
        }, 300); // Match CSS transition duration
    }

    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });

    // Handle Product Selection
    window.openBuyNowModal = function(productName, price, imageUrl) {
        // Update modal content
        document.getElementById('modalProductName').textContent = productName;
        document.getElementById('modalProductPrice').textContent = price.toLocaleString();
        document.getElementById('modalProductImage').src = imageUrl;
        currentPrice = price;
        
        // Reset form
        form.reset();
        quantityInput.value = 1;
        updateQuantityControls();
        updateAmounts();
        
        // Reset scroll position and show modal
        if (scrollControls) {
            scrollControls.resetScroll();
        }
        
        // Show modal with animation
        requestAnimationFrame(() => {
            modal.style.display = 'block';
            // Force reflow
            modal.offsetHeight;
            modal.classList.add('show');
        });
    };

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = {
            productName: document.getElementById('modalProductName').textContent,
            quantity: parseInt(quantityInput.value),
            customerName: document.getElementById('customerName').value.trim(),
            email: document.getElementById('customerEmail').value.trim(),
            phone: document.getElementById('customerPhone').value.trim(),
            deliveryMethod: document.querySelector('input[name="deliveryMethod"]:checked').value,
            address: document.getElementById('address').value.trim(),
            subtotal: parseFloat(subtotalAmount.textContent.replace(/,/g, '')),
            deliveryFee: parseFloat(deliveryFeeAmount.textContent.replace(/,/g, '')),
            total: parseFloat(totalAmount.textContent.replace(/,/g, ''))
        };

        // Validate phone number
        const phoneRegex = /^[0-9]{11}$/;
        if (!phoneRegex.test(formData.phone)) {
            alert('Please enter a valid Nigerian phone number (11 digits)');
            return;
        }

        // Validate delivery address if delivery method is selected
        if (formData.deliveryMethod === 'delivery' && !formData.address) {
            alert('Please enter your delivery address');
            return;
        }

        try {
            // Disable submit button and show loading state
            const submitBtn = form.querySelector('.submit-order');
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');

            // Create order in Supabase
            const { data: order, error } = await supabaseClient
                .from('orders')
                .insert([{
                    name: formData.customerName,  // Changed from customer_name to name
                    email: formData.email,
                    phone: formData.phone,
                    product_id: null,  // We'll update this once we have product IDs
                    product_name: formData.productName,  // Added for reference
                    quantity: formData.quantity,
                    delivery_option: formData.deliveryMethod,  // Changed from delivery_method
                    address: formData.address,  // Changed from delivery_address
                    total_amount: formData.total,  // This matches the schema
                    status: 'pending'
                }])
                .select()
                .single();

            if (error) throw error;

            // Show success message
            const orderNumber = order.id;
            showOrderConfirmation(orderNumber, formData);
            closeModal();

        } catch (error) {
            console.error('Error submitting order:', error);
            alert('There was an error processing your order. Please try again.');
        } finally {
            // Re-enable submit button and remove loading state
            const submitBtn = form.querySelector('.submit-order');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });
});

// Show Order Confirmation
function showOrderConfirmation(orderNumber, formData) {
    // Create confirmation modal
    const confirmationModal = document.createElement('div');
    confirmationModal.className = 'modal confirmation-modal';
    confirmationModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Order Confirmed!</h2>
                <button class="close-modal" aria-label="Close confirmation">&times;</button>
            </div>
            <div class="confirmation-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Thank you for your order!</h3>
                <div class="order-details">
                    <p class="order-number">Order #${orderNumber}</p>
                    <p class="order-product">${formData.productName}</p>
                    <p class="order-quantity">Quantity: ${formData.quantity}</p>
                    <p class="order-total">Total: ₦${formData.total.toLocaleString()}</p>
                </div>
                <div class="confirmation-message">
                    <p>We have sent a confirmation email to ${formData.email}</p>
                    <p>You will receive updates about your order status via email and SMS.</p>
                </div>
                <button class="close-confirmation">Done</button>
            </div>
        </div>
    `;

    // Add confirmation modal to body
    document.body.appendChild(confirmationModal);
    confirmationModal.style.display = 'block';

    // Handle close button
    const closeBtn = confirmationModal.querySelector('.close-modal');
    const doneBtn = confirmationModal.querySelector('.close-confirmation');
    
    function closeConfirmation() {
        confirmationModal.remove();
    }

    closeBtn.addEventListener('click', closeConfirmation);
    doneBtn.addEventListener('click', closeConfirmation);
    confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal) closeConfirmation();
    });
}

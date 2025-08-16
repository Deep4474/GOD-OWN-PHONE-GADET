<<<<<<< HEAD
// Slider functionality
let currentSlide = 0;
let sliderInterval;
let slides;
let totalSlides;

function showSlide(index) {
    if (!slides) return; // Guard clause if slides not initialized
    
    slides.forEach(slide => slide.classList.remove('active'));
    
    if (index >= totalSlides) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = totalSlides - 1;
    } else {
        currentSlide = index;
    }
    
    slides[currentSlide].classList.add('active');
}

function initializeSlider() {
    slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return; // Exit if no slides found

    totalSlides = slides.length;

    // Add event listeners for slider controls
    const nextButton = document.querySelector('.next-slide');
    const prevButton = document.querySelector('.prev-slide');
    
    if (nextButton) {
        nextButton.addEventListener('click', () => showSlide(currentSlide + 1));
    }
    if (prevButton) {
        prevButton.addEventListener('click', () => showSlide(currentSlide - 1));
    }

    // Start with first slide and auto-advance
    showSlide(0);
    
    // Clear any existing interval before setting a new one
    if (sliderInterval) {
        clearInterval(sliderInterval);
    }
    sliderInterval = setInterval(() => showSlide(currentSlide + 1), 5000);
}

// Products functionality
async function loadProducts() {
    try {
        const { data: products, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('category_id', { ascending: true });

        if (error) {
            throw error;
        }

        if (!products || products.length === 0) {
            document.querySelector('.loading-spinner').textContent = 'No products available.';
            return;
        }

        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        document.querySelector('.loading-spinner').textContent = 'Error loading products. Please try again later.';
    }
}

// Function to animate counter
function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    const current = parseInt(element.textContent) || 0;
    const increment = (target - current) / 20;
    let count = current;

    const animate = () => {
        count += increment;
        if ((increment > 0 && count >= target) || (increment < 0 && count <= target)) {
            element.textContent = target;
        } else {
            element.textContent = Math.round(count);
            requestAnimationFrame(animate);
        }
    };
    
    animate();
}

function displayProducts(products) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = ''; // Clear loading spinner

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Create stock status text and class
        const stockStatus = product.stock > 0 ? `${product.stock} in stock` : 'Out of stock';
        const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
        
        productCard.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="description">${product.description || ''}</p>
            <p class="price">₦${product.price.toLocaleString()}</p>
            <p class="stock-status ${stockClass}">${stockStatus}</p>
            <button class="buy-now-btn" ${product.stock <= 0 ? 'disabled' : ''} onclick="openBuyNowModal('${product.name}', ${product.price}, '${product.image_url}')">
                ${product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
            </button>
        `;
        
        productGrid.appendChild(productCard);
    });
}

// Remove the filterProducts function as it's no longer needed

// Deal timer functionality
function initializeTimer() {
    const timerElement = document.querySelector('.timer');
    if (!timerElement) return; // Exit if timer element doesn't exist

    function updateTimer() {
        let time = timerElement.textContent.split(': ')[1].split(':');
        let hours = parseInt(time[0]);
        let minutes = parseInt(time[1]);
        let seconds = parseInt(time[2]);

        seconds--;
        
        if (seconds < 0) {
            seconds = 59;
            minutes--;
            if (minutes < 0) {
                minutes = 59;
                hours--;
                if (hours < 0) {
                    hours = 23; // Reset to 24 hours
                }
            }
        }

        timerElement.textContent = `Ends in: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Update timer every second
    setInterval(updateTimer, 1000);
}

// Buy Now Modal Functionality
function openBuyNowModal(productName, price, imageUrl) {
    const modal = document.getElementById('buyNowModal');
    const modalProductName = document.getElementById('modalProductName');
    const modalProductPrice = document.getElementById('modalProductPrice');
    const modalProductImage = document.getElementById('modalProductImage');
    const subtotalAmount = document.getElementById('subtotalAmount');
    const totalAmount = document.getElementById('totalAmount');
    
    modalProductName.textContent = productName;
    modalProductPrice.textContent = price.toLocaleString();
    modalProductImage.src = imageUrl;
    subtotalAmount.textContent = price.toLocaleString();
    updateTotal();
    
    modal.style.display = 'block';
}

function updateTotal() {
    const price = parseFloat(document.getElementById('modalProductPrice').textContent.replace(/,/g, ''));
    const quantity = parseInt(document.getElementById('quantity').value);
    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked').value;
    const deliveryFee = deliveryMethod === 'delivery' ? 2000 : 0;
    
    const subtotal = price * quantity;
    document.getElementById('subtotalAmount').textContent = subtotal.toLocaleString();
    document.getElementById('deliveryFee').textContent = deliveryFee.toLocaleString();
    document.getElementById('totalAmount').textContent = (subtotal + deliveryFee).toLocaleString();
}

// Close modal when clicking the close button or outside the modal
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main site features only if elements exist
    const mainSiteElements = document.querySelector('.hero-slider');
    if (mainSiteElements) {
        initializeSlider();
        loadProducts();
        initializeTimer();
    }

    const modal = document.getElementById('buyNowModal');
    const closeBtn = document.querySelector('.close-modal');
    const deliveryOptions = document.querySelectorAll('input[name="deliveryMethod"]');
    const deliveryAddress = document.getElementById('deliveryAddress');
    const purchaseForm = document.getElementById('purchaseForm');

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Handle quantity changes
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');

    minusBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            updateTotal();
        }
        minusBtn.disabled = currentValue <= 2;
    });

    plusBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
        minusBtn.disabled = false;
        updateTotal();
    });

    // Show/hide delivery address based on delivery method
    deliveryOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            deliveryAddress.classList.toggle('hidden', e.target.value === 'pickup');
            updateTotal();
        });
    });

    // Handle form submission
    purchaseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = e.target.querySelector('.submit-order');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        
        try {
            // Get current product details
            const productName = document.getElementById('modalProductName').textContent;
            
            // Get customer details with only the fields we need
            const formData = {
                full_name: document.getElementById('customerName').value,
                email: document.getElementById('customerEmail').value,
                phone: document.getElementById('customerPhone').value,
                delivery_method: document.querySelector('input[name="deliveryMethod"]:checked').value
            };

            // Calculate order details
            const quantity = parseInt(document.getElementById('quantity').value);
            const basePrice = parseFloat(document.getElementById('modalProductPrice').textContent.replace(/,/g, ''));
            const deliveryFee = formData.delivery_method === 'delivery' ? 2000 : 0;
            const orderTotal = (basePrice * quantity) + deliveryFee;

            console.log('Attempting to submit order:', {
                productName,
                orderTotal,
                formData
            });

            // Get the product details first
            const { data: productData, error: productError } = await supabaseClient
                .from('products')
                .select('id')
                .eq('name', productName)
                .single();

            if (productError) throw productError;

            // Create the order with exact table structure including status and total_amount
            const { data: order, error: orderError } = await supabaseClient
                .from('orders')
                .insert([{
                    product_id: productData.id,
                    quantity: quantity,
                    delivery_option: formData.delivery_method,
                    email: formData.email,
                    name: formData.full_name,
                    phone: formData.phone,
                    status: 'pending', // Set initial status as pending
                    total_amount: orderTotal, // Include the total amount
                    // created_at and updated_at will be handled automatically by Supabase
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // Show success message with order details
            const orderNumber = order.id;
            
            // Create a custom success modal
            const successModal = document.createElement('div');
            successModal.className = 'success-modal';
            successModal.innerHTML = `
                <div class="success-content">
                    <div class="success-icon">✓</div>
                    <h2>Order Placed Successfully!</h2>
                    <div class="order-details">
                        <p class="order-number">Order #${orderNumber}</p>
                        <p class="order-product">${productName}</p>
                        <p class="order-quantity">Quantity: ${quantity}</p>
                        <p class="order-status">Status: Pending</p>
                    </div>
                    <p class="success-message">
                        Thank you for your order! We'll contact you soon with delivery details.
                        A confirmation email will be sent to ${formData.email}
                    </p>
                    <button class="close-success-modal">Done</button>
                </div>
            `;
            
            document.body.appendChild(successModal);
            modal.style.display = 'none';
            purchaseForm.reset();

            // Add event listener to close success modal
            const closeSuccessBtn = successModal.querySelector('.close-success-modal');
            closeSuccessBtn.onclick = () => {
                successModal.remove();
            };

        } catch (error) {
            console.error('Error submitting order:', error);
            alert('There was an error placing your order. Please try again.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Place Order';
        }
    });

    // Add the success modal styles
    const style = document.createElement('style');
    style.textContent = `
        .success-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        }

        .success-content {
            background: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            max-width: 90%;
            width: 400px;
            animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .success-icon {
            width: 60px;
            height: 60px;
            background: #2ecc71;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            margin: 0 auto 20px;
        }

        .order-details {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
        }

        .order-number {
            font-size: 1.2rem;
            color: #2c3e50;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .order-product {
            color: #666;
            margin-bottom: 5px;
        }

        .order-total {
            font-weight: bold;
            color: #2ecc71;
            margin-top: 10px;
        }

        .success-message {
            color: #666;
            line-height: 1.5;
            margin: 20px 0;
        }

        .close-success-modal {
            background: #2ecc71;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .close-success-modal:hover {
            background: #27ae60;
            transform: translateY(-2px);
        }

        @media (max-width: 480px) {
            .success-content {
                width: 95%;
                padding: 20px;
            }

            .success-icon {
                width: 50px;
                height: 50px;
                font-size: 25px;
            }

            .order-details {
                padding: 10px;
            }
        }
    `;
    document.head.appendChild(style);
});
=======
// Slider functionality
let currentSlide = 0;
let sliderInterval;
let slides;
let totalSlides;

function showSlide(index) {
    if (!slides) return; // Guard clause if slides not initialized
    
    slides.forEach(slide => slide.classList.remove('active'));
    
    if (index >= totalSlides) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = totalSlides - 1;
    } else {
        currentSlide = index;
    }
    
    slides[currentSlide].classList.add('active');
}

function initializeSlider() {
    slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return; // Exit if no slides found

    totalSlides = slides.length;

    // Add event listeners for slider controls
    const nextButton = document.querySelector('.next-slide');
    const prevButton = document.querySelector('.prev-slide');
    
    if (nextButton) {
        nextButton.addEventListener('click', () => showSlide(currentSlide + 1));
    }
    if (prevButton) {
        prevButton.addEventListener('click', () => showSlide(currentSlide - 1));
    }

    // Start with first slide and auto-advance
    showSlide(0);
    
    // Clear any existing interval before setting a new one
    if (sliderInterval) {
        clearInterval(sliderInterval);
    }
    sliderInterval = setInterval(() => showSlide(currentSlide + 1), 5000);
}

// Products functionality
async function loadProducts() {
    try {
        const { data: products, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('category_id', { ascending: true });

        if (error) {
            throw error;
        }

        if (!products || products.length === 0) {
            document.querySelector('.loading-spinner').textContent = 'No products available.';
            return;
        }

        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        document.querySelector('.loading-spinner').textContent = 'Error loading products. Please try again later.';
    }
}

// Function to animate counter
function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    const current = parseInt(element.textContent) || 0;
    const increment = (target - current) / 20;
    let count = current;

    const animate = () => {
        count += increment;
        if ((increment > 0 && count >= target) || (increment < 0 && count <= target)) {
            element.textContent = target;
        } else {
            element.textContent = Math.round(count);
            requestAnimationFrame(animate);
        }
    };
    
    animate();
}

function displayProducts(products) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = ''; // Clear loading spinner

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Create stock status text and class
        const stockStatus = product.stock > 0 ? `${product.stock} in stock` : 'Out of stock';
        const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
        
        productCard.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="description">${product.description || ''}</p>
            <p class="price">₦${product.price.toLocaleString()}</p>
            <p class="stock-status ${stockClass}">${stockStatus}</p>
            <button class="buy-now-btn" ${product.stock <= 0 ? 'disabled' : ''} onclick="openBuyNowModal('${product.name}', ${product.price}, '${product.image_url}')">
                ${product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
            </button>
        `;
        
        productGrid.appendChild(productCard);
    });
}

// Remove the filterProducts function as it's no longer needed

// Deal timer functionality
function initializeTimer() {
    const timerElement = document.querySelector('.timer');
    if (!timerElement) return; // Exit if timer element doesn't exist

    function updateTimer() {
        let time = timerElement.textContent.split(': ')[1].split(':');
        let hours = parseInt(time[0]);
        let minutes = parseInt(time[1]);
        let seconds = parseInt(time[2]);

        seconds--;
        
        if (seconds < 0) {
            seconds = 59;
            minutes--;
            if (minutes < 0) {
                minutes = 59;
                hours--;
                if (hours < 0) {
                    hours = 23; // Reset to 24 hours
                }
            }
        }

        timerElement.textContent = `Ends in: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Update timer every second
    setInterval(updateTimer, 1000);
}

// Buy Now Modal Functionality
function openBuyNowModal(productName, price, imageUrl) {
    const modal = document.getElementById('buyNowModal');
    const modalProductName = document.getElementById('modalProductName');
    const modalProductPrice = document.getElementById('modalProductPrice');
    const modalProductImage = document.getElementById('modalProductImage');
    const subtotalAmount = document.getElementById('subtotalAmount');
    const totalAmount = document.getElementById('totalAmount');
    
    modalProductName.textContent = productName;
    modalProductPrice.textContent = price.toLocaleString();
    modalProductImage.src = imageUrl;
    subtotalAmount.textContent = price.toLocaleString();
    updateTotal();
    
    modal.style.display = 'block';
}

function updateTotal() {
    const price = parseFloat(document.getElementById('modalProductPrice').textContent.replace(/,/g, ''));
    const quantity = parseInt(document.getElementById('quantity').value);
    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked').value;
    const deliveryFee = deliveryMethod === 'delivery' ? 2000 : 0;
    
    const subtotal = price * quantity;
    document.getElementById('subtotalAmount').textContent = subtotal.toLocaleString();
    document.getElementById('deliveryFee').textContent = deliveryFee.toLocaleString();
    document.getElementById('totalAmount').textContent = (subtotal + deliveryFee).toLocaleString();
}

// Close modal when clicking the close button or outside the modal
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main site features only if elements exist
    const mainSiteElements = document.querySelector('.hero-slider');
    if (mainSiteElements) {
        initializeSlider();
        loadProducts();
        initializeTimer();
    }

    const modal = document.getElementById('buyNowModal');
    const closeBtn = document.querySelector('.close-modal');
    const deliveryOptions = document.querySelectorAll('input[name="deliveryMethod"]');
    const deliveryAddress = document.getElementById('deliveryAddress');
    const purchaseForm = document.getElementById('purchaseForm');

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Handle quantity changes
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');

    minusBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            updateTotal();
        }
        minusBtn.disabled = currentValue <= 2;
    });

    plusBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
        minusBtn.disabled = false;
        updateTotal();
    });

    // Show/hide delivery address based on delivery method
    deliveryOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            deliveryAddress.classList.toggle('hidden', e.target.value === 'pickup');
            updateTotal();
        });
    });

    // Handle form submission
    purchaseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = e.target.querySelector('.submit-order');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        
        try {
            // Get current product details
            const productName = document.getElementById('modalProductName').textContent;
            
            // Get customer details with only the fields we need
            const formData = {
                full_name: document.getElementById('customerName').value,
                email: document.getElementById('customerEmail').value,
                phone: document.getElementById('customerPhone').value,
                delivery_method: document.querySelector('input[name="deliveryMethod"]:checked').value
            };

            // Calculate order details
            const quantity = parseInt(document.getElementById('quantity').value);
            const basePrice = parseFloat(document.getElementById('modalProductPrice').textContent.replace(/,/g, ''));
            const deliveryFee = formData.delivery_method === 'delivery' ? 2000 : 0;
            const orderTotal = (basePrice * quantity) + deliveryFee;

            console.log('Attempting to submit order:', {
                productName,
                orderTotal,
                formData
            });

            // Get the product details first
            const { data: productData, error: productError } = await supabaseClient
                .from('products')
                .select('id')
                .eq('name', productName)
                .single();

            if (productError) throw productError;

            // Create the order with exact table structure including status and total_amount
            const { data: order, error: orderError } = await supabaseClient
                .from('orders')
                .insert([{
                    product_id: productData.id,
                    quantity: quantity,
                    delivery_option: formData.delivery_method,
                    email: formData.email,
                    name: formData.full_name,
                    phone: formData.phone,
                    status: 'pending', // Set initial status as pending
                    total_amount: orderTotal, // Include the total amount
                    // created_at and updated_at will be handled automatically by Supabase
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // Show success message with order details
            const orderNumber = order.id;
            
            // Create a custom success modal
            const successModal = document.createElement('div');
            successModal.className = 'success-modal';
            successModal.innerHTML = `
                <div class="success-content">
                    <div class="success-icon">✓</div>
                    <h2>Order Placed Successfully!</h2>
                    <div class="order-details">
                        <p class="order-number">Order #${orderNumber}</p>
                        <p class="order-product">${productName}</p>
                        <p class="order-quantity">Quantity: ${quantity}</p>
                        <p class="order-status">Status: Pending</p>
                    </div>
                    <p class="success-message">
                        Thank you for your order! We'll contact you soon with delivery details.
                        A confirmation email will be sent to ${formData.email}
                    </p>
                    <button class="close-success-modal">Done</button>
                </div>
            `;
            
            document.body.appendChild(successModal);
            modal.style.display = 'none';
            purchaseForm.reset();

            // Add event listener to close success modal
            const closeSuccessBtn = successModal.querySelector('.close-success-modal');
            closeSuccessBtn.onclick = () => {
                successModal.remove();
            };

        } catch (error) {
            console.error('Error submitting order:', error);
            alert('There was an error placing your order. Please try again.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Place Order';
        }
    });

    // Add the success modal styles
    const style = document.createElement('style');
    style.textContent = `
        .success-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        }

        .success-content {
            background: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            max-width: 90%;
            width: 400px;
            animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .success-icon {
            width: 60px;
            height: 60px;
            background: #2ecc71;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            margin: 0 auto 20px;
        }

        .order-details {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
        }

        .order-number {
            font-size: 1.2rem;
            color: #2c3e50;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .order-product {
            color: #666;
            margin-bottom: 5px;
        }

        .order-total {
            font-weight: bold;
            color: #2ecc71;
            margin-top: 10px;
        }

        .success-message {
            color: #666;
            line-height: 1.5;
            margin: 20px 0;
        }

        .close-success-modal {
            background: #2ecc71;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .close-success-modal:hover {
            background: #27ae60;
            transform: translateY(-2px);
        }

        @media (max-width: 480px) {
            .success-content {
                width: 95%;
                padding: 20px;
            }

            .success-icon {
                width: 50px;
                height: 50px;
                font-size: 25px;
            }

            .order-details {
                padding: 10px;
            }
        }
    `;
    document.head.appendChild(style);
});
>>>>>>> c244ea11b21dc4ddcf325b735f3bbe3e72b2736f

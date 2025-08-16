// Initialize UI elements
async function initializeUI() {
    // Initialize slider
    if (typeof window.sliderState === 'undefined') {
        window.sliderState = {
            currentSlide: 0,
            sliderInterval: null,
            slides: null,
            totalSlides: 0
        };
    }

    // Load products
    await loadProducts();

    // Initialize slider
    initializeSlider();

    // Initialize timer
    initializeTimer();

    // Initialize mobile menu
    initializeMobileNav();

    // Add event listeners
    setupEventListeners();
}

// Load products from Supabase
async function loadProducts() {
    try {
        const productGrid = document.getElementById('productGrid');
        if (!productGrid) return;

        productGrid.innerHTML = '<div class="loading-spinner">Loading products...</div>';

        const { products, error } = await productService.getAllProducts();

        if (error) throw error;

        if (!products || products.length === 0) {
            productGrid.innerHTML = '<p>No products available.</p>';
            return;
        }

        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        const productGrid = document.getElementById('productGrid');
        if (productGrid) {
            productGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
        }
    }
}

// Display products in grid
function displayProducts(products) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const stockStatus = product.stock > 0 ? `${product.stock} in stock` : 'Out of stock';
        const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
        
        productCard.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}" loading="lazy">
            <h3>${product.name}</h3>
            <p class="description">${product.description || ''}</p>
            <p class="price">₦${product.price.toLocaleString()}</p>
            <p class="stock-status ${stockClass}">${stockStatus}</p>
            <button class="buy-now-btn" ${product.stock <= 0 ? 'disabled' : ''} 
                    data-product-name="${product.name}" 
                    data-product-price="${product.price}" 
                    data-product-image="${product.image_url}">
                ${product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
            </button>
        `;
        
        productGrid.appendChild(productCard);

        // Add loading animation for product images
        const img = productCard.querySelector('img');
        img.addEventListener('load', () => {
            img.classList.add('loaded');
        });
    });
}

// Initialize mobile navigation
function initializeMobileNav() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    let isMenuOpen = false;

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            navLinks.classList.toggle('active');
            mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
            mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isMenuOpen ? 'hidden' : '';
            
            // Animate menu items
            const menuItems = navLinks.querySelectorAll('li');
            menuItems.forEach((item, index) => {
                item.style.transitionDelay = isMenuOpen ? `${index * 0.1}s` : '0s';
            });
        });

        // Close menu when clicking a link
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                isMenuOpen = false;
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                document.body.style.overflow = '';
            }
        });

        // Handle scroll behavior
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                navbar.style.transform = 'translateY(0)';
                return;
            }
            
            if (currentScroll > lastScroll && !navLinks.classList.contains('active')) {
                // Scrolling down & menu closed
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Buy Now button click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-now-btn') && !e.target.disabled) {
            const button = e.target;
            const productName = button.dataset.productName;
            const productPrice = parseFloat(button.dataset.productPrice);
            const productImage = button.dataset.productImage;
            
            if (productName && productPrice && productImage) {
                openBuyNowModal(productName, productPrice, productImage);
            }
        }
    });

    // Handle forms
    setupFormHandlers();
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeUI);

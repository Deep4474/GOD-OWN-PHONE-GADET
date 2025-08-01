
// GOD'S OWN PHONE GADGET - Main Site Script
// This script fetches products from the backend and displays them on the main site.

// Set this to your backend URL for production deployment
const API_BASE_URL = "https://phone-2cv4.onrender.com";

// Helper to fetch JSON from backend
async function apiGet(endpoint) {
    const res = await fetch(API_BASE_URL + endpoint);
    if (!res.ok) throw new Error('Failed to fetch ' + endpoint);
    return res.json();
}

// Render products to the page
function renderProducts(products) {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    if (!Array.isArray(products) || products.length === 0) {
        productList.innerHTML = "<p style='text-align:center;'>No products to display.</p>";
        return;
    }
    productList.innerHTML = products.map(prod => `
        <div class="product-card">
            <img src="${prod.images && prod.images[0] ? prod.images[0] : ''}" alt="${prod.name}" style="max-width:100%;height:180px;object-fit:contain;border:1px solid #eee;">
            <h3>${prod.name || prod.category || 'N/A'}</h3>
            <p>${prod.description || ''}</p>
            <div><b>₦${prod.price ? prod.price.toLocaleString() : 'N/A'}</b></div>
            <div>In Stock: ${prod.stock || 0}</div>
            <button class="buy-now-btn" data-product-id="${prod.id}">Buy Now</button>
        </div>
    `).join('');

    // Add event listeners for Buy Now buttons
    const buyBtns = productList.querySelectorAll('.buy-now-btn');
    buyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const prodId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == prodId);
            if (product) openBuyNowModal(product);
        });
    });
}

// Show Buy Now modal (basic implementation)
function openBuyNowModal(product) {
    // Set up close/cancel button for the order modal
    const closeBtn = document.getElementById('close-order-modal');
    if (closeBtn && modal) {
        closeBtn.onclick = function() {
            modal.classList.add('hidden');
        };
    }
    // Try to auto-fill address from logged-in user
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch {}

    const modal = document.getElementById('order-modal');
    const nameSpan = document.getElementById('order-product-name');
    const qtyInput = document.getElementById('order-qty');
    const totalAmount = document.getElementById('order-total-amount');
    const locationInput = document.getElementById('order-location');
    const pickupSection = document.getElementById('pickup-section');
    const deliverySection = document.getElementById('delivery-section');
    const deliveryRadios = document.querySelectorAll('input[name="delivery-method"]');

    // Helper: calculate delivery fee by location
    function getDeliveryFee(location) {
        if (!location) return 2000; // default
        const loc = location.trim().toLowerCase();
        // Normal fee for Lagos, Ogun, Oyo, Osun, Ondo, Ekiti (Ogun and neighbors)
        if (loc.includes('lagos')) return 2000;
        if (loc.includes('ogun')) return 2500;
        if (loc.includes('oyo')) return 3000;
        if (loc.includes('osun')) return 3500;
        if (loc.includes('ondo')) return 3500;
        if (loc.includes('ekiti')) return 3500;
        // Abuja, PH, Ibadan as before
        if (loc.includes('abuja')) return 3500;
        if (loc.includes('port harcourt') || loc.includes('ph')) return 4000;
        if (loc.includes('ibadan')) return 3000;
        // All other states: random fee between 10,000 and 400,000
        return Math.floor(Math.random() * (400000 - 10000 + 1)) + 10000;
    }

    // Helper: update total
    function updateTotal() {
        const qty = parseInt(qtyInput.value) || 1;
        const method = document.querySelector('input[name="delivery-method"]:checked').value;
        let deliveryFee = 0;
        if (method === 'Deliver') {
            deliveryFee = getDeliveryFee(locationInput ? locationInput.value : '');
        }
        const total = (product.price * qty) + deliveryFee;
        if (totalAmount) {
            totalAmount.textContent = `₦${total.toLocaleString()}${deliveryFee ? ` (includes ₦${deliveryFee.toLocaleString()} delivery)` : ''}`;
        }
    }

    if (modal && nameSpan) {
        nameSpan.textContent = product.name;
        modal.classList.remove('hidden');
        qtyInput.value = 1;
        // Auto-fill address fields if user is logged in
        if (user) {
            if (locationInput && user.address) {
                // Try to extract city/area from address
                let city = '';
                if (user.state) city = user.state;
                if (user.lga) city = user.lga + (city ? ', ' + city : '');
                locationInput.value = city || '';
            }
            const fullAddressInput = document.getElementById('order-address');
            if (fullAddressInput && user.address) {
                fullAddressInput.value = user.address;
            }
        }
        updateTotal();
    }

    // Set up delivery/pickup toggle
    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Deliver') {
                deliverySection.style.display = '';
                pickupSection.style.display = 'none';
            } else {
                deliverySection.style.display = 'none';
                pickupSection.style.display = '';
            }
            updateTotal();
        });
    });

    // Default state
    if (document.querySelector('input[name="delivery-method"]:checked').value === 'Deliver') {
        deliverySection.style.display = '';
        pickupSection.style.display = 'none';
    } else {
        deliverySection.style.display = 'none';
        pickupSection.style.display = '';
    }

    // Listen for changes to quantity and location
    if (qtyInput) qtyInput.addEventListener('input', updateTotal);
    if (locationInput) locationInput.addEventListener('input', updateTotal);
    // Optionally set product id/price for order form here
}

// Load products from backend and render
async function loadProducts() {
    const productList = document.getElementById('product-list');
    try {
        const products = await apiGet("/api/products");
        renderProducts(products);
    } catch (err) {
        if (productList) productList.innerHTML = "<p style='color:red;text-align:center;'>Failed to load products.</p>";
    }
}

// Run on page load
window.addEventListener('DOMContentLoaded', loadProducts);
      





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
    const modal = document.getElementById('order-modal');
    const nameSpan = document.getElementById('order-product-name');
    const qtyInput = document.getElementById('order-qty');
    if (modal && nameSpan) {
        nameSpan.textContent = product.name;
        modal.classList.remove('hidden');
        qtyInput.value = 1;
    }
    // Set up delivery/pickup toggle
    const pickupSection = document.getElementById('pickup-section');
    const deliverySection = document.getElementById('delivery-section');
    const deliveryRadios = document.querySelectorAll('input[name="delivery-method"]');
    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Deliver') {
                deliverySection.style.display = '';
                pickupSection.style.display = 'none';
            } else {
                deliverySection.style.display = 'none';
                pickupSection.style.display = '';
            }
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
      




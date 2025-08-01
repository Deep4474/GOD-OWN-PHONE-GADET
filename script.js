
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
        </div>
    `).join('');
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
      




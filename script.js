// Minimal ONGOD Gadget Shop Frontend Script

const API_BASE_URL = window.location.origin;

// --- API Helper ---
const API = {
  async get(endpoint) {
    const url = `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.status}`);
    return res.json();
  },
  async post(endpoint, data, token) {
    const url = `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`POST ${endpoint} failed: ${res.status}`);
    return res.json();
  },
  async put(endpoint, data, token) {
    const url = `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`PUT ${endpoint} failed: ${res.status}`);
    return res.json();
  },
  async delete(endpoint, token) {
    const url = `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) throw new Error(`DELETE ${endpoint} failed: ${res.status}`);
    return res.json();
  }
};

// --- Product Display ---
async function loadProducts() {
  try {
    const data = await API.get('/api/products');
    const products = Array.isArray(data) ? data : (data.products || []);
    renderProducts(products);
  } catch (err) {
    document.getElementById('product-list').innerHTML = '<p>Failed to load products.</p>';
  }
}

function renderProducts(products) {
  const productList = document.getElementById('product-list');
  if (!productList) return;
  if (!products.length) {
    productList.innerHTML = '<p>No products available.</p>';
    return;
  }
  productList.innerHTML = products.map(p => `
    <div class="product-card">
      <img src="${(p.images && p.images[0]) || 'https://via.placeholder.com/220x160?text=No+Image'}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.description || ''}</p>
      <p>₦${p.price}</p>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', loadProducts);

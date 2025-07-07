// --- API CONFIG ---
const API_BASE_URL = 'https://phone-2cv4.onrender.com';
const API_ENDPOINTS = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  VERIFY: '/api/auth/verify',
  PRODUCTS: '/api/products',
};

// --- Menu logic ---
const menuToggle = document.getElementById('menu-toggle');
const sideMenu = document.getElementById('side-menu');
const closeMenu = document.getElementById('close-menu');
const notifBtn = document.getElementById('menu-notifications');
const darkModeBtn = document.getElementById('menu-darkmode');
const logoutBtn = document.getElementById('menu-logout');
const notifBadge = document.getElementById('notif-badge');
const notifModal = document.getElementById('notification-modal');
const closeNotif = document.getElementById('close-notif');
const notifList = document.getElementById('notif-list');
const myOrdersBtn = document.getElementById('menu-myorders');
const ordersModal = document.getElementById('orders-modal');
const closeOrdersModal = document.getElementById('close-orders-modal');
const ordersList = document.getElementById('orders-list');
const profileBtn = document.getElementById('menu-profile');
const helpBtn = document.getElementById('menu-help');
const profileModal = document.getElementById('profile-modal');
const helpModal = document.getElementById('help-modal');
const closeProfileModal = document.getElementById('close-profile-modal');
const closeHelpModal = document.getElementById('close-help-modal');

// Hide menu by default
sideMenu.classList.remove('open');
sideMenu.style.display = 'none';

menuToggle.onclick = () => {
  sideMenu.style.display = 'flex';
  setTimeout(() => sideMenu.classList.add('open'), 10);
};
closeMenu.onclick = () => {
  sideMenu.classList.remove('open');
  setTimeout(() => sideMenu.style.display = 'none', 300);
};
sideMenu.onclick = (e) => {
  if (e.target === sideMenu) {
    sideMenu.classList.remove('open');
    setTimeout(() => sideMenu.style.display = 'none', 300);
  }
};
document.addEventListener('keydown', (e) => {
  if (sideMenu.classList.contains('open') && e.key === 'Escape') {
    sideMenu.classList.remove('open');
    setTimeout(() => sideMenu.style.display = 'none', 300);
  }
});

// --- Dark mode logic ---
function setDarkMode(enabled) {
  if (enabled) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', '1');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', '0');
  }
}
darkModeBtn.onclick = () => {
  setDarkMode(!document.body.classList.contains('dark-mode'));
};
if (localStorage.getItem('darkMode') === '1') setDarkMode(true);

// --- Notification logic (demo) ---
const demoNotifs = [

];
function updateNotifBadge() {
  if (demoNotifs.length > 0) {
    notifBadge.textContent = demoNotifs.length;
    notifBadge.classList.remove('hidden');
  } else {
    notifBadge.classList.add('hidden');
  }
}
notifBtn.onclick = async () => {
  notifModal.classList.remove('hidden');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  let notifs = [];
  if (user.email) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications?email=${encodeURIComponent(user.email)}`);
      notifs = await res.json();
    } catch {}
  }
  // Also fetch updates/announcements
  let updates = [];
  try {
    const res = await fetch(`${API_BASE_URL}/api/updates`);
    updates = await res.json();
  } catch {}
  const allNotifs = [
    ...notifs.map(n => ({ text: n.message, time: new Date(n.date).toLocaleString() })),
    ...updates.map(u => ({ text: u.message, time: new Date(u.date).toLocaleString() }))
  ];
  notifList.innerHTML = allNotifs.length
    ? allNotifs.map(n => `<li><b>${n.text}</b><br><span style='font-size:0.9em;color:#888;'>${n.time}</span></li>`).join('')
    : '<li>No notifications</li>';
  sideMenu.classList.remove('open');
  setTimeout(() => sideMenu.style.display = 'none', 300);
};
closeNotif.onclick = () => notifModal.classList.add('hidden');
document.addEventListener('keydown', (e) => {
  if (!notifModal.classList.contains('hidden') && e.key === 'Escape') notifModal.classList.add('hidden');
});
updateNotifBadge();

// --- Logout logic (demo) ---
logoutBtn.onclick = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('pendingVerificationEmail');
  localStorage.removeItem('stage');
  alert('You have been logged out.');
  window.location.reload();
};

// --- Navigation logic (unchanged) ---
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const productsSection = document.getElementById('products-section');
const authSection = document.getElementById('auth-section');

function showLogin() {
  loginView.classList.remove('hidden');
  registerView.classList.add('hidden');
  productsSection.classList.add('hidden');
  authSection.classList.remove('hidden');
  menuToggle.style.display = 'none';
  sideMenu.style.display = 'none';
}
function showRegister() {
  loginView.classList.add('hidden');
  registerView.classList.remove('hidden');
  productsSection.classList.add('hidden');
  authSection.classList.remove('hidden');
  menuToggle.style.display = 'none';
  sideMenu.style.display = 'none';
}
function showProducts() {
  loginView.classList.add('hidden');
  registerView.classList.add('hidden');
  productsSection.classList.remove('hidden');
  authSection.classList.add('hidden');
  menuToggle.style.display = 'inline-block';
  sideMenu.style.display = 'none';
}
document.getElementById('show-register-link').onclick = (e) => { e.preventDefault(); showRegister(); };
document.getElementById('show-login-link').onclick = (e) => { e.preventDefault(); showLogin(); };

// --- API Helpers ---
async function apiPost(endpoint, data) {
  const res = await fetch(API_BASE_URL + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || json.message || 'Request failed');
  return json;
}
async function apiGet(endpoint) {
  const res = await fetch(API_BASE_URL + endpoint);
  if (!res.ok) throw new Error('Failed to fetch');
  return await res.json();
}

// --- Auth logic ---
document.getElementById('login-form').onsubmit = async function(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const loginMsg = document.getElementById('login-message');
  loginMsg.textContent = '';
  try {
    loginMsg.textContent = 'Logging in...';
    const res = await apiPost(API_ENDPOINTS.LOGIN, { email, password });
    loginMsg.textContent = 'Login successful!';
    localStorage.setItem('user', JSON.stringify(res.user));
    localStorage.setItem('token', res.token);
    localStorage.setItem('stage', 'products');
    showProducts();
    loadProducts();
  } catch (err) {
    loginMsg.textContent = err.message;
  }
};
document.getElementById('register-form').onsubmit = async function(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;
  const registerMsg = document.getElementById('register-message');
  registerMsg.textContent = '';
  // Password match check
  if (password !== confirmPassword) {
    registerMsg.textContent = 'Passwords do not match.';
    return;
  }
  // Password strength check
  const strongPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!strongPassword.test(password)) {
    registerMsg.textContent = 'Password must be at least 8 characters and include a number, an uppercase letter, and a symbol.';
    return;
  }
  try {
    registerMsg.textContent = 'Registering...';
    const res = await apiPost(API_ENDPOINTS.REGISTER, { name, email, password, confirmPassword });
    registerMsg.textContent = 'Registration successful! Check your email for a code.';
    window.pendingVerificationEmail = email;
    localStorage.setItem('pendingVerificationEmail', email);
    localStorage.setItem('stage', 'verify');
    // Show the register view and verification form
    document.getElementById('register-view').classList.remove('hidden');
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('verify-code-section').classList.remove('hidden');
    console.log('Attempting to show verification form');
  } catch (err) {
    registerMsg.textContent = err.message;
    // Show the register view and verification form even on error
    document.getElementById('register-view').classList.remove('hidden');
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('verify-code-section').classList.remove('hidden');
    console.log('Attempting to show verification form (error case)');
  }
};
document.getElementById('verify-btn').onclick = async function() {
  const code = document.getElementById('verification-code').value.trim();
  const email = window.pendingVerificationEmail || localStorage.getItem('pendingVerificationEmail') || document.getElementById('reg-email').value.trim();
  const registerMsg = document.getElementById('register-message');
  if (!code) {
    registerMsg.textContent = 'Please enter the verification code.';
    return;
  }
  try {
    registerMsg.textContent = 'Verifying...';
    const res = await apiPost(API_ENDPOINTS.VERIFY, { email, code });
    registerMsg.textContent = 'Email verified! You can now log in.';
    document.getElementById('verify-code-section').classList.add('hidden');
    localStorage.removeItem('pendingVerificationEmail');
    localStorage.setItem('stage', 'login');
    showLogin();
  } catch (err) {
    registerMsg.textContent = err.message;
  }
};

// --- Products logic ---
async function loadProducts() {
  try {
    const products = await apiGet(API_ENDPOINTS.PRODUCTS);
    renderProducts(products);
  } catch (err) {
    const productList = document.getElementById('product-list');
    if (productList) productList.innerHTML = '<p style="text-align:center;">Failed to load products</p>';
  }
}

function renderProducts(products) {
  const productList = document.getElementById('product-list');
  if (!productList) return;
  if (!products.length) {
    productList.innerHTML = '<p style="text-align:center;">No products available</p>';
    return;
  }
  productList.innerHTML = products.map((product, idx) => `
    <div class="product-card">
      <img src="${product.images[0]}" alt="${product.name}" />
      <h4>${product.name}</h4>
      <p class="description">${product.description}</p>
      <p class="category">${product.category}</p>
      <p class="price">₦${product.price.toLocaleString()}</p>
      <button class="btn-main buy-now-btn" data-idx="${idx}">Buy Now</button>
    </div>
  `).join('');

  // Add event listeners for buy now buttons
  document.querySelectorAll('.buy-now-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = this.getAttribute('data-idx');
      showBuyNowForm(products[idx]);
    };
  });
}

// --- Buy Now Modal Logic ---
function showBuyNowForm(product) {
  let modal = document.getElementById('order-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'order-modal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="modal-content">
      <button id="close-order-modal" class="close-modal">&times;</button>
      <h3>Buy Now: ${product.name}</h3>
      <form id="order-form">
        <label>Quantity:<input type="number" id="order-qty" min="1" value="1" required></label><br>
        <label>Delivery Method:<br>
          <input type="radio" name="delivery-method" value="Pick Up" checked> Pick Up
          <input type="radio" name="delivery-method" value="Deliver"> Deliver
        </label><br>
        <div id="address-fields" style="display:none;">
          <label>Address:<input type="text" id="order-address"></label><br>
        </div>
        <label>Phone:<input type="text" id="order-phone" required></label><br>
        <label>Email:<input type="email" id="order-email" required></label><br>
        <label>Payment Method:
          <select id="payment-method" required>
            <option value="Pay on Delivery">Pay on Delivery</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </label><br>
        <div id="map-container" style="margin:10px 0;"></div>
        <button type="submit" class="btn-main" id="order-submit-btn">Send Order</button>
        <div id="order-spinner" style="display:none;text-align:center;margin-top:1em;"><div class="loader"></div> Sending order...</div>
      </form>
      <div id="order-message"></div>
    </div>
  `;
  modal.classList.remove('hidden');
  modal.style.display = 'block';

  // Map logic
  const mapContainer = document.getElementById('map-container');
  function showMap(deliveryMethod) {
    if (deliveryMethod === 'Deliver') {
      mapContainer.innerHTML = `<iframe width="100%" height="200" frameborder="0" style="border:0" src="https://www.google.com/maps?q=Lagos,Nigeria&z=13&output=embed" allowfullscreen></iframe>`;
    } else {
      mapContainer.innerHTML = `<iframe width="100%" height="200" frameborder="0" style="border:0" src="https://www.google.com/maps?q=GOD'S+OWN+PHONE+GADGET+Store+Lagos,Nigeria&z=15&output=embed" allowfullscreen></iframe>`;
    }
  }
  showMap('Pick Up');

  // Delivery method logic
  const deliveryRadios = modal.querySelectorAll('input[name="delivery-method"]');
  const addressFields = document.getElementById('address-fields');
  deliveryRadios.forEach(radio => {
    radio.onchange = function() {
      if (this.value === 'Deliver') {
        addressFields.style.display = '';
        document.getElementById('order-address').required = true;
        showMap('Deliver');
      } else {
        addressFields.style.display = 'none';
        document.getElementById('order-address').required = false;
        showMap('Pick Up');
      }
    };
  });

  document.getElementById('close-order-modal').onclick = () => {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  };

  document.getElementById('order-form').onsubmit = async function(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('order-submit-btn');
    const spinner = document.getElementById('order-spinner');
    submitBtn.disabled = true;
    spinner.style.display = 'block';
    const quantity = document.getElementById('order-qty').value;
    const deliveryMethod = modal.querySelector('input[name="delivery-method"]:checked').value;
    const address = document.getElementById('order-address').value;
    const phone = document.getElementById('order-phone').value;
    const email = document.getElementById('order-email').value;
    const paymentMethod = document.getElementById('payment-method').value;
    const orderMsg = document.getElementById('order-message');
    orderMsg.textContent = '';
    try {
      const res = await apiPost('/api/orders', {
        productId: product.id || product._id || product.name,
        quantity,
        address: deliveryMethod === 'Deliver' ? address : '',
        phone,
        email,
        deliveryMethod,
        paymentMethod
      });
      orderMsg.textContent = 'Order sent successfully!';
      orderMsg.style.color = '#00b894';
      setTimeout(() => {
        modal.classList.add('hidden');
        modal.style.display = 'none';
      }, 1500);
    } catch (err) {
      orderMsg.textContent = err.message || 'Failed to send order.';
      orderMsg.style.color = '#d63031';
    } finally {
      submitBtn.disabled = false;
      spinner.style.display = 'none';
    }
  };
}

if (myOrdersBtn && ordersModal && closeOrdersModal && ordersList) {
  myOrdersBtn.onclick = async () => {
    ordersModal.classList.remove('hidden');
    ordersModal.style.display = 'block';
    ordersList.innerHTML = '<div class="spinner" style="text-align:center;padding:2em;"><div class="loader"></div> Loading orders...</div>';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders?email=${encodeURIComponent(user.email)}`);
        const orders = await res.json();
        if (!orders.length) {
          ordersList.innerHTML = '<p style="text-align:center;">No orders found.</p>';
        } else {
          ordersList.innerHTML = `<table style="width:100%;font-size:0.98em;"><thead><tr><th>Product</th><th>Qty</th><th>Status</th><th>Date</th></tr></thead><tbody>
            ${orders.map(o => `<tr><td>${o.productId}</td><td>${o.quantity}</td><td>${o.status || 'pending'}</td><td>${o.date ? new Date(o.date).toLocaleString() : ''}</td></tr>`).join('')}
          </tbody></table>`;
        }
      } catch {
        ordersList.innerHTML = '<p style="color:#d63031;text-align:center;">Failed to load orders.</p>';
      }
    } else {
      ordersList.innerHTML = '<p style="text-align:center;">You must be logged in to view your orders.</p>';
    }
  };
  closeOrdersModal.onclick = () => {
    ordersModal.classList.add('hidden');
    ordersModal.style.display = 'none';
  };
}

if (profileBtn && profileModal && closeProfileModal) {
  profileBtn.onclick = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const infoDiv = document.getElementById('profile-info');
    if (user && user.email) {
      infoDiv.innerHTML = `<b>Name:</b> ${user.name || ''}<br><b>Email:</b> ${user.email}`;
    } else {
      infoDiv.innerHTML = 'Not logged in.';
    }
    profileModal.classList.remove('hidden');
    profileModal.style.display = 'block';
    sideMenu.classList.remove('open');
    setTimeout(() => sideMenu.style.display = 'none', 300);
  };
  closeProfileModal.onclick = () => {
    profileModal.classList.add('hidden');
    profileModal.style.display = 'none';
  };
}
if (helpBtn && helpModal && closeHelpModal) {
  helpBtn.onclick = () => {
    helpModal.classList.remove('hidden');
    helpModal.style.display = 'block';
    sideMenu.classList.remove('open');
    setTimeout(() => sideMenu.style.display = 'none', 300);
  };
  closeHelpModal.onclick = () => {
    helpModal.classList.add('hidden');
    helpModal.style.display = 'none';
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const stage = localStorage.getItem('stage');
  if (token && stage === 'products') {
    showProducts();
    loadProducts();
  } else if (stage === 'verify') {
    // Show verification form if user was in the middle of verifying
    document.getElementById('register-view').classList.remove('hidden');
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('verify-code-section').classList.remove('hidden');
    window.pendingVerificationEmail = localStorage.getItem('pendingVerificationEmail');
  } else if (stage === 'login') {
    showLogin();
  } else {
    showLogin();
  }
}); 


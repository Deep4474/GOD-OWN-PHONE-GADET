// API base URL
const API_BASE_URL = 'https://phone-2cv4.onrender.com';
const API_ENDPOINTS = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  VERIFY: '/api/auth/verify',
  PRODUCTS: '/api/products',
  ORDERS: '/api/orders',
  NOTIFICATIONS: '/api/notifications',
  UPDATES: '/api/updates'
};

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

// Show selected category label above product grid
const categoryFilter = document.getElementById('category-filter');
const selectedCategoryLabel = document.getElementById('selected-category-label');
categoryFilter.addEventListener('change', function() {
  filterAndRenderProducts();
});

// Ensure products are loaded and shown on page load if already logged in
document.addEventListener('DOMContentLoaded', function() {
  loadProducts();
});
// --- Auth Gate for Main Content ---
// Removed all auth logic: always show products

// Hide menu and menu toggle on login section
// Removed showLoginView, showRegisterView, hideAuthSection: no longer needed, products always visible

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

// --- Settings Modal ---
let settingsModal = document.getElementById('settings-modal');
if (!settingsModal) {
  settingsModal = document.createElement('div');
  settingsModal.id = 'settings-modal';
  settingsModal.className = 'modal';
  settingsModal.innerHTML = `
    <div class="modal-content" style="max-width:400px;">
      <button id="close-settings-modal" class="close-modal">&times;</button>
      <h3>Settings</h3>
      <div id="settings-user-info" style="margin-bottom:1em;"></div>
      <button id="settings-darkmode-toggle" class="btn-main" style="margin-bottom:1em;width:100%;">Toggle Dark Mode</button>
      <form id="change-password-form" style="margin-bottom:1em;">
        <label>Old Password:<input type="password" id="old-password" required></label><br>
        <label>New Password:<input type="password" id="new-password" required></label><br>
        <label>Confirm New Password:<input type="password" id="confirm-new-password" required></label><br>
        <button type="submit" class="btn-main" style="width:100%;margin-top:8px;">Change Password</button>
        <div id="change-password-message" style="margin-top:6px;font-size:0.98em;"></div>
      </form>
      <button id="settings-logout-btn" class="btn-main" style="background:#d63031;width:100%;">Logout</button>
    </div>
  `;
  document.body.appendChild(settingsModal);
}
let openSettingsBtn = document.getElementById('menu-settings');
if (!openSettingsBtn && sideMenu) {
  // Create the settings button if not present
  openSettingsBtn = document.createElement('button');
  openSettingsBtn.id = 'menu-settings';
  openSettingsBtn.className = 'menu-btn';
  openSettingsBtn.innerHTML = '<span class="icon">⚙️</span> Settings';
  // Insert before logout if possible, else at end
  if (logoutBtn && logoutBtn.parentNode === sideMenu) {
    sideMenu.insertBefore(openSettingsBtn, logoutBtn);
  } else {
    sideMenu.appendChild(openSettingsBtn);
  }
}
settingsModal.classList.add('hidden');
settingsModal.style.display = 'none';
if (openSettingsBtn) {
  openSettingsBtn.onclick = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    document.getElementById('settings-user-info').innerHTML = `<b>Name:</b> ${user.name || ''}<br><b>Email:</b> ${user.email || ''}`;
    settingsModal.classList.remove('hidden');
    settingsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  };
}
document.getElementById('close-settings-modal').onclick = () => {
  settingsModal.classList.add('hidden');
  settingsModal.style.display = 'none';
  document.body.style.overflow = '';
};
document.getElementById('settings-darkmode-toggle').onclick = () => {
  setDarkMode(!document.body.classList.contains('dark-mode'));
};
document.getElementById('settings-logout-btn').onclick = () => {
  logoutBtn.onclick();
  settingsModal.classList.add('hidden');
  settingsModal.style.display = 'none';
};
document.getElementById('change-password-form').onsubmit = async function(e) {
  e.preventDefault();
  const oldPass = document.getElementById('old-password').value;
  const newPass = document.getElementById('new-password').value;
  const confirmNew = document.getElementById('confirm-new-password').value;
  const msg = document.getElementById('change-password-message');
  msg.textContent = '';
  if (newPass !== confirmNew) {
    msg.textContent = 'New passwords do not match.';
    msg.style.color = '#d63031';
    return;
  }
  if (newPass.length < 8) {
    msg.textContent = 'Password must be at least 8 characters.';
    msg.style.color = '#d63031';
    return;
  }
  // Simulate password change (replace with real API if available)
  setTimeout(() => {
    msg.textContent = 'Password changed successfully!';
    msg.style.color = '#00b894';
    document.getElementById('old-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-new-password').value = '';
  }, 1200);
};

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
  showLogin();
  // Hide main content and show login section
  document.getElementById('main-content').style.display = 'none';
  // document.getElementById('auth-section').style.display = 'block'; // removed, no #auth-section
};

// --- Navigation logic (unchanged) ---
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const productsSection = document.getElementById('products-section');
// const authSection = document.getElementById('auth-section'); // removed, no #auth-section

function showLogin() {
  loginView.classList.remove('hidden');
  registerView.classList.add('hidden');
  productsSection.classList.remove('hidden');
  menuToggle.style.display = 'none';
  sideMenu.style.display = 'none';
}
function showRegister() {
  loginView.classList.add('hidden');
  registerView.classList.remove('hidden');
  productsSection.classList.remove('hidden');
  menuToggle.style.display = 'none';
  sideMenu.style.display = 'none';
}
function showProducts() {
  loginView.classList.add('hidden');
  registerView.classList.add('hidden');
  productsSection.classList.remove('hidden');
  menuToggle.style.display = 'inline-block';
  sideMenu.style.display = 'none';
}
document.getElementById('show-register-link').onclick = (e) => { e.preventDefault(); showRegister(); };
document.getElementById('show-login-link').onclick = (e) => { e.preventDefault(); showLogin(); };

// --- Products logic ---
let allProducts = [];
async function loadProducts() {
  try {
    allProducts = await apiGet(API_ENDPOINTS.PRODUCTS);
    filterAndRenderProducts();
  } catch (err) {
    const productList = document.getElementById('product-list');
    if (productList) productList.innerHTML = '<p style="text-align:center;">Failed to load products</p>';
  }
}

function filterAndRenderProducts() {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  let filtered = allProducts;
  const selectedCategory = categoryFilter && categoryFilter.value;
  if (selectedCategory && selectedCategory !== 'All') {
    filtered = filtered.filter(p => (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()));
  }
  if (searchInput && searchInput.value.trim()) {
    const q = searchInput.value.trim().toLowerCase();
    filtered = filtered.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }
  renderProducts(filtered);
  const catLabel = document.getElementById('selected-category-label');
  if (catLabel) {
    catLabel.textContent = selectedCategory && selectedCategory !== 'All' ? selectedCategory : '';
    catLabel.style.display = selectedCategory && selectedCategory !== 'All' ? 'block' : 'none';
  }
}

function renderProducts(products) {
  const productList = document.getElementById('product-list');
  if (!productList) return;
  if (!products.length) {
    productList.innerHTML = '<p style="text-align:center;">No products available</p>';
    return;
  }
  productList.innerHTML = products.map((product, idx) => {
    return `
      <div class="product-card" data-idx="${idx}">
        <img src="${product.images[0]}" alt="${product.name}" class="product-img" data-idx="${idx}" style="cursor:pointer;" />
        <h4>${product.name}</h4>
        <p class="description" id="desc-${idx}" style="display:none;">${product.description}</p>
        <span class="category-badge" data-category="${product.category}">${product.category}</span>
        <p class="price">₦${product.price.toLocaleString()}</p>
        <button class="btn-main buy-now-btn" data-idx="${idx}">Buy Now</button>
      </div>
    `;
  }).join('');
  document.querySelectorAll('.product-img').forEach(img => {
    img.onclick = function(e) {
      e.stopPropagation();
      const idx = this.getAttribute('data-idx');
      document.querySelectorAll('.description').forEach(desc => desc.style.display = 'none');
      const desc = document.getElementById('desc-' + idx);
      if (desc) desc.style.display = 'block';
    };
  });
  document.querySelectorAll('.buy-now-btn').forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      const idx = this.getAttribute('data-idx');
      showBuyNowForm(products[idx]);
    };
  });
  document.querySelectorAll('.category-badge').forEach(badge => {
    badge.onclick = function(e) {
      e.stopPropagation();
      const cat = this.getAttribute('data-category');
      const categoryFilter = document.getElementById('category-filter');
      if (categoryFilter) {
        categoryFilter.value = cat;
        filterAndRenderProducts();
      }
    };
  });
}

// --- Premium Section Logic ---
// This function will handle the Buy Now for premium section only
function setupPremiumSection() {
  const premiumSection = document.getElementById('premium-section');
  if (!premiumSection) return;
  premiumSection.addEventListener('click', function(e) {
    if (e.target.classList.contains('premium-buy-btn')) {
      e.preventDefault();
      const productId = e.target.getAttribute('data-product-id');
      showPremiumBuyModal(productId);
    }
  });
}

function showPremiumBuyModal(productId) {
  // You can fetch product details by ID if needed
  // For demo, just show a simple modal
  let modal = document.getElementById('premium-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'premium-modal';
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.zIndex = '9999';
    modal.style.background = 'rgba(0,0,0,0.35)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.overflowY = 'auto';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="modal-content" style="background:#fff;max-width:420px;width:95vw;padding:24px 18px 18px 18px;border-radius:12px;box-shadow:0 4px 24px #0002;position:relative;">
      <button id="close-premium-modal" class="close-modal" style="position:absolute;top:10px;right:10px;font-size:1.5em;background:none;border:none;cursor:pointer;">&times;</button>
      <h3 style="margin-top:0;">Premium Product Purchase</h3>
      <div style="margin:1em 0;">This is the premium buy modal for product ID: <b>${productId}</b></div>
      <button class="btn-main" id="premium-buy-confirm">Confirm Purchase</button>
    </div>
  `;
  document.getElementById('close-premium-modal').onclick = () => {
    modal.classList.add('hidden');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };
  document.getElementById('premium-buy-confirm').onclick = () => {
    alert('Premium product purchased!');
    modal.classList.add('hidden');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Call this on DOMContentLoaded
document.addEventListener('DOMContentLoaded', setupPremiumSection);

// --- Buy Now Modal Logic ---
function showBuyNowForm(product) {
  let modal = document.getElementById('order-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'order-modal';
    modal.className = 'modal';
    // Overlay styles for modal
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.zIndex = '9999';
    modal.style.background = 'rgba(0,0,0,0.35)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.overflowY = 'auto';
    document.body.appendChild(modal);
  } else {
    // Ensure modal is styled correctly if it already exists
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.zIndex = '9999';
    modal.style.background = 'rgba(0,0,0,0.35)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.overflowY = 'auto';
  }
  // Hide products section and prevent background scroll
  document.body.style.overflow = 'hidden';
  const productsSection = document.getElementById('products-section');
  if (productsSection) productsSection.style.display = 'none';
  // Referral/invite logic for premium products
  let referralHtml = '';
  if (product.premium) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const inviteBase = window.location.origin || 'https://godsownpane.netlify.app';
    const inviteLink = `${inviteBase}/?ref=${encodeURIComponent(user.email || 'guest')}&product=${product.id}`;
    let invitedCount = parseInt(localStorage.getItem(`referral_count_${product.id}`) || '0', 10);
    if (isNaN(invitedCount)) invitedCount = 0;
    const isDark = document.body.classList.contains('dark-mode');
    referralHtml = `
      <div class="referral-box" style="background:${isDark ? '#222' : '#fff'};padding:16px 12px 18px 12px;margin-bottom:10px;border-radius:8px;border:1px solid ${isDark ? '#444' : '#bbb'};text-align:center;box-shadow:0 2px 8px #0001;">
        <b style="font-size:1.1em;color:${isDark ? '#ffe082' : '#b97a00'};">Invite 10 people to unlock 20% discount on this premium product!</b><br>
        <span style="font-size:13px;color:${isDark ? '#fff' : '#222'};">Share this link with your friends. When 10 register and buy, you get your discount automatically.</span><br>
        <input type="text" id="invite-link" value="${inviteLink}" readonly style="width:90%;margin:8px 0 0 0;padding:4px;background:${isDark ? '#333' : '#f8f8f8'};color:${isDark ? '#fff' : '#222'};border:1px solid ${isDark ? '#666' : '#bbb'};font-size:1em;border-radius:6px;">
        <button id="copy-invite-link" style="margin-left:5px;">Copy Link</button>
        <div style="margin-top:10px;font-size:1em;color:${isDark ? '#ffe082' : '#b97a00'};">Progress: <b id="referral-progress">${invitedCount}</b>/10 invited</div>
        <div id="referral-info-msg" style="margin-top:8px;color:#d63031;font-size:0.98em;"></div>
      </div>
    `;
  }
  modal.innerHTML = `
    <div class="modal-content" style="background:#fff;max-width:430px;width:97vw;padding:24px 18px 18px 18px;border-radius:12px;box-shadow:0 4px 24px #0002;position:relative;">
      <button id="close-order-modal" class="close-modal" style="position:absolute;top:10px;right:10px;font-size:1.5em;background:none;border:none;cursor:pointer;">&times;</button>
      <h3 style="margin-top:0;">Buy Now: ${product.name}</h3>
      ${referralHtml}
      <form id="order-form">
        <label>Quantity:<input type="number" id="order-qty" min="1" value="1" required style="width:60px;"></label><br>
        <label>Delivery Method:<br>
          <input type="radio" name="delivery-method" value="Pick Up" checked> Pick Up
          <input type="radio" name="delivery-method" value="Deliver"> Deliver
        </label><br>
        <div id="pickup-section">
          <div style="background:#f8f8f8;padding:10px 8px 10px 8px;margin-bottom:10px;border-radius:8px;border:1px solid #eee;">
            <b>Pick Up Location:</b><br>
            <span>Lagos, Nigeria (Store Address)</span><br>
            <span style="font-size:0.95em;color:#888;">You will pick up your order at our store. ₦30 fee applies.</span>
          </div>
        </div>
        <div id="delivery-section" style="display:none;">
          <div style="background:#f8f8f8;padding:10px 8px 10px 8px;margin-bottom:10px;border-radius:8px;border:1px solid #eee;">
            <b>Delivery Address:</b><br>
            <input type="text" id="order-address" style="width:95%;margin-top:4px;" placeholder="Enter delivery address">
            <span style="font-size:0.95em;color:#888;">Delivery fee is calculated based on your address.</span>
          </div>
        </div>
        <label>Phone:<input type="text" id="order-phone" required style="width:90%;"></label><br>
        <label>Email:<input type="email" id="order-email" required style="width:90%;"></label><br>
        <label>Payment Method:
          <select id="payment-method" required style="width:90%;">
            <option value="Pay on Delivery">Pay on Delivery</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </label><br>
        <div id="total-amount-box" style="margin:10px 0 0 0;font-weight:bold;font-size:1.1em;color:#1976d2;text-align:right;"></div>
        <button type="submit" class="btn-main" id="order-submit-btn" style="width:100%;margin-top:10px;">Send Order</button>
        <div id="order-spinner" style="display:none;text-align:center;margin-top:1em;"><div class="loader"></div> Sending order...</div>
      </form>
      <div id="order-message"></div>
    </div>
  `;
  // Restore scroll and products section when modal closes (cancelled)
  setTimeout(() => {
    const closeBtn = document.getElementById('close-order-modal');
    if (closeBtn) {
      closeBtn.onclick = function() {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        const productsSection = document.getElementById('products-section');
        if (productsSection) productsSection.style.display = '';
      };
    }
    // Also close on clicking outside modal content
    modal.onclick = function(e) {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        const productsSection = document.getElementById('products-section');
        if (productsSection) productsSection.style.display = '';
      }
    };
  }, 200);
  // --- Total Amount Calculation ---
  // --- Geolocation and Distance-based Delivery Fee ---
  let userCoords = null;
  let lastAddressCoords = null;
  // Get user's current location (once per modal open)
  function getUserLocation(callback) {
    if (userCoords) return callback(userCoords);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          userCoords = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          };
          callback(userCoords);
        },
        err => {
          // Default to Lagos if denied
          userCoords = { lat: 6.5244, lon: 3.3792 };
          callback(userCoords);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      // Default to Lagos
      userCoords = { lat: 6.5244, lon: 3.3792 };
      callback(userCoords);
    }
  }

  // Geocode address to lat/lon using Nominatim
  async function geocodeAddress(address) {
    if (!address) return null;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    try {
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
    } catch {}
    return null;
  }

  // Haversine formula for distance in km
  function calcDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async function estimateDeliveryFeeDynamic(toAddress) {
    return new Promise(resolve => {
      getUserLocation(async (fromCoords) => {
        if (!toAddress) return resolve(1500);
        // Geocode destination
        let toCoords = lastAddressCoords;
        if (!toCoords || toCoords.address !== toAddress) {
          toCoords = await geocodeAddress(toAddress);
          if (toCoords) toCoords.address = toAddress;
          lastAddressCoords = toCoords;
        }
        if (!toCoords) return resolve(1500);
        // Calculate distance
        const dist = calcDistanceKm(fromCoords.lat, fromCoords.lon, toCoords.lat, toCoords.lon);
        // Fee: ₦500 for <=10km, +₦100 per extra 5km
        let fee = 500;
        if (dist > 10) {
          fee += Math.ceil((dist - 10) / 5) * 100;
        }
        resolve(Math.round(fee));
      });
    });
  }

  function updateTotalAmount() {
    const qty = parseInt(document.getElementById('order-qty').value, 10) || 1;
    const deliveryMethod = modal.querySelector('input[name="delivery-method"]:checked').value;
    let total = product.price * qty;
    let extra = 0;
    let extraLabel = '';
    if (deliveryMethod === 'Pick Up') {
      extra = 30;
      extraLabel = 'Pick Up Fee: ₦30';
      const grandTotal = total + extra;
      document.getElementById('total-amount-box').innerHTML = `Product: ₦${total.toLocaleString()}<br>${extraLabel}<br><span style=\"font-size:1.15em;color:#009688;\">Total: ₦${grandTotal.toLocaleString()}</span>`;
    } else {
      // Delivery: estimate fee based on distance
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const addressInput = document.getElementById('order-address');
      let toAddress = '';
      if (addressInput && addressInput.value.trim()) {
        toAddress = addressInput.value.trim();
      } else if (user.address) {
        toAddress = user.address;
      }
      document.getElementById('total-amount-box').innerHTML = 'Calculating delivery fee...';
      estimateDeliveryFeeDynamic(toAddress).then(fee => {
        extra = fee;
        extraLabel = `Delivery Fee: ₦${extra}`;
        const grandTotal = total + extra;
        document.getElementById('total-amount-box').innerHTML = `Product: ₦${total.toLocaleString()}<br>${extraLabel}<br><span style=\"font-size:1.15em;color:#009688;\">Total: ₦${grandTotal.toLocaleString()}</span>`;
      });
    }
  }

  // Initial total
  setTimeout(updateTotalAmount, 250);

  // Debounce helper to avoid too many API calls while typing address
  function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  setTimeout(() => {
    document.getElementById('order-qty').addEventListener('input', updateTotalAmount);
    modal.querySelectorAll('input[name="delivery-method"]').forEach(r => r.addEventListener('change', updateTotalAmount));
    const addressInput = document.getElementById('order-address');
    if (addressInput) {
      addressInput.addEventListener('input', debounce(updateTotalAmount, 400));
    }
  }, 300);
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  // Prevent background scroll
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  // Get registered address from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const registeredAddress = user.address || 'Lagos, Nigeria';

  // Pre-fill address field with registered address
  const addressInput = document.getElementById('order-address');
  if (addressInput && registeredAddress) {
    addressInput.value = registeredAddress;
  }

  // Map logic removed: no map preview for address
  setTimeout(() => {
    const addressInput = document.getElementById('order-address');
    if (addressInput && registeredAddress) {
      addressInput.value = registeredAddress;
    }
  }, 200);

  // Delivery method logic: show/hide sections
  // Robustly setup delivery sections for all devices (including mobile)
  function robustSetupDeliverySections(retries = 0) {
    const deliveryRadios = modal.querySelectorAll('input[name="delivery-method"]');
    const pickupSection = document.getElementById('pickup-section');
    const deliverySection = document.getElementById('delivery-section');
    const addressInput = document.getElementById('order-address');
    // Retry if elements are not yet in DOM
    if (!deliveryRadios.length || !pickupSection || !deliverySection) {
      if (retries < 15) {
        setTimeout(() => robustSetupDeliverySections(retries + 1), 80);
      }
      return;
    }
    function updateSections() {
      const selected = modal.querySelector('input[name="delivery-method"]:checked');
      if (selected && selected.value === 'Deliver') {
        pickupSection.style.display = 'none';
        deliverySection.style.display = '';
        if (addressInput) addressInput.required = true;
      } else {
        pickupSection.style.display = '';
        deliverySection.style.display = 'none';
        if (addressInput) addressInput.required = false;
      }
      updateTotalAmount();
    }
    // Remove any previous listeners to avoid duplicates
    deliveryRadios.forEach(radio => {
      radio.onchange = null;
    });
    // Add listeners
    deliveryRadios.forEach(radio => {
      radio.addEventListener('change', updateSections);
    });
    // Also update on modal open (in case default is Deliver)
    setTimeout(updateSections, 0);
    // Update total on address change
    if (addressInput) {
      addressInput.addEventListener('input', updateTotalAmount);
    }
  }
  robustSetupDeliverySections();

  document.getElementById('close-order-modal').onclick = () => {
    modal.classList.add('hidden');
    modal.style.display = 'none';
    // Restore background scroll
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
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
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        const productsSection = document.getElementById('products-section');
        if (productsSection) productsSection.style.display = '';
        submitBtn.disabled = false;
        spinner.style.display = 'none';
      }, 1200);
    } catch (err) {
      orderMsg.textContent = err.message || 'Failed to send order.';
      orderMsg.style.color = '#d63031';
      submitBtn.disabled = false;
      spinner.style.display = 'none';
    }
  };
}
      




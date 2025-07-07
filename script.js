// ONGOD Gadget Shop JavaScript - Backend Integration

// API Configuration
const API_BASE_URL = window.location.origin;
const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  VERIFY: '/api/auth/verify',
  LOGOUT: '/api/auth/logout',
  PRODUCTS: '/api/products',
  ORDERS: '/api/orders',
  USER_ORDERS: '/api/orders/user',
  CREATE_ORDER: '/api/orders/create',
  NOTIFICATIONS: '/api/notifications',
  MARK_READ: '/api/notifications/:id/read',
  UNREAD_COUNT: '/api/notifications/unread-count',
  PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile/update',
  LOCATION: '/location',
  ADDRESS_VERIFY: '/location/verify',
  ADMIN_LOGIN: '/api/admin/login'
};


// Global state
let currentUser = null;
let selectedProduct = null;
let products = [];
let orders = [];
let notifications = [];
let unreadNotifications = 0;
let authToken = localStorage.getItem('authToken');

// API Helper Functions
class API {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    };
    
    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        let message = `HTTP error! status: ${response.status}`;
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          message = errorData.errors.map(e => e.msg).join(', ');
        } else if (errorData.error) {
          message = errorData.error;
        } else if (errorData.message) {
          message = errorData.message;
        }
        
        const error = new Error(message);
        error.data = errorData;
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      handleTokenExpiry(error); // Handle token expiry and log out user
      console.error('API Error:', error);
      throw error;
    }
  }
  
  static get(endpoint) {
    return this.request(endpoint);
  }
  
  static post(endpoint, data) {
    console.log('API POST:', endpoint, data); // Debug log
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  static put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  static delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

// Authentication Functions
async function loginUser() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  // Extra validation
  if (!email || !password) {
    showMessage('Please enter email and password', 'error');
    return;
  }
  // Simple email format check
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    showMessage('Please enter a valid email address', 'error');
    return;
  }

  try {
    showLoading('Logging in...');
    // Debug: log payload
    console.log('[DEBUG] Login payload:', { email, password });
    const response = await API.post(API_ENDPOINTS.LOGIN, { email, password });
    // Debug: log response
    console.log('[DEBUG] Login response:', response);
    if (response.user && response.token) {
      authToken = response.token;
      currentUser = response.user;
      // Backend check: is user verified?
      if (!currentUser.isVerified) {
        showMessage('Please verify your email before accessing the shop. Enter your code below.', 'warning');
        document.getElementById('verify-email').value = currentUser.email;
        showVerify(); // Always show verify section if not verified
        return;
      }
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('userData', JSON.stringify(currentUser));
      showMessage('Login successful! Welcome back.', 'success');
      showProducts();
      updateUserInfo();
      await Promise.all([
        loadProducts(),
        loadUserOrders(),
        loadNotifications(),
        startNotificationPolling()
      ]);
    } else {
      // Show backend error message if present
      showMessage(response.message || response.error || 'Login failed', 'error');
      // Debug: log backend error
      console.error('[DEBUG] Login backend error:', response);
    }
  } catch (error) {
    // Show exact backend error if available
    showMessage(error.message || 'Login failed. Please try again.', 'error');
    // Debug: log error
    console.error('[DEBUG] Login error:', error);
    if (error.data) {
      console.error('[DEBUG] Login error data:', error.data);
    }
  } finally {
    hideLoading();
  }
}

async function registerUser() {
  const formData = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    confirmEmail: document.getElementById('confirm-email').value.trim(),
    password: document.getElementById('password').value,
    confirmPassword: document.getElementById('confirm-password').value,
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim(),
    state: document.getElementById('state').value,
    lga: document.getElementById('lga').value
    // position removed
  };

  // Extra validation
  if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.address) {
    showMessage('Please fill in all required fields', 'error');
    return;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
    showMessage('Please enter a valid email address', 'error');
    return;
  }
  if (formData.email !== formData.confirmEmail) {
    showMessage('Emails do not match', 'error');
    return;
  }
  // Password strength validation
  const minLength = 8;
  if (formData.password.length < minLength) {
    showMessage(`Password must be at least ${minLength} characters`, 'error');
    return;
  }
  if (formData.password !== formData.confirmPassword) {
    showMessage('Passwords do not match', 'error');
    return;
  }

  try {
    showLoading('Registering...');
    const response = await API.post(API_ENDPOINTS.REGISTER, formData);
    if (response.user) {
      currentUser = response.user;
      if (!currentUser.isVerified) {
        showMessage('Registration successful! Please verify your email.', 'success');
        document.getElementById('verify-email').value = currentUser.email;
        showVerify();
      } else {
        showMessage('Registration successful! You can now log in.', 'success');
        showLogin();
      }
    } else {
      showMessage(response.message || 'Registration failed', 'error');
    }
  } catch (error) {
    showMessage(error.message || 'Registration failed. Please try again.', 'error');
    console.error('[DEBUG] Register error:', error);
    if (error.data) {
      console.error('[DEBUG] Register error data:', error.data);
    }
  } finally {
    hideLoading();
  }
}

async function verifyEmail() {
  const email = document.getElementById('verify-email').value.trim();
  const code = document.getElementById('verification-code').value.trim();

  if (!email || !code) {
    showMessage('Please enter email and verification code', 'error');
    return;
  }

  try {
    showLoading('Verifying email...');
    // Debug log
    console.log('[DEBUG] Sending verify payload:', { email, code });
    const response = await API.post(API_ENDPOINTS.VERIFY, { email, code });
    if (response.success) {
      // After verification, log the user in and show main content
      // Fetch user data (simulate login)
      const loginResponse = await API.post(API_ENDPOINTS.LOGIN, { email, password: document.getElementById('password').value });
      if (loginResponse.user && loginResponse.token) {
        authToken = loginResponse.token;
        currentUser = loginResponse.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userData', JSON.stringify(currentUser));
        showMessage('Email verified and logged in! Welcome to GOD\'SOWN PHONE GADGET.', 'success');
        showProducts();
        updateUserInfo();
        await Promise.all([
          loadProducts(),
          loadUserOrders(),
          loadNotifications(),
          startNotificationPolling()
        ]);
      } else {
        showMessage('Verification succeeded, but automatic login failed. Please log in manually.', 'warning');
        showLogin();
      }
    } else {
      showMessage(response.message || 'Verification failed', 'error');
    }
  } catch (error) {
    showMessage(error.message || 'Verification failed. Please try again.', 'error');
  } finally {
    hideLoading();
  }
}

async function logoutUser() {
  try {
    await API.post(API_ENDPOINTS.LOGOUT);
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  currentUser = null;
  authToken = null;
  products = [];
  orders = [];
  notifications = [];
  unreadNotifications = 0;
  
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  
  stopNotificationPolling();
  
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  
  showLogin();
  updateUserInfo();
  showMessage('Logged out successfully', 'success');
}

// Product Functions
async function loadProducts() {
  try {
    const response = await API.get(API_ENDPOINTS.PRODUCTS);
    products = Array.isArray(response) ? response : (response.products || []);
    displayProducts();
  } catch (error) {
    console.error('Failed to load products:', error);
    showMessage('Failed to load products', 'error');
  }
}

function displayProducts() {
  const productList = document.getElementById('product-list');
  if (!productList) return;

  if (products.length === 0) {
    productList.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No products available</p>';
    return;
  }

  productList.innerHTML = products.map(product => {
    const imgUrl = (product.images && product.images.length) ? product.images[0] : 'https://via.placeholder.com/220x160/ccc/666?text=No+Image';
    return `
      <div class="product-card" data-id="${product._id}">
        <div class="product-image-container">
          <img src="${imgUrl}" alt="${product.name}">
        </div>
        <h4>${product.name}</h4>
        <p class="description">${product.description}</p>
        <p class="category">${product.category}</p>
        <p class="price">₦${product.price.toLocaleString()}</p>
        <button class="buy-now-btn" data-product-id="${product._id}">Buy Now</button>
      </div>
    `;
  }).join('');
}

function filterProducts() {
  const searchInput = document.getElementById('search-input').value.toLowerCase();
  const categoryFilter = document.getElementById('category-filter').value;

  const filteredProducts = products.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(searchInput);
    const categoryMatch = categoryFilter === '' || product.category === categoryFilter;
    return nameMatch && categoryMatch;
  });

  const productList = document.getElementById('product-list');
  if (!productList) return;

  if (filteredProducts.length === 0) {
    productList.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No products found</p>';
    return;
  }

  productList.innerHTML = filteredProducts.map(product => {
    const imgUrl = (product.images && product.images.length) ? product.images[0] : 'https://via.placeholder.com/220x160/ccc/666?text=No+Image';
    return `
      <div class="product-card" data-id="${product._id}">
        <div class="product-image-container">
          <img src="${imgUrl}" alt="${product.name}">
        </div>
        <h4>${product.name}</h4>
        <p class="description">${product.description}</p>
        <p class="category">${product.category}</p>
        <p class="price">₦${product.price.toLocaleString()}</p>
        <button class="buy-now-btn" data-product-id="${product._id}">Buy Now</button>
      </div>
    `;
  }).join('');
}

function selectProduct(productId) {
  selectedProduct = products.find(p => p._id === productId);
  
  if (!selectedProduct) {
    showMessage('Product not found', 'error');
    return;
  }
  
  document.getElementById('selected-product-name').textContent = selectedProduct.name;
  document.getElementById('selected-product-price').textContent = `₦${selectedProduct.price.toLocaleString()}`;
  
  updateTotal();
  showBuy();
}

// Order Functions
async function loadUserOrders() {
  if (!currentUser) {
    console.log('No currentUser found when loading user orders.');
    return;
  }
  try {
    console.log('Fetching orders for user:', currentUser);
    const response = await API.get(API_ENDPOINTS.USER_ORDERS);
    orders = response.orders || [];
    console.log('Fetched orders:', orders);
    updateNotifications();
  } catch (error) {
    console.error('Failed to load orders:', error);
  }
}

// Save notification to localStorage
function saveUserNotification(notification) {
  let notifications = [];
  try {
    notifications = JSON.parse(localStorage.getItem('userOrderNotifications')) || [];
  } catch (e) { notifications = []; }
  notifications.unshift(notification);
  if (notifications.length > 100) notifications = notifications.slice(0, 100);
  localStorage.setItem('userOrderNotifications', JSON.stringify(notifications));
}

// Show notification history in the UI
function showUserNotificationHistory() {
  let notifications = [];
  try {
    notifications = JSON.parse(localStorage.getItem('userOrderNotifications')) || [];
  } catch (e) { notifications = []; }
  const container = document.getElementById('user-notification-history');
  if (!container) return;
  if (notifications.length === 0) {
    container.innerHTML = '<div>No notifications yet.</div>';
    return;
  }
  container.innerHTML = notifications.map(n => `<div>${n.time}: ${n.message}</div>`).join('');
}

async function placeOrder() {
  const quantityInput = document.getElementById('quantity');
  const buyOptionSelect = document.getElementById('buy-option');
  const paymentMethodSelect = document.getElementById('payment-method');
  const emailInput = document.getElementById('order-email');
  const phoneInput = document.getElementById('order-phone');

  if (!selectedProduct || !currentUser || !quantityInput || !buyOptionSelect || !paymentMethodSelect) {
    showMessage('An error occurred. Please try again.', 'error');
    console.error('Missing required elements or data for placing an order.');
    return;
  }

  const orderData = {
    userId: currentUser._id,
    productId: selectedProduct._id,
    quantity: parseInt(quantityInput.value, 10),
    deliveryOption: buyOptionSelect.value,
    paymentMethod: paymentMethodSelect.value,
    deliveryAddress: currentUser.address,
    totalAmount: calculateTotal(parseInt(quantityInput.value, 10), buyOptionSelect.value),
    email: emailInput ? emailInput.value : (currentUser.email || ''),
    phone: phoneInput ? phoneInput.value : (currentUser.phone || '')
  };

  if (!orderData.deliveryOption || !orderData.paymentMethod) {
    showMessage('Please select both delivery option and payment method', 'error');
    return;
  }
  
  try {
    showLoading('Placing order...');
    
    const response = await API.post(API_ENDPOINTS.CREATE_ORDER, orderData);
    
    if (response.success) {
      showMessage('Order placed successfully! Admin will review and update you.', 'success');
      
      const order = response.order;
      let message = `Order Details:\n\n`;
      message += `Order ID: ${order._id}\n`;
      message += `Product: ${selectedProduct.name}\n`;
      message += `Quantity: ${quantityInput.value}\n`;
      message += `Total: ₦${order.totalAmount.toLocaleString()}\n`;
      message += `Status: ${order.status}\n`;
      message += `Date: ${new Date(order.createdAt).toLocaleString()}\n\n`;
      
      if (paymentMethodSelect.value === 'transfer') {
        message += `Please transfer ₦${order.totalAmount.toLocaleString()} to:\n`;
        message += `Account: ONGOD GADGETS\n`;
        message += `Account No: 1234567890\n`;
        message += `Bank: Zenith Bank\n\n`;
      }
      
      message += `You will receive notifications when admin updates your order.`;
      
      alert(message);
      
      resetBuyForm();
      await loadUserOrders();
      showProducts();
      // Add to local notification history
      saveUserNotification({
        message: `Your order #${response.order._id.slice(-6)} has been sent to admin.`,
        time: new Date().toLocaleString()
      });
    } else {
      showMessage(response.message || 'Failed to place order', 'error');
    }
  } catch (error) {
    showMessage(error.message || 'Failed to place order. Please try again.', 'error');
  } finally {
    hideLoading();
  }
}

function calculateTotal(quantity, buyOption) {
  if (!selectedProduct || !selectedProduct.price) return 0;
  
  const basePrice = selectedProduct.price * quantity;
  let deliveryFee = 0;
  
  if (buyOption === 'Delivery') {
    // Delivery is 5% of base price
    deliveryFee = basePrice * 0.05; 
  } else if (buyOption === 'Pick Up') { // Changed from 'Pick'
    // Pick up is 2% of base price
    deliveryFee = basePrice * 0.02;
  }
  
  return basePrice + deliveryFee;
}

function updateTotal() {
  if (!selectedProduct) return;
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const totalPrice = quantity * selectedProduct.price;
  document.getElementById('total-price').textContent = `₦${totalPrice.toLocaleString()}`;
}

function displayOrders() {
  const ordersList = document.getElementById('orders-list');
  if (!ordersList) return;
  console.log('Displaying orders:', orders);
  if (orders.length === 0) {
    ordersList.innerHTML = '<p style="text-align: center;">No orders found</p>';
    return;
  }
  
  ordersList.innerHTML = orders.map(order => `
    <div class="order-item">
      <h4>${order.productName || order.productId}</h4>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Quantity:</strong> ${order.quantity}</p>
      <p><strong>Total:</strong> ₦${order.totalAmount.toLocaleString()}</p>
      <p><strong>Status:</strong> <span class="status-${order.status}">${order.status}</span></p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      ${order.adminMessage ? `<p class="admin-message"><strong>Admin Response:</strong> ${order.adminMessage}</p>` : '<p class="admin-message pending">No admin response yet.</p>'}
    </div>
  `).join('');
}

// Notification Functions
let notificationInterval;

async function loadNotifications() {
  if (!currentUser) return;
  try {
    // Fetch notifications from backend (admin messages)
    const response = await API.get(API_ENDPOINTS.NOTIFICATIONS);
    const backendNotifications = response.notifications || [];
    // Fetch orders for order history (sent to admin)
    if (!orders || orders.length === 0) {
      const ordersResponse = await API.get(API_ENDPOINTS.USER_ORDERS);
      orders = ordersResponse.orders || [];
    }
    // Order notifications: sent to admin
    const orderNotifications = orders.map(order => ({
      id: order._id,
      product: order.productName || order.productId,
      status: order.status,
      date: order.createdAt,
      adminMessage: order.adminMessage || '',
      type: 'order',
      from: 'user',
    }));
    // Admin notifications: from backend
    const adminNotifications = backendNotifications.map(n => ({
      id: n._id,
      product: n.product || '',
      status: n.type || '',
      date: n.createdAt,
      adminMessage: n.message || '',
      type: n.type || 'admin',
      from: 'admin',
    }));
    // Merge and sort by date (most recent first)
    notifications = [...orderNotifications, ...adminNotifications].sort((a, b) => new Date(b.date) - new Date(a.date));
    // Unread count (backend only, for badge)
    const unreadResponse = await API.get(API_ENDPOINTS.UNREAD_COUNT);
    unreadNotifications = unreadResponse.count || 0;
    updateNotificationBadge();
    renderNotificationDropdown();
  } catch (error) {
    console.error('Failed to load notifications:', error);
  }
}

function updateNotificationBadge() {
  const notificationBtn = document.getElementById('notification-bell');
  if (!notificationBtn) return;
  
  let badge = notificationBtn.querySelector('.notification-badge');
  
  if (unreadNotifications > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'notification-badge';
      badge.style.cssText = `
        position: absolute;
        top: -5px;
        right: -5px;
        background: #e74c3c;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
      `;
      notificationBtn.appendChild(badge);
    }
    badge.textContent = unreadNotifications;
  } else if (badge) {
    badge.remove();
  }
}

function startNotificationPolling() {
  stopNotificationPolling(); // Clear any existing interval
  notificationInterval = setInterval(async () => {
    if (authToken) {
      try {
        await loadNotifications();
      } catch (error) {
        console.error('Polling error:', error);
        // Optional: stop polling if there's a persistent error
        if (error.data && (error.data.status === 401 || error.data.status === 403)) {
          stopNotificationPolling();
        }
      }
    }
  }, 15000); // Poll every 15 seconds
}

function stopNotificationPolling() {
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }
}

// Location Functions
async function getCurrentLocation() {
  if (navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      const response = await API.post(API_ENDPOINTS.LOCATION, location);
      
      if (response.address) {
        document.getElementById('delivery-state').value = response.address.state || '';
        document.getElementById('delivery-area').value = response.address.area || '';
        document.getElementById('delivery-street').value = response.address.street || '';
        document.getElementById('delivery-address').value = response.address.fullAddress || '';
        
        showMessage('Current location obtained successfully', 'success');
      }
    } catch (error) {
      showMessage('Unable to get current location', 'error');
    }
  } else {
    showMessage('Geolocation is not supported by this browser', 'error');
  }
}

// UI Functions
function showLoading(message = 'Loading...') {
  const loadingDiv = document.getElementById('loading-overlay') || createLoadingOverlay();
  loadingDiv.querySelector('.loading-message').textContent = message;
  loadingDiv.style.display = 'flex';
}

function hideLoading() {
  const loadingDiv = document.getElementById('loading-overlay');
  if (loadingDiv) {
    loadingDiv.style.display = 'none';
  }
}

function createLoadingOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'loading-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;
  
  overlay.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
      <div class="spinner"></div>
      <p class="loading-message">Loading...</p>
    </div>
  `;
  
  document.body.appendChild(overlay);
  return overlay;
}

// Navigation functions
function showLogin() {
  hideAllSections();
  const loginSection = document.getElementById('login-section');
  if (loginSection) loginSection.classList.remove('hidden');
  const userInfo = document.getElementById('user-info');
  if (userInfo) userInfo.classList.add('hidden');
  if (!window.justVerified) clearVerifiedLoginMessage();
  window.justVerified = false;
  localStorage.setItem('currentSection', 'login');
}

function showRegister() {
  hideAllSections();
  const regSection = document.getElementById('register-section');
  if (regSection) regSection.classList.remove('hidden');
  const userInfo = document.getElementById('user-info');
  if (userInfo) userInfo.classList.add('hidden');
  setupRegisterPasswordToggles();
  localStorage.setItem('currentSection', 'register');
}

function showVerify() {
  hideAllSections();
  const verifySection = document.getElementById('verify-section');
  if (verifySection) verifySection.classList.remove('hidden');
  const userInfo = document.getElementById('user-info');
  if (userInfo) userInfo.classList.add('hidden');
  localStorage.setItem('currentSection', 'verify');
}

function showProducts() {
  hideAllSections();
  document.getElementById('products-section').classList.remove('hidden');
  displayProducts();
  localStorage.setItem('currentSection', 'products');
}

async function showOrders() {
  if (!currentUser) return;
  hideAllSections();
  document.getElementById('orders-section').classList.remove('hidden');
  displayOrders();
  localStorage.setItem('currentSection', 'orders');
}

function showBuy() {
  hideAllSections();
  document.getElementById('buy-section').classList.remove('hidden');
  localStorage.setItem('currentSection', 'buy');
}

function showMap() {
  const buyOption = document.getElementById('buy-option').value;
  const mapContainer = document.getElementById('map-container');
  if (buyOption === 'Delivery' || buyOption === 'Pick') {
    mapContainer.classList.remove('hidden');
    initializeMap();
  } else {
    mapContainer.classList.add('hidden');
  }
}

function hideAllSections() {
  document.querySelectorAll('main > section').forEach(section => {
    section.classList.add('hidden');
  });
}

function updateUserInfo() {
  const userInfo = document.getElementById('user-info');
  const welcome = document.getElementById('welcome');
  if (currentUser && userInfo && welcome) {
    userInfo.classList.remove('hidden');
    welcome.textContent = `Welcome, ${currentUser.name || currentUser.email}`;
  } else if (userInfo && welcome) {
    userInfo.classList.add('hidden');
    welcome.textContent = '';
  }
  updateHeaderActions();
}

function showUserMapModal(address) {
  // Simple alert for now, can be replaced by a modal library
  alert(`Map for address: ${address}`);
}

function resetBuyForm() {
  const buyForm = document.getElementById('buy-form');
  if (buyForm) {
    buyForm.reset();
  }
  // Also manually reset elements that .reset() might not affect
  document.getElementById('total-price').textContent = '₦0';
  document.getElementById('map-container').classList.add('hidden');
  selectedProduct = null;
}

// Utility functions
function showMessage(message, type = 'info') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  switch (type) {
    case 'success':
      messageDiv.style.backgroundColor = '#28a745';
      break;
    case 'error':
      messageDiv.style.backgroundColor = '#dc3545';
      break;
    case 'warning':
      messageDiv.style.backgroundColor = '#ffc107';
      messageDiv.style.color = '#000';
      break;
    default:
      messageDiv.style.backgroundColor = '#17a2b8';
  }
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 300);
  }, 3000);
}

function togglePasswordVisibility() {
  const passwordInput = document.getElementById('login-password');
  const toggleBtn = document.getElementById('toggle-login-password');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleBtn.textContent = '🙈';
  } else {
    passwordInput.type = 'password';
    toggleBtn.textContent = '👁️';
  }
}

// Map and location functions
function initializeMap() {
  const mapContainer = document.getElementById('map');
  const addressDisplay = document.getElementById('current-address');

  if (currentUser && currentUser.address) {
    const address = currentUser.address;
    addressDisplay.textContent = address;

    const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
    mapContainer.innerHTML = `<iframe style="width:100%; height:100%; border:0;" src="${mapSrc}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  } else {
    addressDisplay.textContent = 'No address provided with your account.';
    mapContainer.innerHTML = '<div style="text-align:center; padding: 5rem 1rem; color: #6b7280;">Please provide an address in your profile to see the map.</div>';
  }
}

function useRegisteredAddress() {
  if (!currentUser) {
    showMessage('Please login first', 'error');
    return;
  }
  
  document.getElementById('delivery-state').value = currentUser.state;
  document.getElementById('delivery-area').value = currentUser.area;
  document.getElementById('delivery-street').value = currentUser.street;
  document.getElementById('delivery-address').value = currentUser.address;
  
  showMessage('Using registered address', 'success');
}

function searchLocation() {
  const searchTerm = document.getElementById('map-search').value.trim();
  
  if (!searchTerm) {
    showMessage('Please enter a search term', 'error');
    return;
  }
  
  showMessage(`Searching for: ${searchTerm}`, 'success');
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
  setupRegisterPasswordToggles();
  // --- Menu Navigation Logic ---
  const sideMenu = document.getElementById('side-menu');
  const menuHome = document.getElementById('menu-home');
  const menuProducts = document.getElementById('menu-products');
  const menuOrders = document.getElementById('menu-orders');
  const menuProfile = document.getElementById('menu-profile');
  const logoutBtn = document.getElementById('logout-btn');

  if (menuHome) {
    menuHome.addEventListener('click', function(e) {
      e.preventDefault();
      showProducts();
      sideMenu.classList.remove('show');
      sideMenu.classList.add('hidden');
    });
  }
  if (menuProducts) {
    menuProducts.addEventListener('click', function(e) {
      e.preventDefault();
      showProducts();
      sideMenu.classList.remove('show');
      sideMenu.classList.add('hidden');
    });
  }
  if (menuOrders) {
    menuOrders.addEventListener('click', function(e) {
      e.preventDefault();
      showOrders();
      sideMenu.classList.remove('show');
      sideMenu.classList.add('hidden');
    });
  }
  if (menuProfile) {
    menuProfile.addEventListener('click', function(e) {
      e.preventDefault();
      // If you have a profile section, show it here. Otherwise, show products.
      if (typeof showProfile === 'function') {
        showProfile();
      } else {
        showProducts();
      }
      sideMenu.classList.remove('show');
      sideMenu.classList.add('hidden');
    });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      logoutUser();
      sideMenu.classList.remove('show');
      sideMenu.classList.add('hidden');
    });
  }

  // --- Menu and Notification Bell Logic ---
  const menuToggle = document.getElementById('menu-toggle');
  const sideMenu2 = document.getElementById('side-menu');
  const closeMenu = document.getElementById('close-menu');
  if (menuToggle && sideMenu2 && closeMenu) {
    menuToggle.addEventListener('click', function() {
      sideMenu2.classList.add('show');
      sideMenu2.classList.remove('hidden');
    });
    closeMenu.addEventListener('click', function() {
      sideMenu2.classList.remove('show');
      sideMenu2.classList.add('hidden');
    });
    // Hide menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!sideMenu2.contains(e.target) && !menuToggle.contains(e.target)) {
        sideMenu2.classList.remove('show');
        sideMenu2.classList.add('hidden');
      }
    });
  }
  // Notification bell dropdown
  const notificationBell = document.getElementById('notification-bell');
  const notificationDropdown = document.getElementById('notification-dropdown');
  if (notificationBell && notificationDropdown) {
    notificationBell.addEventListener('click', function(e) {
      e.stopPropagation();
      if (notificationDropdown.style.display === 'block') {
        notificationDropdown.style.display = 'none';
      } else {
        notificationDropdown.style.display = 'block';
      }
    });
    document.addEventListener('click', function(e) {
      if (!notificationDropdown.contains(e.target) && !notificationBell.contains(e.target)) {
        notificationDropdown.style.display = 'none';
      }
    });
  }
  // Logout button
  const logoutBtn2 = document.getElementById('logout-btn');
  if (logoutBtn2 && sideMenu2) {
    logoutBtn2.addEventListener('click', function() {
      logoutUser();
      sideMenu2.classList.remove('show');
      sideMenu2.classList.add('hidden');
    });
  }
});

function initializeApp() {
  checkRegistrationFormElements();
  const savedUser = localStorage.getItem('userData');
  const savedToken = localStorage.getItem('authToken');
  const lastSection = localStorage.getItem('currentSection');
  if (savedUser && savedToken) {
    currentUser = JSON.parse(savedUser);
    authToken = savedToken;
    if (currentUser.isVerified) {
      updateUserInfo();
      Promise.all([
        loadProducts(),
        loadUserOrders(),
        loadNotifications(),
        startNotificationPolling()
      ]).catch(console.error);
      // Restore last section
      switch (lastSection) {
        case 'products': showProducts(); break;
        case 'orders': showOrders(); break;
        case 'buy': showBuy(); break;
        default: showProducts(); break;
      }
    } else {
      showMessage('Please verify your email before accessing the shop. Enter your code below.', 'warning');
      document.getElementById('verify-email').value = currentUser.email;
      showVerify();
    }
  } else {
    // Not logged in
    switch (lastSection) {
      case 'register': showRegister(); break;
      case 'login':
      default: showLogin(); break;
    }
  }
}

function setupEventListeners() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      loginUser();
    });
  }

  // Ensure register form uses submit event and prevents reload
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      registerUser();
    });
  }

  const registerBtn = document.getElementById('register-btn');
  if (registerBtn) {
    registerBtn.addEventListener('click', registerUser);
  }

  const buyOption = document.getElementById('buy-option');
  if (buyOption) {
    buyOption.addEventListener('change', showMap);
  }

  const quantityInput = document.getElementById('quantity');
  if (quantityInput) {
    quantityInput.addEventListener('change', updateTotal);
  }

  const productList = document.getElementById('product-list');
  if (productList) {
    productList.addEventListener('click', (event) => {
      if (event.target && event.target.classList.contains('buy-now-btn')) {
        const productId = event.target.dataset.productId;
        selectProduct(productId);
      }
    });
  }

  const toggleLoginPassword = document.getElementById('toggle-login-password');
  if(toggleLoginPassword) {
    toggleLoginPassword.addEventListener('click', togglePasswordVisibility);
  }

  document.getElementById('show-register-link')?.addEventListener('click', showRegister);
  document.getElementById('show-login-link')?.addEventListener('click', showLogin);
  document.getElementById('show-login-link-2')?.addEventListener('click', showLogin);
  
  // Remove previous event listener before adding a new one to prevent double calls
  const verifyBtn = document.getElementById('verify-btn');
  if (verifyBtn) {
    verifyBtn.replaceWith(verifyBtn.cloneNode(true)); // Remove all listeners
    document.getElementById('verify-btn').addEventListener('click', verifyEmail);
  }
  
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (currentUser) {
        logoutUser();
      } else {
        showMessage('You are not logged in.', 'error');
      }
    });
  }

  const ordersBtn = document.getElementById('orders-btn');
  if (ordersBtn) {
    ordersBtn.addEventListener('click', () => {
      if (currentUser) {
        showOrders();
      } else {
        showMessage('Please log in to view your orders.', 'error');
      }
    });
  }
  
  document.getElementById('back-to-products-btn')?.addEventListener('click', showProducts);
  
  document.getElementById('search-input')?.addEventListener('input', filterProducts);
  document.getElementById('category-filter')?.addEventListener('change', filterProducts);
  
  document.getElementById('use-current-location-btn')?.addEventListener('click', getCurrentLocation);
  document.getElementById('use-registered-address-btn')?.addEventListener('click', useRegisteredAddress);
  document.getElementById('search-location-btn')?.addEventListener('click', searchLocation);
  
  document.getElementById('place-order-btn')?.addEventListener('click', placeOrder);

  const bell = document.getElementById('notification-bell');
  const dropdown = document.getElementById('notification-dropdown');
  if (bell && dropdown) {
    bell.onclick = () => {
      if (dropdown.classList.contains('hidden')) {
        dropdown.classList.remove('hidden');
        dropdown.classList.add('show');
      } else {
        dropdown.classList.remove('show');
        dropdown.classList.add('hidden');
      }
    };
    document.addEventListener('click', (e) => {
      if (!bell.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
        dropdown.classList.add('hidden');
      }
    });
  }

  // Show user notification history when bell is clicked
  const userNotifBox = document.getElementById('user-notification-history');
  if (bell && userNotifBox) {
    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      if (userNotifBox.style.display === 'block') {
        userNotifBox.style.display = 'none';
      } else {
        showUserNotificationHistory();
        userNotifBox.style.display = 'block';
      }
    });
    // Hide when clicking outside
    document.addEventListener('click', (e) => {
      if (!userNotifBox.contains(e.target) && !bell.contains(e.target)) {
        userNotifBox.style.display = 'none';
      }
    });
  }

  // --- Menu Dropdown Logic ---
  const menuToggle = document.getElementById('menu-toggle');
  const menuDropdown = document.getElementById('menu-dropdown');
  // const bell = document.getElementById('notification-bell'); // Duplicate, remove
  // const userNotifBox = document.getElementById('user-notification-history'); // Duplicate, remove

  // Toggle menu dropdown
  if (menuToggle && menuDropdown) {
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      // Update welcome text
      const welcomeDiv = document.getElementById('welcome');
      if (welcomeDiv && window.currentUser) {
        welcomeDiv.textContent = `Welcome, ${window.currentUser.name || window.currentUser.email || ''}`;
      }
      // Hide notification history if open
      if (userNotifBox) userNotifBox.style.display = 'none';
      // Toggle menu
      if (menuDropdown.style.display === 'block') {
        menuDropdown.style.display = 'none';
      } else {
        menuDropdown.style.display = 'block';
      }
    });
    document.addEventListener('click', function(e) {
      if (!menuDropdown.contains(e.target) && !menuToggle.contains(e.target)) {
        menuDropdown.style.display = 'none';
        if (userNotifBox) userNotifBox.style.display = 'none';
      }
    });
  }

  // Notification bell in menu toggles notification history
  if (bell && userNotifBox) {
    bell.addEventListener('click', function(e) {
      e.stopPropagation();
      if (userNotifBox.style.display === 'block') {
        userNotifBox.style.display = 'none';
      } else {
        showUserNotificationHistory();
        userNotifBox.style.display = 'block';
      }
    });
    // Hide notification history when clicking outside
    document.addEventListener('click', function(e) {
      if (!userNotifBox.contains(e.target) && !bell.contains(e.target)) {
        userNotifBox.style.display = 'none';
      }
    });
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .status-pending { color: #ffc107; font-weight: bold; }
  .status-confirmed { color: #28a745; font-weight: bold; }
  .status-rejected { color: #dc3545; font-weight: bold; }
  .status-delivered { color: #17a2b8; font-weight: bold; }
  .status-processing { color: #fd7e14; font-weight: bold; }
  
  .spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

function checkRegistrationFormElements() {
  const requiredIds = ['name', 'email', 'password', 'phone', 'address', 'register-btn'];
  let allPresent = true;
  requiredIds.forEach(id => {
    if (!document.getElementById(id)) {
      console.warn(`Warning: Registration form element with id '${id}' is missing from the HTML.`);
      allPresent = false;
    }
  });
  if (allPresent) {
    console.log('All registration form elements are present.');
  }
}

function updateHeaderActions() {
  const logoutBtn = document.getElementById('logout-btn');
  const ordersBtn = document.getElementById('orders-btn');
  if (!logoutBtn || !ordersBtn) return;
  if (currentUser) {
    logoutBtn.disabled = false;
    ordersBtn.disabled = false;
    logoutBtn.classList.remove('disabled');
    ordersBtn.classList.remove('disabled');
  } else {
    logoutBtn.disabled = true;
    ordersBtn.disabled = true;
    logoutBtn.classList.add('disabled');
    ordersBtn.classList.add('disabled');
  }
}

function handleApiResponse(res, resourceName = 'resource') {
  if (!res.ok) {
    if (res.status === 404) throw new Error(`${resourceName} API endpoint not found (404)`);
    throw new Error(`Failed to fetch ${resourceName} (status: ${res.status})`);
  }
  return res.json();
}

function updateNotifications() {
  // Orders sent to admin (all user's orders)
  // Orders with admin response (adminMessage present)
  notifications = orders.map(order => {
    return {
      id: order._id,
      product: order.productName || order.productId,
      status: order.status,
      date: order.createdAt,
      adminMessage: order.adminMessage || '',
    };
  });
  renderNotificationDropdown();
  updateNotificationBellBadge();
}

function renderNotificationDropdown() {
  const dropdown = document.getElementById('notification-dropdown');
  if (!dropdown) return;
  if (notifications.length === 0) {
    dropdown.innerHTML = '<div class="notification-item">No notifications yet.</div>';
    return;
  }
  dropdown.innerHTML = notifications.map(n => `
    <div class="notification-item">
      <span class="order-id">Order: ${n.id}</span><br/>
      <span>Status: ${n.status}</span><br/>
      ${n.adminMessage ? `<span class="admin">Admin: ${n.adminMessage}</span>` : `<span class="user">Order sent to admin</span>`}
      <br/><span style="font-size:0.85em;color:#888;">${new Date(n.date).toLocaleString()}</span>
    </div>
  `).join('');
}

function updateNotificationBellBadge() {
  const bell = document.getElementById('notification-bell');
  if (!bell) return;
  // Show active if any order has adminMessage
  const hasAdminMsg = notifications.some(n => n.adminMessage);
  if (hasAdminMsg) bell.classList.add('active');
  else bell.classList.remove('active');
}

// Centralized API error handling for token expiry
function handleTokenExpiry(error) {
  if (error && error.message && error.message.includes('Token expired')) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    alert('Your session has expired. Please log in again.');
    window.location.reload();
    return true;
  }
  return false;
}

// --- Order Summary Compact Logic ---
function updateOrderSummaryCompact() {
  const address = currentUser && currentUser.address ? currentUser.address : '';
  const payment = document.getElementById('payment-method')?.value || '';
  const total = document.getElementById('total-price')?.textContent || '';
  if (document.getElementById('summary-address')) document.getElementById('summary-address').textContent = address;
  if (document.getElementById('summary-payment')) document.getElementById('summary-payment').textContent = payment ? payment.charAt(0).toUpperCase() + payment.slice(1) : '';
  if (document.getElementById('total-price')) document.getElementById('total-price').textContent = total;
}

// Update summary on relevant changes
const paymentMethodSelect = document.getElementById('payment-method');
if (paymentMethodSelect) {
  paymentMethodSelect.addEventListener('change', updateOrderSummaryCompact);
}
const addressInput = document.getElementById('address');
if (addressInput) {
  addressInput.addEventListener('input', updateOrderSummaryCompact);
}
const quantityInput = document.getElementById('quantity');
if (quantityInput) {
  quantityInput.addEventListener('input', updateOrderSummaryCompact);
}
const buyOptionSelect = document.getElementById('buy-option');
if (buyOptionSelect) {
  buyOptionSelect.addEventListener('change', updateOrderSummaryCompact);
}

// Toggle map visibility
const toggleMapBtn = document.getElementById('toggle-map-btn');
const mapContainer = document.getElementById('map-container');
if (toggleMapBtn && mapContainer) {
  toggleMapBtn.addEventListener('click', () => {
    if (mapContainer.classList.contains('hidden')) {
      mapContainer.classList.remove('hidden');
      toggleMapBtn.textContent = 'Hide Map';
    } else {
      mapContainer.classList.add('hidden');
      toggleMapBtn.textContent = 'Show Map';
    }
  });
}

// Call once on load
updateOrderSummaryCompact();

// --- Dark Mode Toggle ---
const darkToggle = document.getElementById('dark-mode-toggle');
function setDarkMode(enabled) {
  if (enabled) {
    document.body.classList.add('dark-mode');
    if (darkToggle) darkToggle.textContent = '☀️';
    localStorage.setItem('darkMode', '1');
  } else {
    document.body.classList.remove('dark-mode');
    if (darkToggle) darkToggle.textContent = '🌙';
    localStorage.setItem('darkMode', '0');
  }
}
if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    setDarkMode(!document.body.classList.contains('dark-mode'));
  });
}
// On load, apply saved preference
if (localStorage.getItem('darkMode') === '1') {
  setDarkMode(true);
} else {
  setDarkMode(false);
}

// --- Customer Care Chat Modal Logic ---
const careBtn = document.getElementById('customer-care-btn');
const careModal = document.getElementById('customer-care-modal');
const careClose = document.getElementById('close-customer-care');
const careForm = document.getElementById('customer-care-form');
const careMsgForm = document.getElementById('customer-care-message-form');
const careName = document.getElementById('customer-care-name');
const careEmail = document.getElementById('customer-care-email');
const careMsg = document.getElementById('customer-care-message');
const careHistory = document.getElementById('customer-care-history');
let carePollInterval = null;

function renderCareHistory(messages) {
  careHistory.innerHTML = messages.map(msg => `
    <div style="margin-bottom:0.7rem;text-align:${msg.from==='admin'?'left':'right'};">
      <div style="display:inline-block;padding:0.6em 1em;border-radius:16px;background:${msg.from==='admin'?'#e0e7ef':'#2563eb'};color:${msg.from==='admin'?'#222':'#fff'};margin-bottom:2px;">${msg.text}</div>
      <div style="font-size:0.8em;color:#888;margin-top:2px;">${msg.from==='admin'?'Support':(msg.name||'You')} ${msg.time||''}</div>
    </div>
  `).join('');
  careHistory.scrollTop = careHistory.scrollHeight;
}

async function fetchCareHistory() {
  if (!careEmail.value) return;
  try {
    const res = await fetch(`/api/support/messages?email=${encodeURIComponent(careEmail.value)}`);
    const data = await res.json();
    if (Array.isArray(data.messages)) {
      renderCareHistory(data.messages);
    } else {
      careHistory.innerHTML = '<div style="color:#888;">No messages yet.</div>';
    }
  } catch {
    careHistory.innerHTML = '<div style="color:#dc2626;">Failed to load messages.</div>';
  }
}

if (careBtn && careModal) {
  careBtn.onclick = () => {
    careModal.style.display = 'flex';
    careModal.classList.remove('hidden');
    fetchCareHistory();
    if (carePollInterval) clearInterval(carePollInterval);
    carePollInterval = setInterval(fetchCareHistory, 10000);
  };
}
if (careClose && careModal) {
  careClose.onclick = () => {
    careModal.style.display = 'none';
    careModal.classList.add('hidden');
    if (carePollInterval) clearInterval(carePollInterval);
  };
}
if (careForm) {
  careForm.onsubmit = e => {
    e.preventDefault();
    fetchCareHistory();
  };
}
if (careMsgForm) {
  careMsgForm.onsubmit = async function(e) {
    e.preventDefault();
    if (!careName.value.trim() || !careEmail.value.trim() || !careMsg.value.trim()) return;
    const msg = {
      name: careName.value.trim(),
      email: careEmail.value.trim(),
      text: careMsg.value.trim()
    };
    try {
      const res = await fetch('/api/support/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
      if (res.ok) {
        careMsg.value = '';
        fetchCareHistory();
      }
    } catch {}
  };
}

// --- Nigerian States and LGAs ---
const statesAndLGAs = {
  'Abia': ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'],
  'Adamawa': ['Demsa', 'Fufore', 'Ganye', 'Girei', 'Gombi', 'Guyuk', 'Hong', 'Jada', 'Lamurde', 'Madagali', 'Maiha', 'Mayo Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'],
  'Akwa Ibom': ['Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat Enin', 'Nsit Atai', 'Nsit Ibom', 'Nsit Ubium', 'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Udung Uko', 'Ukanafun', 'Uruan', 'Urue-Offong/Oruko', 'Uyo'],
  'Anambra': ['Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi'],
  'Bauchi': ['Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Gamawa', 'Ganjuwa', 'Giade', 'Itas/Gadau', 'Jama are', 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki'],
  'Bayelsa': ['Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa'],
  'Benue': ['Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu', 'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'],
  'Borno': ['Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala/Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Mafa', 'Magumeri', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani'],
  'Cross River': ['Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakurr', 'Yala'],
  'Delta': ['Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South', 'Warri South West'],
  'Ebonyi': ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha'],
  'Edo': ['Akoko-Edo', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East', 'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba-Okha', 'Oredo', 'Orhionmwon', 'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West', 'Uhunmwonde'],
  'Ekiti': ['Ado Ekiti', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West', 'Emure', 'Gbonyin', 'Ido Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun/Ifelodun', 'Ise/Orun', 'Moba', 'Oye'],
  'Enugu': ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo Etiti', 'Igbo Eze North', 'Igbo Eze South', 'Isi Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Udi', 'Uzo Uwani'],
  'FCT': ['Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Municipal Area Council'],
  'Gombe': ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba'],
  'Imo': ['Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North', 'Ideato South', 'Ihitte/Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema', 'Okigwe', 'Onuimo', 'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West'],
  'Jigawa': ['Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kaugama', 'Kazaure', 'Kiri Kasama', 'Kiyawa', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi'],
  'Kaduna': ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema a', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'],
  'Kano': ['Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'],
  'Katsina': ['Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandume', 'Danja', 'Dan Musa', 'Daura', 'Dutsi', 'Dutsin Ma', 'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', 'Mai Adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango'],
  'Kebbi': ['Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko/Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu/Danko', 'Yauri', 'Zuru'],
  'Kogi': ['Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela Odolu', 'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja', 'Mopa Muro', 'Ofu', 'Ogori/Magongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'],
  'Kwara': ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero', 'Oyun', 'Pategi'],
  'Lagos': ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'],
  'Nasarawa': ['Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa Egon', 'Obi', 'Toto', 'Wamba'],
  'Niger': ['Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Moya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi'],
  'Ogun': ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North', 'Egbado South', 'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode', 'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Shagamu'],
  'Ondo': ['Akoko North-East', 'Akoko North-West', 'Akoko South-West', 'Akoko South-East', 'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 'Ilaje', 'Ile Oluji/Okeigbo', 'Irele', 'Odigbo', 'Okitipupa', 'Ondo East', 'Ondo West', 'Ose', 'Owo'],
  'Osun': ['Aiyedade', 'Aiyedire', 'Atakumosa East', 'Atakumosa West', 'Boluwaduro', 'Boripe', 'Ede North', 'Ede South', 'Egbedore', 'Ejigbo', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Ifedayo', 'Ifelodun', 'Ila', 'Ilesa East', 'Ilesa West', 'Irepodun', 'Irewole', 'Isokan', 'Iwo', 'Obokun', 'Odo Otin', 'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo'],
  'Oyo': ['Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho North', 'Ogbomosho South', 'Ogo Oluwa', 'Olorunsogo', 'Oluyole', 'Ona Ara', 'Orelope', 'Ori Ire', 'Oyo', 'Oyo East', 'Saki East', 'Saki West', 'Surulere'],
  'Plateau': ['Barkin Ladi', 'Bassa', 'Bokkos', 'Jos East', 'Jos North', 'Jos South', 'Kanam', 'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', 'Qua an Pan', 'Riyom', 'Shendam', 'Wase'],
  'Rivers': ['Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku Toru', 'Andoni', 'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emohua', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio/Akpor', 'Ogba/Egbema/Ndoni', 'Ogu/Bolo', 'Okrika', 'Omuma', 'Opobo/Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai'],
  'Sokoto': ['Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo'],
  'Taraba': ['Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karim Lamido', 'Kumi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing'],
  'Yobe': ['Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko', 'Karasuwa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari'],
  'Zamfara': ['Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi', 'Gusau', 'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara', 'Chafe', 'Zurmi']
};

function populateStates() {
  const stateSelect = document.getElementById('state');
  if (!stateSelect) return;
  stateSelect.innerHTML = '<option value="">Select State</option>' +
    Object.keys(statesAndLGAs).map(state => `<option value="${state}">${state}</option>`).join('');
}

function populateLGAs() {
  const stateSelect = document.getElementById('state');
  const lgaSelect = document.getElementById('lga');
  if (!stateSelect || !lgaSelect) return;
  const selectedState = stateSelect.value;
  lgaSelect.innerHTML = '<option value="">Select LGA</option>';
  if (selectedState && statesAndLGAs[selectedState]) {
    lgaSelect.innerHTML += statesAndLGAs[selectedState].map(lga => `<option value="${lga}">${lga}</option>`).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  populateStates();
  document.getElementById('state')?.addEventListener('change', populateLGAs);
});

// --- Password Strength and Match Feedback ---
function checkPasswordStrength(password) {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  let strength = 0;
  if (password.length >= minLength) strength++;
  if (hasUpper) strength++;
  if (hasLower) strength++;
  if (hasNumber) strength++;
  if (hasSymbol) strength++;
  if (password.length === 0) return '';
  if (strength === 5) return 'Strong';
  if (strength >= 3) return 'Medium';
  return 'Weak';
}

document.getElementById('password')?.addEventListener('input', function(e) {
  const password = e.target.value;
  const strength = checkPasswordStrength(password);
  const strengthDiv = document.getElementById('password-strength');
  if (strengthDiv) {
    strengthDiv.textContent = strength ? `Password strength: ${strength}` : '';
    strengthDiv.style.color = strength === 'Strong' ? 'green' : (strength === 'Medium' ? 'orange' : 'red');
  }
});

document.getElementById('confirm-password')?.addEventListener('input', function(e) {
  const password = document.getElementById('password')?.value;
  const confirm = e.target.value;
  const matchDiv = document.getElementById('password-match');
  if (matchDiv) {
    if (!confirm) {
      matchDiv.textContent = '';
    } else if (password === confirm) {
      matchDiv.textContent = 'Passwords match';
      matchDiv.style.color = 'green';
    } else {
      matchDiv.textContent = 'Passwords do not match';
      matchDiv.style.color = 'red';
    }
  }
});

// Add a function to show a persistent message above the login form after verification
function setVerifiedLoginMessage(msg) {
  let msgDiv = document.getElementById('verified-login-message');
  if (!msgDiv) {
    msgDiv = document.createElement('div');
    msgDiv.id = 'verified-login-message';
    msgDiv.style.cssText = 'background:#e6ffed;color:#256029;padding:10px 16px;margin-bottom:10px;border-radius:4px;font-weight:bold;text-align:center;';
    const loginSection = document.getElementById('login-section');
    if (loginSection) {
      loginSection.insertBefore(msgDiv, loginSection.firstChild);
    }
  }
  msgDiv.textContent = msg;
  msgDiv.style.display = 'block';
}
// Hide the message when login is successful or when showing other forms
function clearVerifiedLoginMessage() {
  const msgDiv = document.getElementById('verified-login-message');
  if (msgDiv) msgDiv.style.display = 'none';
}
// Update showLogin to clear the message unless coming from verification
function showLogin() {
  hideAllSections();
  const loginSection = document.getElementById('login-section');
  if (loginSection) loginSection.classList.remove('hidden');
  const userInfo = document.getElementById('user-info');
  if (userInfo) userInfo.classList.add('hidden');
  if (!window.justVerified) clearVerifiedLoginMessage();
  window.justVerified = false;
  localStorage.setItem('currentSection', 'login');
}

// Registration password show/hide toggle
function setupRegisterPasswordToggles() {
  // Remove previous listeners if any
  const regToggle = document.getElementById('toggle-register-password');
  const regPassword = document.getElementById('password');
  if (regToggle && regPassword) {
    regToggle.onclick = null;
    regToggle.addEventListener('click', function () {
      if (regPassword.type === 'password') {
        regPassword.type = 'text';
        regToggle.textContent = '🙈';
      } else {
        regPassword.type = 'password';
        regToggle.textContent = '👁️';
      }
    });
  }
  const confirmToggle = document.getElementById('toggle-confirm-password');
  const confirmPassword = document.getElementById('confirm-password');
  if (confirmToggle && confirmPassword) {
    confirmToggle.onclick = null;
    confirmToggle.addEventListener('click', function () {
      if (confirmPassword.type === 'password') {
        confirmPassword.type = 'text';
        confirmToggle.textContent = '🙈';
      } else {
        confirmPassword.type = 'password';
        confirmToggle.textContent = '👁️';
      }
    });
  }
}
// Call setupRegisterPasswordToggles every time the register form is shown
function showRegister() {
  hideAllSections();
  const regSection = document.getElementById('register-section');
  if (regSection) regSection.classList.remove('hidden');
  const userInfo = document.getElementById('user-info');
  if (userInfo) userInfo.classList.add('hidden');
  setupRegisterPasswordToggles();
  localStorage.setItem('currentSection', 'register');
}

function showVerify() {
  hideAllSections();
  const verifySection = document.getElementById('verify-section');
  if (verifySection) verifySection.classList.remove('hidden');
  const userInfo = document.getElementById('user-info');
  if (userInfo) userInfo.classList.add('hidden');
  localStorage.setItem('currentSection', 'verify');
}

function showProducts() {
  hideAllSections();
  document.getElementById('products-section').classList.remove('hidden');
  displayProducts();
  localStorage.setItem('currentSection', 'products');
}

async function showOrders() {
  if (!currentUser) return;
  hideAllSections();
  document.getElementById('orders-section').classList.remove('hidden');
  displayOrders();
  localStorage.setItem('currentSection', 'orders');
}

function showBuy() {
  hideAllSections();
  document.getElementById('buy-section').classList.remove('hidden');
  localStorage.setItem('currentSection', 'buy');
}
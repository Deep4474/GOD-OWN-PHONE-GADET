// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.querySelector('.menu-icon');
  const menu = document.querySelector('.menu');
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function() {
      menu.classList.toggle('open');
    });
  }
});
// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('mainNav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function() {
      nav.classList.toggle('open');
    });
    // Optional: close menu when a link is clicked
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });
  }
});
  // Close order list modal when clicking outside modal content
  document.getElementById('orderListModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
      this.style.display = 'none';
    }
  });
  // Edit Pic button always opens file picker
  document.getElementById('editPicBtn')?.addEventListener('click', () => {
    userPicInput.click();
  });
  // Settings modal logic
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsModal = document.getElementById('closeSettingsModal');
  const darkModeToggleUser = document.getElementById('darkModeToggleUser');
  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    settingsModal.style.display = 'block';
    darkModeToggleUser.checked = document.body.classList.contains('dark-mode');
  });
  closeSettingsModal.onclick = () => settingsModal.style.display = 'none';
  darkModeToggleUser.onchange = function() {
    document.body.classList.toggle('dark-mode', darkModeToggleUser.checked);
    localStorage.setItem('userDarkMode', darkModeToggleUser.checked);
  };
  // Load dark mode preference
  if (localStorage.getItem('userDarkMode') === 'true') {
    document.body.classList.add('dark-mode');
    if (darkModeToggleUser) darkModeToggleUser.checked = true;
  }
  // Make user dropdown menu buttons clickable
  document.getElementById('editPicBtn')?.addEventListener('click', () => {
    document.getElementById('userIcon').click();
  });
  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    settingsModal.style.display = 'block';
    darkModeToggleUser.checked = document.body.classList.contains('dark-mode');
  });
  // Show user's orders when Order List is clicked
  document.getElementById('orderListBtn')?.addEventListener('click', async () => {
    // EmailJS send order details function
    window.sendOrderEmail = function(order, status) {
      emailjs.send('service_xuzka4m', 'template_zkv6prt', {
        user_email: order.email,
        to_email: order.email,
        name: order.user_name,
        product: order.product_id,
        quantity: order.quantity,
        total: '₦' + Number(order.order_total).toLocaleString(undefined, {minimumFractionDigits:2}),
        status: status,
        address: order.address,
        phone: order.phone,
        pick_option: order.pick_option,
        date: new Date(order.created_at).toLocaleString()
      }).then(function(response) {
        console.log('Order email sent!', response);
      }, function(error) {
        console.error('Failed to send order email:', error);
      });
    };
    const orderListModal = document.getElementById('orderListModal');
    const closeOrderListModal = document.getElementById('closeOrderListModal');
    const userOrdersTable = document.getElementById('userOrdersTable');
    const userOrdersMsg = document.getElementById('userOrdersMsg');
    orderListModal.style.display = 'block';
    userOrdersMsg.textContent = '';
    // Get user email from localStorage
    const userEmail = localStorage.getItem('lamar_email');
    if (!userEmail) {
      userOrdersMsg.textContent = 'No user email found. Please log in.';
      userOrdersTable.querySelector('tbody').innerHTML = '';
      return;
    }
    // Fetch orders from Supabase for this user
      const { data: orders, error } = await supabase
        .from('order_sender')
        .select('product_id,quantity,order_total,status,created_at,email,user_name,address,phone,pick_option,id')
        .eq('email', userEmail)
        .order('created_at', { ascending: false });
    if (error) {
      userOrdersMsg.textContent = 'Error fetching orders.';
      userOrdersTable.querySelector('tbody').innerHTML = '';
      return;
    }
    if (!orders || orders.length === 0) {
      userOrdersMsg.textContent = 'No orders found.';
      userOrdersTable.querySelector('tbody').innerHTML = '';
      return;
    }
    // Fetch product names for each order
    const productIds = [...new Set(orders.map(o => o.product_id))];
    const { data: productsData } = await supabase
      .from('products')
      .select('id,name')
      .in('id', productIds);
    const productMap = {};
    (productsData || []).forEach(p => productMap[p.id] = p.name);
    // Render orders
    userOrdersTable.querySelector('tbody').innerHTML = orders.map((order) => `
      <tr>
        <td>${productMap[order.product_id] || order.product_id}</td>
        <td>${order.quantity}</td>
        <td>₦${Number(order.order_total).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
        <td>${order.status}</td>
        <td>${new Date(order.created_at).toLocaleString()}</td>
      </tr>
    `).join('');
    closeOrderListModal.onclick = () => orderListModal.style.display = 'none';
  });
  // User profile image upload and persistence
  const userIcon = document.getElementById('userIcon');
  const userPicInput = document.getElementById('userPicInput');
  // Load saved image from localStorage
  const savedUserPic = localStorage.getItem('userProfilePic');
  if (savedUserPic) userIcon.src = savedUserPic;
  userIcon.onclick = () => {
    if (!isLoggedIn()) {
      showEmailChoiceModal();
    } else {
      userPicInput.click();
    }
  };
  userPicInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        userIcon.src = evt.target.result;
        localStorage.setItem('userProfilePic', evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
// Removed MailSlurp email sending. Use backend /send-email endpoint instead.
// Show email choice modal on load if not logged in
function isLoggedIn() {
  // You can check for a valid email or user_name in localStorage
  return !!localStorage.getItem('lamar_email');
}

function showEmailChoiceModal() {
  const modal = document.getElementById('emailChoiceModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'block';
  }
}

function hideEmailChoiceModal() {
  const modal = document.getElementById('emailChoiceModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

function supabaseGoogleSignIn() {
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://jlwxkykznyjmstpjcgks.supabase.co/auth/v1/callback',
      queryParams: { prompt: 'select_account' }
    }
  });
}
// Live advert/featured product logic
let featuredIndex = 0;
function showNextFeaturedProduct() {
  const liveFeatured = document.getElementById('liveFeatured');
  if (!products || products.length === 0 || !liveFeatured) {
    if (liveFeatured) liveFeatured.innerHTML = '<div style="padding:2em;text-align:center;">No products available</div>';
    return;
  }
  const product = products[featuredIndex];
  liveFeatured.innerHTML = `
    <div class="featured-info">
      <h1>${product.name}</h1>
      <p>${product.description || ''}</p>
      <p class="price">Price: <span>₦${Number(product.price).toLocaleString(undefined, {minimumFractionDigits:2})}</span></p>
      <a href="#" class="shop-btn" onclick="openBuyModal('${product.id}')">Shop Now</a>
    </div>
    <div class="featured-img">
      <img src="${product.image_url || 'https://placehold.co/220x220'}" alt="${product.name}">
    </div>
  `;
  featuredIndex = (featuredIndex + 1) % products.length;
}


// Supabase credentials
const supabaseUrl = 'https://jlwxkykznyjmstpjcgks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ';

// Import Supabase client from CDN
// EmailJS send function
function sendWelcomeEmail(name, email) {
  if (typeof email === 'string') {
    // Remove invisible characters and trim
    email = email.replace(/[\u200B-\u200D\uFEFF\n\r\t]/g, '').trim();
  }
  console.log('Attempting to send welcome email to:', email, 'Type:', typeof email, 'Length:', email.length);
  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
    console.error('No valid email provided for welcome email:', email);
    return;
  }
  function actuallySend() {
    emailjs.init('7m5xwMHVRwEO-ctv9');
    emailjs.send('service_xuzka4m', 'template_zkv6prt', {
      name: name,
      user_email: email, // For templates expecting user_email
      to_email: email    // For templates expecting to_email
    })
    .then(function(response) {
      console.log('Welcome email sent!', response);
    }, function(error) {
      console.error('Failed to send welcome email:', error);
      alert('Failed to send welcome email. Please check your EmailJS setup.');
    });
  }
  if (!window.emailjs) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';
    script.onload = actuallySend;
    document.head.appendChild(script);
    return;
  }
  actuallySend();
}
// (for browser usage, this works if you have <script type="module"> or use a bundler)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(supabaseUrl, supabaseKey);

let products = [];

// Fetch products from Supabase
async function fetchProducts() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data;
}

// Render products to #productList
function renderProducts() {
  const productList = document.getElementById('productList');
  if (!productList) return;
  if (!products || products.length === 0) {
    productList.innerHTML = '<div style="padding:2em;text-align:center;">No products available</div>';
    return;
  }
  productList.innerHTML = products.map(product => `
    <div class="product">
      <img src="${product.image_url || 'https://placehold.co/180x180'}" alt="${product.name}" class="product-img">
      <h3>${product.name}</h3>
      <p>${product.description || ''}</p>
      <p class="price">₦${Number(product.price).toLocaleString(undefined, {minimumFractionDigits:2})}</p>
      <button onclick="openBuyModal('${product.id}')" class="buy-btn">Buy Now</button>
    </div>
  `).join('');
}


// Modal logic
function openBuyModal(productId) {
  if (!isLoggedIn()) {
    showEmailChoiceModal();
    // Hide the buy modal if not logged in
    const buyModal = document.getElementById('buyModal');
    if (buyModal) buyModal.style.display = 'none';
    return;
  }
  const product = products.find(p => String(p.id) === String(productId));
  if (!product) return;
  const buyModal = document.getElementById('buyModal');
  const buyProductName = document.getElementById('buyProductName');
  const buyPrice = document.getElementById('buyPrice');
  if (buyProductName) buyProductName.textContent = product.name;
  if (buyPrice) buyPrice.textContent = '₦' + Number(product.price).toLocaleString(undefined, {minimumFractionDigits:2});
  // Auto-fill name and email input with registered info
  const nameInput = document.getElementById('buyUserNameInput');
  const emailInput = document.getElementById('buyEmail');
  const regName = localStorage.getItem('lamar_name');
  const regEmail = localStorage.getItem('lamar_email');
  if (nameInput && regName) nameInput.value = regName;
  if (emailInput && regEmail) emailInput.value = regEmail;
  // Show total amount to pay
  const quantityInput = document.getElementById('buyQuantity');
  const totalAmountElem = document.getElementById('buyTotalAmount');
  function updateTotalAmount() {
    const qty = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    const total = qty * Number(product.price);
    if (totalAmountElem) totalAmountElem.textContent = 'Total: ₦' + total.toLocaleString(undefined, {minimumFractionDigits:2});
  }
  if (quantityInput) {
    quantityInput.addEventListener('input', updateTotalAmount);
    updateTotalAmount();
  }
  buyModal.style.display = 'block';
  buyModal.setAttribute('data-product-id', product.id);
}
// Expose to global for inline onclick
window.openBuyModal = openBuyModal;

function closeBuyModal() {
  const buyModal = document.getElementById('buyModal');
  buyModal.style.display = 'none';
}

// Handle buy form submit
async function handleBuySubmit(e) {
  if (!isLoggedIn()) {
    showEmailChoiceModal();
    e.preventDefault();
    // Hide the buy modal if not logged in
    const buyModal = document.getElementById('buyModal');
    if (buyModal) buyModal.style.display = 'none';
    return false;
  }
  e.preventDefault();
  const buyModal = document.getElementById('buyModal');
  const productId = buyModal.getAttribute('data-product-id');
  const product = products.find(p => String(p.id) === String(productId));
  const nameInput = document.getElementById('buyUserNameInput');
  const emailInput = document.getElementById('buyEmail');
  const phoneInput = document.getElementById('buyPhone');
  const addressInput = document.getElementById('buyAddress');
  const quantityInput = document.getElementById('buyQuantity');
  const deliveryOptionInput = document.getElementById('buyDeliveryOption');
  const userIdInput = document.getElementById('buyUserId');
  const buyMsg = document.getElementById('buyMsg');
  if (!nameInput || !emailInput || !phoneInput || !addressInput || !quantityInput || !deliveryOptionInput || !userIdInput) {
    if (buyMsg) buyMsg.textContent = 'Form error: missing input fields.';
    return;
  }
  const name = nameInput.value;
  const email = emailInput.value;
  const phone = phoneInput.value;
  const address = addressInput.value;
  const quantity = parseInt(quantityInput.value);
  const delivery_option = deliveryOptionInput.value;
  const user_id = userIdInput.value;
  if (!name || !email || !phone || !address || !quantity || !delivery_option) {
    if (buyMsg) {
      buyMsg.style.color = 'red';
      buyMsg.textContent = 'Please fill all fields.';
    }
    return;
  }
  // Insert order into Supabase
  // Only include user_id if it is a valid UUID (36 chars, 4 dashes)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const order_total = Number(product.price) * quantity;
  const orderData = {
    product_id: product.id,
    user_name: name,
    email: email,
    phone: phone,
    address: address,
    quantity: quantity,
    order_total: order_total,
    pick_option: delivery_option,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  if (user_id && uuidRegex.test(user_id)) {
    orderData.user_id = user_id;
  }
  console.log('Order data to send:', orderData);
  try {
    const { data, error } = await supabase.from('orders').insert([orderData]);
    if (error) {
      console.error('Supabase error:', error);
      if (buyMsg) {
        buyMsg.style.color = 'red';
        buyMsg.textContent = 'Failed to place order: ' + (error.message || error.details || 'Unknown error');
      }
      return;
    }
    if (buyMsg) {
      buyMsg.style.color = 'green';
      buyMsg.textContent = `Order placed for ${quantity} x ${product.name}!`;
    }
    setTimeout(closeBuyModal, 1200);
  } catch (err) {
    if (buyMsg) {
      buyMsg.style.color = 'red';
      buyMsg.textContent = 'Error placing order.';
    }
    console.error('JS error:', err);
  }
}

// Simple login/logout using localStorage
function login() {
  // Only allow Google sign-in for unregistered users
  if (!isLoggedIn()) {
    showEmailChoiceModal();
    return;
  }
  // If already logged in, do nothing or show user info
}

function logout() {
  localStorage.removeItem('lamar_name');
  updateUserUI();
}

function updateUserUI() {
  const userNameSpan = document.getElementById('userName');
  const userIcon = document.getElementById('userIcon');
  const userDropdown = document.getElementById('userDropdown');
  const name = localStorage.getItem('lamar_name');
  if (userNameSpan) {
    if (name) {
      userNameSpan.textContent = name;
      userNameSpan.style.display = 'inline-block';
      userNameSpan.style.fontWeight = 'bold';
      userNameSpan.style.color = '#222';
      userNameSpan.style.marginRight = '8px';
    } else {
      userNameSpan.textContent = '';
      userNameSpan.style.display = 'none';
    }
  }
  if (userIcon) userIcon.style.display = 'inline-block';
  if (userDropdown) userDropdown.classList.add('hidden');
}

// Setup event listeners on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async function() {
  // Check for Supabase user session and set Gmail name/email if available
  const { data: { user: supaUser } } = await supabase.auth.getUser();
  if (supaUser && supaUser.user_metadata && supaUser.user_metadata.full_name) {
    localStorage.setItem('lamar_name', supaUser.user_metadata.full_name);
    if (supaUser.email) localStorage.setItem('lamar_email', supaUser.email);
    updateUserUI();
  // sendWelcomeEmail(supaUser.user_metadata.full_name, supaUser.email); // Removed EmailJS call
  }
  // Check for Supabase user session and set Gmail name if available
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.user_metadata && user.user_metadata.full_name) {
    localStorage.setItem('lamar_name', user.user_metadata.full_name);
    updateUserUI();
  }
  // Always show user icon and set up click logic
  updateUserUI(); // Ensure username is shown on page load
  const userIcon = document.getElementById('userIcon');
  if (userIcon) {
    userIcon.style.display = 'inline';
    userIcon.onclick = function(e) {
      const name = localStorage.getItem('lamar_name');
      const userDropdown = document.getElementById('userDropdown');
      if (name) {
        // Toggle dropdown
        if (userDropdown) {
          userDropdown.classList.toggle('hidden');
        }
      } else {
        // Prompt for login directly
        login();
        // After login, check if name is set
        // No alert or prompt, Gmail only
      }
      e.stopPropagation();
    };
  }
  // Hide dropdown when clicking outside
  document.addEventListener('click', function(e) {
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown && !userDropdown.classList.contains('hidden')) {
      if (!userDropdown.contains(e.target) && e.target.id !== 'userIcon') {
        userDropdown.classList.add('hidden');
      }
    }
  });
  // Logout buttons (dropdown and header)
  // Only declare logoutBtn and logoutHeaderBtn once
  var logoutBtn = document.getElementById('logoutBtn');
  var logoutHeaderBtn = document.getElementById('logoutHeaderBtn');
  if (logoutBtn) logoutBtn.onclick = logout;
  if (logoutHeaderBtn) logoutHeaderBtn.onclick = logout;
  // Show email choice modal if not logged in
  if (!isLoggedIn()) {
    showEmailChoiceModal();
  }
  // Email choice modal button
  const googleBtn = document.getElementById('google-signin-btn');
  if (googleBtn) googleBtn.onclick = function() {
    hideEmailChoiceModal();
    supabaseGoogleSignIn();
  };
  // Close modal button
  const closeEmailChoice = document.getElementById('closeEmailChoice');
  if (closeEmailChoice) closeEmailChoice.onclick = hideEmailChoiceModal;
  products = await fetchProducts();
  renderProducts();
  updateUserUI();
  // Live advert/featured section
  showNextFeaturedProduct();
  setInterval(showNextFeaturedProduct, 3500);
  // Buy modal close
  const closeBtn = document.getElementById('closeBuyModal');
  if (closeBtn) closeBtn.onclick = closeBuyModal;
  // Buy form submit
  const buyForm = document.getElementById('buyForm');
  if (buyForm) buyForm.onsubmit = handleBuySubmit;
  // Login/logout
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.onclick = login;
});
    const userIconImg = document.getElementById('userIcon');


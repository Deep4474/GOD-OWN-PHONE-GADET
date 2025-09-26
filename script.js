// Utility: Clear localStorage and reload for fresh registration
function clearUserStorageAndReload() {
  localStorage.removeItem('lamar_user_id');
  localStorage.removeItem('lamar_username');
  localStorage.removeItem('lamar_email');
  window.location.reload();
}
// Uncomment the next line to run this automatically once:
// clearUserStorageAndReload();
// Supabase product fetch
const SUPABASE_URL = 'https://jlwxkykznyjmstpjcgks.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ';

async function fetchProducts() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) return [];
  return await res.json();
}

function renderProducts(products) {
  const productList = document.getElementById('productList');
  if (!productList) return;
  productList.innerHTML = '';
  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <img src="${product.image_url || 'https://via.placeholder.com/120'}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${product.description || ''}</p>
      <div class="price">$${Number(product.price).toFixed(2)}</div>
      <button class="buy-btn">Buy Now</button>
    `;
    div.querySelector('.buy-btn').onclick = () => {
      // Show buy modal and set product info
      showBuyModal(product);
    };
// Show buy modal and handle order submission
function showBuyModal(product) {
  // Helper to estimate if address is far
  function isFarAddress(address) {
    // Simple logic: if address contains 'Ibadan', treat as local, else far
    if (!address) return false;
    return !address.toLowerCase().includes('ibadan');
  }
  // Calculate and show total amount
  function updateTotalAmount() {
    const quantity = Number(document.getElementById('buyQuantity').value) || 1;
    const deliveryOption = document.getElementById('buyDeliveryOption').value;
    const address = document.getElementById('buyAddress').value;
    let total = Number(product.price) * quantity;
    if (deliveryOption === 'pickup') {
      total *= 1.4;
    } else if (deliveryOption === 'delivery') {
      total *= isFarAddress(address) ? 2.5 : 2;
    }
    document.getElementById('buyTotalAmount').textContent =
      deliveryOption ? `Total Amount: $${total.toFixed(2)}` : '';
  }
  // Add event listeners for live calculation
  document.getElementById('buyQuantity').addEventListener('input', updateTotalAmount);
  document.getElementById('buyDeliveryOption').addEventListener('change', updateTotalAmount);
  document.getElementById('buyAddress').addEventListener('input', updateTotalAmount);
  updateTotalAmount();
  // Ensure user_id in localStorage is a valid UUID
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  let userIdFromStorage = localStorage.getItem('lamar_user_id');
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!userIdFromStorage || !uuidRegex.test(userIdFromStorage)) {
    userIdFromStorage = generateUUID();
    localStorage.setItem('lamar_user_id', userIdFromStorage);
  }
  const buyModal = document.getElementById('buyModal');
  const buyUserName = document.getElementById('buyUserName');
  const buyForm = document.getElementById('buyForm');
  const buyMsg = document.getElementById('buyMsg');
  buyUserName.textContent = `Product: ${product.name}`;
  buyMsg.textContent = '';
  buyForm.reset();
  // Always set user-id hidden input from localStorage (force overwrite)
  document.getElementById('buyUserId').value = userIdFromStorage;
  buyModal.style.display = 'block';
  buyForm.onsubmit = async function(e) {
    e.preventDefault();
    const user_name = document.getElementById('buyUserNameInput').value;
    const email = document.getElementById('buyEmail').value;
    const phone = document.getElementById('buyPhone').value;
    const address = document.getElementById('buyAddress').value;
    const quantity = document.getElementById('buyQuantity').value;
    const deliveryOption = document.getElementById('buyDeliveryOption').value;
  // Always get user_id from hidden input (which is set from localStorage)
  let user_id = document.getElementById('buyUserId').value;
    // Validate UUID (simple regex)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!user_name || !email || !phone || !address || !quantity || !deliveryOption) {
      buyMsg.style.color = 'red';
      buyMsg.textContent = 'Please fill all fields.';
      return;
    }
    if (!user_id || !uuidRegex.test(user_id)) {
      buyMsg.style.color = 'red';
      buyMsg.textContent = 'User ID missing or invalid. Please log in.';
      return;
    }
    if (!uuidRegex.test(product.id)) {
      buyMsg.style.color = 'red';
      buyMsg.textContent = 'Product ID is invalid. Please contact support.';
      return;
    }
    buyMsg.style.color = 'black';
    buyMsg.textContent = 'Placing order...';
    // Prepare order data for Supabase
      const orderData = {
        product_id: product.id,
        user_id,
        user_name,
        email,
        phone,
        address,
        quantity: Number(quantity),
        // Calculate total: price * quantity + 5% fee
        order_total: (() => {
          let total = Number(product.price) * Number(quantity);
          // Add delivery/pickup multiplier
          if (deliveryOption === 'pickup') {
            total *= 1.4;
          } else if (deliveryOption === 'delivery') {
            total *= isFarAddress(address) ? 2.5 : 2;
          }
          // Add 5% fee
          total += total * 0.05;
          return Number(total.toFixed(2));
        })(),
        status: 'pending',
        pick_option: deliveryOption,
        created_at: new Date().toISOString()
      };
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (res.ok) {
        buyMsg.style.color = 'green';
        buyMsg.textContent = 'Order placed successfully!';
        setTimeout(() => { buyModal.style.display = 'none'; }, 1200);
      } else {
        buyMsg.style.color = 'red';
        buyMsg.textContent = 'Failed to place order.';
        console.error('Supabase error:', data);
      }
    } catch (err) {
      buyMsg.style.color = 'red';
      buyMsg.textContent = 'Error placing order.';
      console.error('Network or JS error:', err);
    }
  };
}
    productList.appendChild(div);
  });
}

fetchProducts().then(renderProducts);
// Live featured product card that rotates through Supabase products
const liveFeatured = document.getElementById('liveFeatured');
let liveProducts = [];
let featuredIndex = 0;
function showNextFeaturedProduct() {
  if (liveProducts.length > 0 && liveFeatured) {
    const product = liveProducts[featuredIndex];
    liveFeatured.innerHTML = `
      <div class="featured-info">
        <h1>${product.name}</h1>
        <p>${product.description || ''}</p>
        <p class="price">Price: <span>$${Number(product.price).toFixed(2)}</span></p>
        <a href="#" class="shop-btn">Shop Now</a>
      </div>
      <div class="featured-img">
        <img src="${product.image_url || 'https://via.placeholder.com/220'}" alt="${product.name}">
      </div>
    `;
    featuredIndex = (featuredIndex + 1) % liveProducts.length;
  }
}
fetchProducts().then(products => {
  liveProducts = products.length ? products : [{name: 'No products available', price: '', description: '', image_url: ''}];
  showNextFeaturedProduct();
  setInterval(showNextFeaturedProduct, 3500);
  });
document.addEventListener('DOMContentLoaded', function() {
  const buyNowBtn = document.getElementById('buyNowBtn');
  const orderModal = document.getElementById('orderModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const orderForm = document.getElementById('orderForm');

  if (buyNowBtn) {
    buyNowBtn.onclick = function() {
      orderModal.classList.add('show');
    };
  }
  if (closeModalBtn) {
    closeModalBtn.onclick = function() {
      orderModal.classList.remove('show');
    };
  }
  if (orderForm) {
    orderForm.onsubmit = async function(e) {
      e.preventDefault();
      const formData = new FormData(orderForm);
      const name = formData.get('name');
      const phone = formData.get('phone');
      const address = formData.get('address');
      const product_id = formData.get('product_id');
      const quantity = Number(formData.get('quantity'));
      const delivery_option = formData.get('delivery_option');
      if (!name || !phone || !address || !product_id || !quantity || !delivery_option) {
        alert('Please fill all fields.');
        return;
      }
      // You may want to fetch product price from Supabase, but for now, set total_amount to 0
      const orderData = {
        name,
        phone,
        address,
        product_id,
        quantity,
        total_amount: 0, // Optionally fetch price and calculate
        status: 'pending',
        delivery_option,
        created_at: new Date().toISOString()
      };
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          },
          body: JSON.stringify(orderData)
        });
        const data = await res.json();
        if (res.ok) {
          alert('Order placed successfully!');
          orderModal.classList.remove('show');
          orderForm.reset();
        } else {
          alert('Failed to place order.');
          console.error('Supabase error:', data);
        }
      } catch (err) {
        alert('Error placing order.');
        console.error('Network or JS error:', err);
      }
    };
  }
});
// User authentication simulation (replace with real logic)
function isLoggedIn() {
  return localStorage.getItem('user') !== null;
}

function getUser() {
  return JSON.parse(localStorage.getItem('user')) || { name: 'Guest', image: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' };
}

function updateUserUI() {
  const user = getUser();
  document.getElementById('userName').textContent = user.name || 'Guest';
  document.getElementById('userIcon').src = user.image || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
}

document.addEventListener('DOMContentLoaded', function() {
  const userIcon = document.getElementById('userIcon');
  const userName = document.getElementById('userName');
  // Get email from localStorage (or prompt user)
  let email = localStorage.getItem('lamar_email');
  if (!email) {
    // Optionally prompt for email or use a default for demo
    email = prompt('Enter your email to check registration:');
    if (email) localStorage.setItem('lamar_email', email);
  }
  // Check registration status from Netlify backend
  async function checkRegistration() {
    if (!email) {
      userIcon.style.display = 'block';
      userName.style.display = 'none';
      return;
    }
    try {
      const res = await fetch(`https://glittery-torrone-d1184e.netlify.app/api/user?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success && data.user) {
        // Registered: show name, hide icon
        userName.textContent = data.user.username;
        userIcon.style.display = 'none';
        userName.style.display = 'flex';
        // Save user UUID to localStorage for order submission
        if (data.user.id) {
          localStorage.setItem('lamar_user_id', data.user.id);
        }
      } else {
        // Not registered: show icon, hide name
        userIcon.style.display = 'block';
        userName.style.display = 'none';
        userIcon.onclick = function() {
          document.getElementById('registerModal').style.display = 'block';
        };
      }
    } catch (err) {
      userIcon.style.display = 'block';
      userName.style.display = 'none';
    }
  }
  checkRegistration();
});
// Simple form handler for demonstration
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you for contacting Lamar Phone and Gadget!');
    contactForm.reset();
  });
}

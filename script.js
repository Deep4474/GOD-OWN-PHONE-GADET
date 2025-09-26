// Example script: Display a welcome message and current date
// --- Supabase credentials (for demo/dev only; do not expose in production) ---
const supabaseUrl = 'https://jlwxkykznyjmstpjcgks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ';

// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', function() {
  // ...existing code...

  // Registration logic using Supabase Auth
  const registerForm = document.getElementById('registerForm');
  const regUsername = document.getElementById('regUsername');
  const regEmail = document.getElementById('regEmail');
  const regPassword = document.getElementById('regPassword');
  const registerMsg = document.getElementById('registerMsg');

  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      registerMsg.textContent = '';
      if (!regUsername.value || !regEmail.value || !regPassword.value) {
        registerMsg.style.color = 'red';
        registerMsg.textContent = 'Please fill all fields.';
        return;
      }
      registerMsg.style.color = 'black';
      registerMsg.textContent = 'Registering...';
      try {
        const { data, error } = await supabase.auth.signUp({
          email: regEmail.value.trim(),
          password: regPassword.value,
          options: {
            data: { full_name: regUsername.value }
          }
        });
        if (error) throw error;
        registerMsg.style.color = 'green';
        registerMsg.textContent = 'Registration successful! Please check your email for verification.';
        registerForm.reset();
        setTimeout(() => {
          document.getElementById('registerModal').style.display = 'none';
        }, 1500);
      } catch (err) {
        registerMsg.style.color = 'red';
        registerMsg.textContent = 'Registration failed: ' + err.message;
      }
    });
  }

  // Global variable to hold the selected product
  window.selectedProduct = null;

  // Function to open the buy modal for a specific product
  window.openBuyModal = function(product) {
    window.selectedProduct = product;
    const buyModal = document.getElementById('buyModal');
    const buyUserName = document.getElementById('buyUserName');
    const buyForm = document.getElementById('buyForm');
    const buyMsg = document.getElementById('buyMsg');
    buyUserName.textContent = `Product: ${product.name}`;
    buyMsg.textContent = '';
    buyForm.reset();
    // Always set user-id hidden input from localStorage (force overwrite)
    const userIdFromStorage = localStorage.getItem('lamar_user_id') || '';
    document.getElementById('buyUserId').value = userIdFromStorage;
    buyModal.style.display = 'block';
  };

  // Attach event handler for buy form submission
  const buyForm = document.getElementById('buyForm');
  if (buyForm) {
    buyForm.onsubmit = async function(e) {
      e.preventDefault();
      const product = window.selectedProduct;
      const buyMsg = document.getElementById('buyMsg');
      if (!product) {
        alert('No product selected.');
        return;
      }
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
          total *= 1.05;
          return total;
        })(),
  delivery_option: deliveryOption,
  pick_option: deliveryOption,
  status: 'pending'
      };
      try {
        // Insert order using Supabase client
        const { data, error } = await supabase
          .from('orders')
          .insert([orderData])
          .select();
        if (error) {
          buyMsg.style.color = 'red';
          buyMsg.textContent = 'Failed to place order: ' + (error.message || 'Unknown error');
          console.error('Supabase error:', error);
        } else {
          buyMsg.style.color = 'green';
          buyMsg.textContent = 'Order placed successfully!';
          buyForm.reset();
          // Hide the buy modal after successful order
          const buyModal = document.getElementById('buyModal');
          if (buyModal) {
            setTimeout(() => {
              buyModal.style.display = 'none';
            }, 1000);
          }
        }
      } catch (err) {
        buyMsg.style.color = 'red';
        buyMsg.textContent = 'Error placing order.';
        console.error('Network or JS error:', err);
      }
    };
  }

  // Featured products logic
  let liveProducts = [];
  let featuredIndex = 0;
  const liveFeatured = document.getElementById('liveFeatured');
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
          <img src="${product.image_url || 'https://placehold.co/220x220'}" alt="${product.name}">
        </div>
      `;
      featuredIndex = (featuredIndex + 1) % liveProducts.length;
    }
  }
  async function fetchProducts() {
    // Fetch products using Supabase client
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      if (error) return [];
      return data;
    } catch (err) {
      return [];
    }
  }
  fetchProducts().then(products => {
    console.log('Fetched products:', products);
    const productList = document.getElementById('productList');
    if (!products || !Array.isArray(products) || products.length === 0) {
      liveProducts = [{name: 'No products available', price: '', description: '', image_url: ''}];
      if (liveFeatured) {
        liveFeatured.innerHTML = '<div style="padding:2em;text-align:center;">No products available</div>';
      }
      if (productList) {
        productList.innerHTML = '<div style="padding:2em;text-align:center;">No products available</div>';
      }
    } else {
      liveProducts = products;
      showNextFeaturedProduct();
      setInterval(showNextFeaturedProduct, 3500);
      // Render products in the #productList section
      if (productList) {
        productList.innerHTML = products.map(product => `
          <div class="product-card">
            <img src="${product.image_url || 'https://placehold.co/180x180'}" alt="${product.name}" class="product-img">
            <h3>${product.name}</h3>
            <p>${product.description || ''}</p>
            <p class="price">$${Number(product.price).toFixed(2)}</p>
            <button onclick='openBuyModal(${JSON.stringify(product)})' class="buy-btn">Buy Now</button>
          </div>
        `).join('');
      }
    }
  });

    // Fetch orders using Supabase client
    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*');
        if (error) return [];
        return data;
      } catch (err) {
        return [];
      }
    }

    // Example usage of fetchOrders
    fetchOrders().then(orders => {
      console.log('Fetched orders:', orders);
    });

  // Order modal logic
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
        const res = await fetch(`${supabaseUrl}/rest/v1/orders`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
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

  // User icon and registration check (local only)
  const userIcon = document.getElementById('userIcon');
  const userName = document.getElementById('userName');
  // Get email from localStorage (or prompt user)
  let email = localStorage.getItem('lamar_email');
  if (!email) {
    email = prompt('Enter your email to check registration:');
    if (email) localStorage.setItem('lamar_email', email);
  }
  // Check registration status from local user.json via localhost endpoint
  async function checkRegistration() {
    if (!email) {
      userIcon.style.display = 'block';
      userName.style.display = 'none';
      return;
    }
    try {
  const res = await fetch(`https://phone-2cv4.onrender.com/api/user?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success && data.user) {
        // Registered: show name, hide icon
        userName.textContent = data.user.username;
        userIcon.style.display = 'none';
        userName.style.display = '';
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


// Function to send welcome email using EmailJS
// Always send welcome email (no localStorage check)
function sendWelcomeEmail(userEmail, userName) {
  console.log('[DEBUG] sendWelcomeEmail called with:', { userEmail, userName });
  if (userEmail && typeof userEmail === 'string' && userEmail.includes('@')) {
    if (typeof emailjs === 'undefined') {
      console.error('[DEBUG] EmailJS library is not loaded.');
      alert('EmailJS is not loaded. Please check your script includes.');
      return;
    }
    const emailParams = {
      user_email: userEmail,
      user_name: userName
    };
    console.log('[DEBUG] Sending welcome email to:', userEmail);
    emailjs.send('service_xuzka4m', 'template_7wubyku', emailParams)
      .then(function(response) {
        console.log('[DEBUG] EmailJS SUCCESS!', response.status, response.text);
        alert('Welcome email sent successfully!');
      }, function(error) {
        console.error('[DEBUG] EmailJS FAILED...', error);
        alert('Failed to send welcome email. Check console for details.');
      });
  } else {
    console.warn('[DEBUG] No valid user email found, not sending welcome email. userEmail:', userEmail);
  }
}
// Example script: Display a welcome message and current date
// --- Supabase credentials (for demo/dev only; do not expose in production) ---
const supabaseUrl = 'https://jlwxkykznyjmstpjcgks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ';

// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', function() {
  // On page load, show user details from localStorage if available
  const storedName = localStorage.getItem('lamar_name');
  const storedEmail = localStorage.getItem('lamar_email');
  const userNameSpan = document.getElementById('userName');
  const userEmailSpan = document.getElementById('userEmail');
  const userIconImg = document.getElementById('userIcon');
  if (storedName && storedEmail) {
    if (userNameSpan) {
      userNameSpan.textContent = storedName;
      userNameSpan.style.display = 'inline';
    }
    if (userEmailSpan) {
      userEmailSpan.textContent = storedEmail;
      userEmailSpan.style.display = 'inline';
    }
    if (userIconImg) {
      userIconImg.style.display = 'none';
    }
  } else {
    if (userNameSpan) userNameSpan.style.display = 'none';
    if (userEmailSpan) userEmailSpan.style.display = 'none';
    if (userIconImg) userIconImg.style.display = 'inline';
  }
  // Example: Trigger Supabase Google OAuth sign-in
  window.supabaseGoogleSignIn = function() {
    supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  // User icon click: show email choice modal
  const userIcon = document.getElementById('userIcon');
  const emailChoiceModal = document.getElementById('emailChoiceModal');
  const closeEmailChoice = document.getElementById('closeEmailChoice');
  const googleBtn = document.getElementById('google-signin-btn');

  // Make user icon always clickable to open the email choice modal
  if (userIcon) {
    userIcon.style.pointerEvents = 'auto';
    userIcon.addEventListener('click', function() {
      if (emailChoiceModal) {
        emailChoiceModal.classList.remove('hidden');
        emailChoiceModal.style.display = 'block';
      }
      if (googleBtn) googleBtn.style.display = 'inline-block';
    });
  }

  // When 'Continue with your email' is clicked, sign in with Google OAuth (redirects to callback)
  if (googleBtn) {
    googleBtn.addEventListener('click', function() {
      supabase.auth.signInWithOAuth({ provider: 'google' });
    });
  }

  // Listen for Supabase auth state change to send login notification email
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session && session.user) {
      const userEmail = session.user.email;
      const userName = session.user.user_metadata && session.user.user_metadata.full_name ? session.user.user_metadata.full_name : userEmail;
      // Save to localStorage for persistence
      localStorage.setItem('lamar_email', userEmail);
      localStorage.setItem('lamar_name', userName);
      // Update UI: always show name and email in userIcon title and span
      if (userNameSpan) {
        userNameSpan.textContent = userName;
        userNameSpan.style.display = 'inline';
      }
      if (userEmailSpan) {
        userEmailSpan.textContent = userEmail;
        userEmailSpan.style.display = 'inline';
      }
      if (userIconImg) {
        userIconImg.style.display = 'none';
      }
      // Optionally close the modal
      if (emailChoiceModal) {
        emailChoiceModal.classList.add('hidden');
        emailChoiceModal.style.display = 'none';
      }
      // Always send welcome email on sign in
      // Only send welcome email if not already sent for this user
      const welcomeEmailKey = 'lamar_welcome_email_sent_' + userEmail;
      if (!localStorage.getItem(welcomeEmailKey)) {
        console.log('[DEBUG] Attempting to send welcome email:', { userEmail, userName });
        if (userEmail && typeof userEmail === 'string' && userEmail.includes('@')) {
          // Check if EmailJS is loaded
          if (typeof emailjs === 'undefined') {
            console.error('[DEBUG] EmailJS library is not loaded.');
            alert('EmailJS is not loaded. Please check your script includes.');
            return;
          }
          // Log the service and template IDs
          console.log('[DEBUG] EmailJS service ID:', 'service_xuzka4m');
          console.log('[DEBUG] EmailJS template ID:', 'template_7wubyku');
          // Log the parameters being sent
          const emailParams = {
            user_email: userEmail,
            user_name: userName
          };
          console.log('[DEBUG] EmailJS parameters:', emailParams);
          // Extra debug: log recipient email and all params
          console.log('[DEBUG] Sending email to:', userEmail);
          console.log('[DEBUG] Full EmailJS send call:', {
            service: 'service_xuzka4m',
            template: 'template_7wubyku',
            params: emailParams
          });
          emailjs.send('service_xuzka4m', 'template_7wubyku', emailParams)
          .then(function(response) {
             console.log('[DEBUG] EmailJS SUCCESS!', response.status, response.text);
             alert('Welcome email sent successfully!');
             localStorage.setItem(welcomeEmailKey, 'true');
          }, function(error) {
             console.error('[DEBUG] EmailJS FAILED...', error);
             alert('Failed to send welcome email. Check console for details.');
          });
        } else {
          console.warn('[DEBUG] No valid user email found, not sending welcome email. userEmail:', userEmail);
        }
      } else {
        console.log('[DEBUG] Welcome email already sent for this user:', userEmail);
      }
    }
  });

  if (closeEmailChoice) {
    closeEmailChoice.addEventListener('click', function() {
      if (emailChoiceModal) {
        emailChoiceModal.classList.add('hidden');
        emailChoiceModal.style.display = 'none';
      }
      if (googleBtn) googleBtn.style.display = 'inline-block';
      if (typeof chooseEmailMsg !== 'undefined') chooseEmailMsg.textContent = '';
    });
  }
  // ...existing code...


  // Example: Fetch and log all users (for admin or UI)
  async function fetchUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return data;
  }
  // Example usage: log users to console
  fetchUsers().then(users => {
    console.log('All users:', users);
  });

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
          // Send welcome email after successful registration/order
          console.log('[DEBUG] About to call sendWelcomeEmail after order:', { email, user_name });
          sendWelcomeEmail(email, user_name);
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
  userIcon.src = user.image || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  }

  // User icon and registration check (local only)
  // userIcon already declared above
  // Optionally, you can still check registration, but always prefer localStorage for display
  // ...existing code...

  // Removed duplicate googleBtn declaration and event listener
});

// Add Supabase client initialization


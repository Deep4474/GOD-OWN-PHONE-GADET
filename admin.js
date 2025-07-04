const API = 'https://phone-2cv4.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
const navItems = document.querySelectorAll('.admin-nav li[data-section]');
const topbarTitle = document.getElementById('admin-topbar-title');
  const adminContent = document.getElementById('admin-content');
  const productModal = document.getElementById('product-modal');
  const orderModal = document.getElementById('order-modal');
  let editingProduct = null;

  function showSection(section) {
    navItems.forEach(li => li.classList.remove('active'));
    const activeItem = Array.from(navItems).find(li => li.dataset.section === section);
    if (activeItem) activeItem.classList.add('active');
    topbarTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1);
    if (section === 'dashboard') loadDashboard();
    else if (section === 'products') loadProducts();
    else if (section === 'orders') loadOrders();
    else if (section === 'users') loadUsers();
    else if (section === 'notifications') loadNotifications();
    else if (section === 'analytics') loadAnalytics();
    else if (section === 'customer-care') loadCustomerCare();
    else adminContent.innerHTML = `<div class="admin-placeholder"><h2>${topbarTitle.textContent}</h2><p>${topbarTitle.textContent} panel coming soon.</p></div>`;
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => showSection(item.dataset.section));
  });

  showSection('dashboard');

  // --- Dashboard ---
  async function loadDashboard() {
    adminContent.innerHTML = '<div>Loading dashboard...</div>';
    try {
      const res = await fetch(`${API}/dashboard`);
        const data = await res.json();
      adminContent.innerHTML = `
        <div class="dashboard-stats">
          <div class="stat"><span>Total Users</span><b>${data.totalUsers ?? '-'}</b></div>
          <div class="stat"><span>Total Orders</span><b>${data.totalOrders ?? '-'}</b></div>
          <div class="stat"><span>Total Products</span><b>${data.totalProducts ?? '-'}</b></div>
          <div class="stat"><span>Revenue</span><b>₦${data.revenue ?? '-'}</b></div>
        </div>
        <h3>Recent Orders</h3>
        <table class="admin-table"><thead><tr><th>User</th><th>Amount</th><th>Status</th></tr></thead><tbody>
        ${(data.recentOrders||[]).map(o => `<tr><td>${o.user}</td><td>₦${o.amount}</td><td>${o.status}</td></tr>`).join('') || '<tr><td colspan="3">No recent orders</td></tr>'}
        </tbody></table>
      `;
    } catch {
      adminContent.innerHTML = '<p>Failed to load dashboard.</p>';
    }
  }

  // --- Products ---
  async function loadProducts() {
    adminContent.innerHTML = '<div>Loading products...</div>';
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API}/products`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      let rows = (data.products || []).map(p => `
        <tr>
          <td><img src="${(p.images && p.images[0]) || 'https://via.placeholder.com/48'}" alt="" /></td>
                <td>${p.name}</td>
                <td>₦${p.price}</td>
                <td>${p.category}</td>
          <td>${p.stock ?? '-'}</td>
          <td>${p.position ?? '-'}</td>
          <td>
            <button class="btn-secondary btn-edit" data-id="${p._id}">Edit</button>
            <button class="btn-secondary btn-delete" data-id="${p._id}">Delete</button>
                </td>
        </tr>
      `).join('');
      adminContent.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <h3>Product List</h3>
          <button class="btn-primary" id="add-product-btn">+ Add Product</button>
        </div>
        <table class="admin-table"><thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Category</th><th>Stock</th><th>Position</th><th>Actions</th></tr></thead><tbody>${rows || '<tr><td colspan="7">No products</td></tr>'}</tbody></table>
      `;
      const addProductBtn = document.getElementById('add-product-btn');
      if (addProductBtn) addProductBtn.onclick = () => openProductModal();
      adminContent.querySelectorAll('.btn-edit').forEach(btn => btn.onclick = () => openProductModal(btn.dataset.id));
      adminContent.querySelectorAll('.btn-delete').forEach(btn => btn.onclick = () => deleteProduct(btn.dataset.id));
    } catch {
      adminContent.innerHTML = '<p>Failed to load products.</p>';
    }
  }

  function openProductModal(id) {
    editingProduct = null;
    const modal = productModal;
    const form = document.getElementById('product-form');
    const title = document.getElementById('product-modal-title');
    const message = document.getElementById('product-form-message');
    if (form) form.reset();
    const imagePreview = document.getElementById('image-preview');
    if (imagePreview) imagePreview.innerHTML = '';
    if (message) message.textContent = '';
    if (id) {
      const token = localStorage.getItem('adminToken');
      fetch(`${API}/products/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
        .then(res => res.json())
        .then(p => {
          const prod = p.product || p;
          editingProduct = prod;
          document.getElementById('product-id').value = prod._id;
          document.getElementById('product-name').value = prod.name;
          document.getElementById('product-price').value = prod.price;
          document.getElementById('product-category').value = prod.category;
          document.getElementById('product-stock').value = prod.stock ?? '';
          document.getElementById('product-position').value = prod.position ?? '';
          document.getElementById('product-description').value = prod.description ?? '';
          document.getElementById('product-brand').value = prod.brand ?? '';
          if (prod.images && prod.images[0] && imagePreview) {
            imagePreview.innerHTML = `<img src="${prod.images[0]}" alt="" />`;
          }
          title.textContent = 'Edit Product';
          modal.classList.remove('hidden');
        });
    } else {
      document.getElementById('product-id').value = '';
      title.textContent = 'Add Product';
      modal.classList.remove('hidden');
    }
  }

  const closeProductModal = document.getElementById('close-product-modal');
  if (closeProductModal && productModal) closeProductModal.onclick = () => productModal.classList.add('hidden');

  const productImageInput = document.getElementById('product-image');
  if (productImageInput) {
    productImageInput.addEventListener('change', function () {
      const file = this.files[0];
      const preview = document.getElementById('image-preview');
      if (file && preview) {
        const reader = new FileReader();
        reader.onload = () => {
          // Create an image element
          const img = new Image();
          img.onload = () => {
            // Create a canvas
            const size = 220;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            // Draw a nice gradient background
            const grad = ctx.createLinearGradient(0, 0, size, size);
            grad.addColorStop(0, '#f0f4ff');
            grad.addColorStop(1, '#c2e9fb');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, size, size);
            // Draw the uploaded image centered
            const scale = Math.min(size / img.width, size / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (size - w) / 2;
            const y = (size - h) / 2;
            ctx.drawImage(img, x, y, w, h);
            // Show preview
            preview.innerHTML = `<img src="${canvas.toDataURL()}" alt="Preview" style="width:100%;border-radius:12px;box-shadow:0 2px 8px #0002;" />`;
            // Store the composited image for upload
            preview.dataset.finalImage = canvas.toDataURL();
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      } else if (preview) {
        preview.innerHTML = '';
        delete preview.dataset.finalImage;
      }
    });
  }

  const productForm = document.getElementById('product-form');
  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
      const id = document.getElementById('product-id').value;
      const name = document.getElementById('product-name').value.trim();
      const price = parseFloat(document.getElementById('product-price').value);
      const category = document.getElementById('product-category').value;
      const stock = parseInt(document.getElementById('product-stock').value);
      const position = parseInt(document.getElementById('product-position').value);
      const description = document.getElementById('product-description').value.trim();
      const brand = document.getElementById('product-brand').value.trim();
      const imageInput = document.getElementById('product-image');
      const message = document.getElementById('product-form-message');
      let imageUrl = '';
      if (imageInput && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = async () => {
          imageUrl = reader.result;
          await submitProduct(id, name, price, category, stock, position, description, brand, imageUrl, message);
        };
        reader.readAsDataURL(imageInput.files[0]);
        return;
      } else if (editingProduct && editingProduct.images[0]) {
        imageUrl = editingProduct.images[0];
      }
      await submitProduct(id, name, price, category, stock, position, description, brand, imageUrl, message);
    });
  }

  async function submitProduct(id, name, price, category, stock, position, description, brand, imageUrl, message) {
    if (!name || !price || !category || !stock || isNaN(position) || !description || !brand) {
      message.textContent = 'All fields are required.';
      return;
    }
    // Use composited image if available
    const preview = document.getElementById('image-preview');
    if (preview && preview.dataset.finalImage) {
      imageUrl = preview.dataset.finalImage;
    }
    const product = { name, price, category, stock, position, description, brand, images: imageUrl ? [imageUrl] : [] };
    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
          'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const res = await fetch(`${API}/products/${id || ''}`, {
        method: id ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(product)
      });
      const data = await res.json();
      if (res.ok) {
        message.style.color = '#2563eb';
        message.textContent = 'Product saved!';
        setTimeout(() => {
          productModal.classList.add('hidden');
          loadProducts();
        }, 800);
      } else {
        message.style.color = '#dc2626';
        message.textContent = data.message || 'Error saving product.';
      }
    } catch {
      message.style.color = '#dc2626';
      message.textContent = 'Network error.';
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Are you sure?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API}/products/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) loadProducts();
      else alert('Delete failed.');
    } catch {
      alert('Network error.');
    }
  }

  // --- Orders ---
  async function loadOrders() {
    adminContent.innerHTML = '<div>Loading orders...</div>';
    try {
      const res = await fetch(`${API}/orders`);
    const data = await res.json();
      // Save notifications for new orders
      (data.orders || []).forEach(order => {
        if (order.status === 'pending') {
          let notifications = [];
          try {
            notifications = JSON.parse(localStorage.getItem('adminOrderNotifications')) || [];
          } catch (e) { notifications = []; }
          if (!notifications.some(n => n.orderId === order._id)) {
            saveOrderNotification(order);
          }
        }
      });
      const rows = (data.orders || []).map(o => `
        <tr>
          <td>${o._id}</td>
          <td>${o.user}</td>
          <td>₦${o.totalAmount}</td>
          <td>${o.status}</td>
          <td><button class="btn-secondary btn-update-order" data-id="${o._id}">Update</button></td>
        </tr>
      `).join('');
      adminContent.innerHTML = `
        <h3>Orders</h3>
        <table class="admin-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>
      `;
      adminContent.querySelectorAll('.btn-update-order').forEach(btn => btn.onclick = () => openOrderModal(btn.dataset.id));
    } catch {
      adminContent.innerHTML = '<p>Failed to load orders.</p>';
    }
  }

  function openOrderModal(id) {
    if (!orderModal) return;
    document.getElementById('order-id').value = id;
    document.getElementById('order-form-message').textContent = '';
    orderModal.classList.remove('hidden');
  }

  const closeOrderModal = document.getElementById('close-order-modal');
  if (closeOrderModal) closeOrderModal.onclick = () => orderModal.classList.add('hidden');

  const orderUpdateForm = document.getElementById('order-update-form');
  if (orderUpdateForm) {
    orderUpdateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('order-id').value;
      const status = document.getElementById('order-status').value;
      const message = document.getElementById('order-message').value;
      const msgDiv = document.getElementById('order-form-message');
      if (!status || !message) {
        msgDiv.textContent = 'All fields required.';
        return;
      }
      try {
        const res = await fetch(`${API}/orders/${id}/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, message })
        });
        if (res.ok) {
          msgDiv.style.color = '#2563eb';
          msgDiv.textContent = 'Update sent!';
          setTimeout(() => {
            orderModal.classList.add('hidden');
            loadOrders();
          }, 800);
    } else {
          msgDiv.style.color = '#dc2626';
          msgDiv.textContent = 'Update failed.';
        }
      } catch {
        msgDiv.style.color = '#dc2626';
        msgDiv.textContent = 'Network error.';
      }
    });
  }

  // --- Save Notification Helper ---
  function saveOrderNotification(order) {
    let notifications = [];
    try {
      notifications = JSON.parse(localStorage.getItem('adminOrderNotifications')) || [];
    } catch (e) {
      notifications = [];
    }
    const now = new Date();
    notifications.unshift({
      message: `Order #${order._id.slice(-6)} has been sent to admin (₦${order.totalAmount.toLocaleString()})`,
      orderId: order._id,
      time: now.toLocaleString()
    });
    if (notifications.length > 100) notifications = notifications.slice(0, 100);
    localStorage.setItem('adminOrderNotifications', JSON.stringify(notifications));
  }

  // --- Users ---
  async function loadUsers() {
    adminContent.innerHTML = '<div>Loading users...</div>';
    try {
      const res = await fetch(`${API}/users`);
      const data = await res.json();
      const rows = (data.users || []).map(u =>
        `<tr><td>${u._id || u.id}</td><td>${u.name}</td><td>${u.email}</td></tr>`
      ).join('');
      adminContent.innerHTML = `
        <h3>Users</h3>
        <table class="admin-table"><thead><tr><th>ID</th><th>Name</th><th>Email</th></tr></thead><tbody>${rows}</tbody></table>
      `;
    } catch {
      adminContent.innerHTML = '<p>Failed to load users.</p>';
    }
  }

  // --- Notifications ---
  async function loadNotifications() {
    adminContent.innerHTML = '<div>Loading notifications...</div>';
    // Local order notifications
    let localNotifications = [];
    try {
      localNotifications = JSON.parse(localStorage.getItem('adminOrderNotifications')) || [];
    } catch (e) { localNotifications = []; }
    let localRows = '';
    if (localNotifications.length > 0) {
      localRows = `
        <h4>Order Notifications</h4>
        <ul class="notification-list">
          ${localNotifications.map(n => `<li><strong>${n.time}</strong>: ${n.message}</li>`).join('')}
        </ul>
      `;
    }
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API}/notifications`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      const rows = (data.notifications || []).map(n => `
        <tr>
          <td>${n.user || 'System'}</td>
          <td>${n.message}</td>
          <td>${new Date(n.date).toLocaleString()}</td>
        </tr>
      `).join('');
      adminContent.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <h3>Notifications</h3>
          <button class="btn-primary" id="open-notify-modal">+ Send Notification</button>
        </div>
        ${localRows}
        <table class="admin-table">
          <thead><tr><th>User</th><th>Message</th><th>Date</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="3">No notifications</td></tr>'}</tbody>
        </table>
      `;
      // Show modal on button click
      const openNotifyBtn = document.getElementById('open-notify-modal');
      const notifyModal = document.getElementById('admin-notify-form-container');
      if (openNotifyBtn && notifyModal) {
        openNotifyBtn.onclick = () => notifyModal.classList.remove('hidden');
      }
      // Close modal logic
      const closeNotifyModal = document.getElementById('close-notify-modal');
      if (closeNotifyModal && notifyModal) closeNotifyModal.onclick = () => notifyModal.classList.add('hidden');
      // Handle form submission
      const notifyForm = document.getElementById('admin-notify-form');
      if (notifyForm) {
        notifyForm.onsubmit = async function(e) {
          e.preventDefault();
          const email = document.getElementById('notify-email').value;
          const subject = document.getElementById('notify-subject').value;
          const message = document.getElementById('notify-message').value;
          const msgDiv = document.getElementById('notify-form-message');
          msgDiv.textContent = '';
          const token = localStorage.getItem('adminToken');
          try {
            const res = await fetch(`${API}/admin/notify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify({ email, subject, message })
            });
            const data = await res.json();
            if (res.ok) {
              msgDiv.style.color = '#2563eb';
              msgDiv.textContent = 'Notification sent!';
              notifyForm.reset();
              setTimeout(() => notifyModal.classList.add('hidden'), 1000);
            } else {
              msgDiv.style.color = '#dc2626';
              msgDiv.textContent = data.error || 'Failed to send notification.';
            }
          } catch {
            msgDiv.style.color = '#dc2626';
            msgDiv.textContent = 'Network error.';
          }
        };
      }
    } catch {
      adminContent.innerHTML = '<p>Failed to load notifications.</p>';
    }
  }

  // --- Analytics ---
  async function loadAnalytics() {
    adminContent.innerHTML = '<div>Loading analytics...</div>';
    try {
      const res = await fetch(`${API}/analytics`);
    const data = await res.json();
      const topProducts = (data.topProducts || []).map(p =>
        `<li>${p.name} - ₦${p.totalSales}</li>`
      ).join('');
      adminContent.innerHTML = `
        <h3>Sales Analytics</h3>
        <div class="dashboard-stats">
          <div class="stat"><span>Monthly Revenue</span><b>₦${data.monthlyRevenue ?? '-'}</b></div>
          <div class="stat"><span>Top Product</span><b>${data.topProducts?.[0]?.name ?? '-'}</b></div>
          <div class="stat"><span>Total Customers</span><b>${data.totalUsers ?? '-'}</b></div>
          <div class="stat"><span>Orders This Month</span><b>${data.ordersThisMonth ?? '-'}</b></div>
        </div>
        <h4>Top-Selling Products</h4>
        <ul>${topProducts || '<li>No sales data</li>'}</ul>
      `;
    } catch {
      adminContent.innerHTML = '<p>Failed to load analytics.</p>';
    }
  }

  // --- Customer Care Chat ---
  async function loadCustomerCare() {
    adminContent.innerHTML = '<div>Loading customer care...</div>';
    try {
      const res = await fetch(`${API}/support/messages/all`);
      const data = await res.json();
      const messages = Array.isArray(data.messages) ? data.messages : [];
      // Group messages by user email
      const users = {};
      messages.forEach(msg => {
        if (!users[msg.email]) users[msg.email] = [];
        users[msg.email].push(msg);
      });
      const userList = Object.keys(users).map(email => `<li data-email="${email}">${email}</li>`).join('');
      adminContent.innerHTML = `
        <div class="admin-customer-care">
          <div class="customer-list-panel">
            <h3>Users</h3>
            <ul id="customer-user-list">${userList || '<li>No users</li>'}</ul>
          </div>
          <div class="chat-panel">
            <h3 id="chat-user-email">Select a user</h3>
            <div id="chat-history" class="chat-history"></div>
            <form id="admin-chat-form" style="display:none;">
              <input type="text" id="admin-chat-message" placeholder="Type your reply..." style="width:70%;" required />
              <button type="submit" class="btn-primary">Send</button>
            </form>
          </div>
        </div>
        <style>
          .admin-customer-care { display: flex; gap: 2rem; }
          .customer-list-panel { width: 220px; border-right: 1px solid #eee; padding-right: 1rem; }
          .customer-list-panel ul { list-style: none; padding: 0; }
          .customer-list-panel li { cursor: pointer; padding: 0.5em 0.7em; border-radius: 6px; margin-bottom: 4px; }
          .customer-list-panel li:hover, .customer-list-panel li.active { background: #2563eb; color: #fff; }
          .chat-panel { flex: 1; display: flex; flex-direction: column; }
          .chat-history { background: #f9f9f9; border-radius: 8px; min-height: 220px; max-height: 340px; overflow-y: auto; padding: 1rem; margin-bottom: 1rem; }
          .chat-message { margin-bottom: 0.7rem; text-align: right; }
          .chat-message.admin { text-align: left; }
          .chat-message .bubble { display: inline-block; padding: 0.6em 1em; border-radius: 16px; background: #2563eb; color: #fff; margin-bottom: 2px; }
          .chat-message.admin .bubble { background: #e0e7ef; color: #222; }
        </style>
      `;
      // User selection
      const userListEl = document.getElementById('customer-user-list');
      const chatHistory = document.getElementById('chat-history');
      const chatUserEmail = document.getElementById('chat-user-email');
      const chatForm = document.getElementById('admin-chat-form');
      const chatInput = document.getElementById('admin-chat-message');
      let selectedEmail = null;
      userListEl.querySelectorAll('li[data-email]').forEach(li => {
        li.onclick = () => {
          userListEl.querySelectorAll('li').forEach(l => l.classList.remove('active'));
          li.classList.add('active');
          selectedEmail = li.dataset.email;
          chatUserEmail.textContent = selectedEmail;
          renderChat(users[selectedEmail]);
          chatForm.style.display = 'flex';
        };
      });
      function renderChat(msgs) {
        chatHistory.innerHTML = msgs.map(msg => `
          <div class="chat-message${msg.from==='admin'?' admin':''}">
            <div class="bubble">${msg.text}</div>
            <div style="font-size:0.8em;color:#888;margin-top:2px;">${msg.from==='admin'?'Admin':msg.name||'User'} ${msg.time||''}</div>
          </div>
        `).join('');
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }
      chatForm.onsubmit = async function(e) {
        e.preventDefault();
        if (!selectedEmail || !chatInput.value.trim()) return;
        const msg = {
          name: 'Admin',
          email: selectedEmail,
          text: chatInput.value.trim(),
          from: 'admin'
        };
        try {
          const res = await fetch(`${API}/support/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg)
          });
          if (res.ok) {
            users[selectedEmail].push({ ...msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
            renderChat(users[selectedEmail]);
            chatInput.value = '';
          }
        } catch {}
      };
    } catch {
      adminContent.innerHTML = '<p>Failed to load customer care messages.</p>';
    }
  }

  // --- Admin Login Modal Logic ---
  const loginModal = document.getElementById('admin-login-modal');
  const loginOverlay = document.getElementById('admin-login-overlay');
  const loginForm = document.getElementById('admin-login-form');
  const loginMessage = document.getElementById('admin-login-message');
  const adminUserInfo = document.getElementById('admin-logged-in-user');
  const logoutBtn = document.getElementById('admin-logout');

  function showLoginModal() {
    loginModal.classList.remove('hidden');
    loginOverlay.classList.remove('hidden');
  }
  function hideLoginModal() {
    loginModal.classList.add('hidden');
    loginOverlay.classList.add('hidden');
  }

  function setAdminUser(user) {
    if (adminUserInfo) {
      adminUserInfo.textContent = user ? user.name + ' (' + user.email + ')' : '';
    }
  }

  function logoutAdmin() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminUser(null);
    showLoginModal();
  }

  if (logoutBtn) {
    logoutBtn.onclick = logoutAdmin;
  }

  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      loginMessage.textContent = '';
      const email = document.getElementById('admin-login-email').value.trim();
      const password = document.getElementById('admin-login-password').value;
      try {
        const res = await fetch(`${API}/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
          setAdminUser(data.user);
          hideLoginModal();
          location.reload(); // Reload to re-trigger data fetches with token
        } else {
          loginMessage.textContent = data.error || 'Login failed.';
        }
      } catch (err) {
        loginMessage.textContent = 'Network error.';
      }
    };
  }

  // On page load, force logout and show login modal
  logoutAdmin();
});

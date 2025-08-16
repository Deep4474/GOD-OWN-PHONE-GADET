// Dashboard Statistics
async function loadDashboardStats() {
    try {
        // Check if supabaseClient is available
        if (!window.supabaseClient) {
            console.error('Supabase client not initialized');
            return;
        }
        const supabaseClient = window.supabaseClient;

        // Show loading state
        document.getElementById('totalOrders').textContent = 'Loading...';
        document.getElementById('totalRevenue').textContent = 'Loading...';
        document.getElementById('totalProducts').textContent = 'Loading...';
        document.getElementById('totalCustomers').textContent = 'Loading...';

        // Fetch orders count and total revenue
        const { data: orders, error: ordersError } = await supabaseClient
            .from('orders')
            .select('id, total_amount');
        
        if (ordersError) {
            console.error('Error fetching orders:', ordersError);
            throw ordersError;
        }

        // Calculate total orders and revenue
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

        // Fetch products count
        const { count: productsCount, error: productsError } = await supabaseClient
            .from('products')
            .select('id', { count: 'exact' });

        if (productsError) throw productsError;

        // Fetch unique customers count
        const { count: customersCount, error: customersError } = await supabaseClient
            .from('orders')
            .select('email', { count: 'exact', distinct: true });

        if (customersError) throw customersError;

        // Update dashboard statistics
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalRevenue').textContent = `₦${totalRevenue.toLocaleString()}`;
        document.getElementById('totalProducts').textContent = productsCount;
        document.getElementById('totalCustomers').textContent = customersCount;

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        alert('Error loading dashboard statistics');
    }
}

// Recent Orders Table
async function loadRecentOrders() {
    try {
        const supabaseClient = window.supabaseClient;
        if (!supabaseClient) {
            console.error('Supabase client not initialized');
            return;
        }
        const { data: orders, error } = await supabaseClient
            .from('orders')
            .select(`
                id,
                created_at,
                name,
                total_amount,
                status,
                products (name)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        const tbody = document.querySelector('#recentOrdersTable tbody');
        tbody.innerHTML = '';

        orders.forEach(order => {
            const tr = document.createElement('tr');
            const date = new Date(order.created_at).toLocaleDateString();
            
            tr.innerHTML = `
                <td>#${order.id}</td>
                <td>${order.name}</td>
                <td>${order.products?.name || 'N/A'}</td>
                <td>₦${order.total_amount.toLocaleString()}</td>
                <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                <td>${date}</td>
            `;
            
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error loading recent orders:', error);
        alert('Error loading recent orders');
    }
}

// Low Stock Alert
async function loadLowStockProducts() {
    try {
        const supabaseClient = window.supabaseClient;
        if (!supabaseClient) {
            console.error('Supabase client not initialized');
            return;
        }
        const { data: products, error } = await supabaseClient
            .from('products')
            .select('*')
            .lt('stock', 5)  // Products with stock less than 5
            .order('stock', { ascending: true });

        if (error) throw error;

        const container = document.getElementById('lowStockContainer');
        container.innerHTML = '';

        products.forEach(product => {
            const alertItem = document.createElement('div');
            alertItem.className = 'alert-item';
            alertItem.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}">
                <div class="alert-details">
                    <h4>${product.name}</h4>
                    <p class="stock-count">Stock: ${product.stock} units</p>
                </div>
            `;
            container.appendChild(alertItem);
        });

        if (products.length === 0) {
            container.innerHTML = '<p>No products with low stock</p>';
        }

    } catch (error) {
        console.error('Error loading low stock products:', error);
        alert('Error loading low stock products');
    }
}

// Navigation functionality
function setupNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav a');
    const mainContent = document.querySelector('.main-content');
    
    // Hide all sections except dashboard initially
    document.querySelectorAll('.section-content').forEach(section => {
        if (!section.classList.contains('dashboard-content')) {
            section.style.display = 'none';
        }
    });

    navItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('href').substring(1);
            
            // Remove active class from all items
            navItems.forEach(nav => nav.parentElement.classList.remove('active'));
            // Add active class to clicked item
            item.parentElement.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('.section-content').forEach(section => {
                section.style.display = 'none';
            });

            // Show selected section
            const selectedSection = document.getElementById(sectionId + '-section');
            if (selectedSection) {
                selectedSection.style.display = 'block';
                
                // Load section specific data
                switch(sectionId) {
                    case 'dashboard':
                        await loadDashboardStats();
                        await loadRecentOrders();
                        await loadLowStockProducts();
                        break;
                    case 'products':
                        await loadProducts();
                        break;
                    case 'orders':
                        await loadAllOrders();
                        break;
                    case 'customers':
                        await loadCustomers();
                        break;
                }
            }
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Position the notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.color = '#fff';
    notification.style.zIndex = '1000';
    
    // Style based on type
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#4caf50';
            break;
        case 'error':
            notification.style.backgroundColor = '#f44336';
            break;
        case 'info':
            notification.style.backgroundColor = '#2196f3';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ff9800';
            break;
    }
    
    // Remove the notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin panel initializing...');
    
    // Wait for Supabase client to be ready
    let retries = 0;
    const maxRetries = 20; // Increase max retries
    
    while (!window.supabaseClient && retries < maxRetries) {
        console.log(`Waiting for Supabase client... (${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 200));
        retries++;
    }

    if (!window.supabaseClient) {
        console.error('Failed to initialize Supabase client');
        document.querySelector('.main-content').innerHTML = `
            <div class="error-message">
                <p>Failed to connect to the database. Please refresh the page to try again.</p>
                <button onclick="location.reload()">Refresh</button>
            </div>
        `;
        return;
    }
    
    console.log('Supabase client initialized successfully');

    setupNavigation();
    await loadDashboardStats();
    await loadRecentOrders();
    await loadLowStockProducts();

    // Refresh data every 5 minutes
    setInterval(() => {
        loadDashboardStats();
        loadRecentOrders();
        loadLowStockProducts();
    }, 300000);
});

// Product Management Functions
async function showAddProductForm() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add New Product</h2>
                <span class="close">&times;</span>
            </div>
            <form id="addProductForm" class="product-form">
                <div class="form-group">
                    <label for="productName">Product Name</label>
                    <input type="text" id="productName" required>
                </div>
                <div class="form-group">
                    <label for="productDescription">Description</label>
                    <textarea id="productDescription" required></textarea>
                </div>
                <div class="form-group">
                    <label for="productPrice">Price (₦)</label>
                    <input type="number" id="productPrice" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="productStock">Stock Quantity</label>
                    <input type="number" id="productStock" min="0" required>
                </div>
                <div class="form-group">
                    <label for="productCategory">Category</label>
                    <select id="productCategory" required>
                        <option value="">Select Category</option>
                        <option value="phones">Phones</option>
                        <option value="accessories">Accessories</option>
                        <option value="gadgets">Gadgets</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="productImage">Image URL</label>
                    <input type="url" id="productImage" required>
                </div>
                <div class="form-buttons">
                    <button type="submit" class="save-btn">Add Product</button>
                    <button type="button" class="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Close button functionality
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const closeModal = () => modal.remove();

    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    // Form submission
    const form = modal.querySelector('#addProductForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('.save-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';

        try {
            const productData = {
                name: form.productName.value,
                description: form.productDescription.value,
                price: parseFloat(form.productPrice.value),
                stock: parseInt(form.productStock.value),
                category: form.productCategory.value,
                image_url: form.productImage.value
            };

            const { data, error } = await supabaseClient
                .from('products')
                .insert([productData])
                .select();

            if (error) throw error;

            showNotification('Product added successfully!', 'success');
            closeModal();
            loadProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            showNotification(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Product';
        }
    };
}

async function editProduct(productId) {
    try {
        const { data: product, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) throw error;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Product</h2>
                    <span class="close">&times;</span>
                </div>
                <form id="editProductForm" class="product-form">
                    <div class="form-group">
                        <label for="editProductName">Product Name</label>
                        <input type="text" id="editProductName" value="${product.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="editProductDescription">Description</label>
                        <textarea id="editProductDescription" required>${product.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="editProductPrice">Price (₦)</label>
                        <input type="number" id="editProductPrice" value="${product.price}" min="0" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="editProductStock">Stock Quantity</label>
                        <input type="number" id="editProductStock" value="${product.stock}" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="editProductCategory">Category</label>
                        <select id="editProductCategory" required>
                            <option value="phones" ${product.category === 'phones' ? 'selected' : ''}>Phones</option>
                            <option value="accessories" ${product.category === 'accessories' ? 'selected' : ''}>Accessories</option>
                            <option value="gadgets" ${product.category === 'gadgets' ? 'selected' : ''}>Gadgets</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editProductImage">Image URL</label>
                        <input type="url" id="editProductImage" value="${product.image_url}" required>
                    </div>
                    <div class="form-buttons">
                        <button type="submit" class="save-btn">Save Changes</button>
                        <button type="button" class="cancel-btn">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Close button functionality
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const closeModal = () => modal.remove();

        closeBtn.onclick = closeModal;
        cancelBtn.onclick = closeModal;
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };

        // Form submission
        const form = modal.querySelector('#editProductForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('.save-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            try {
                const updatedData = {
                    name: form.editProductName.value,
                    description: form.editProductDescription.value,
                    price: parseFloat(form.editProductPrice.value),
                    stock: parseInt(form.editProductStock.value),
                    category: form.editProductCategory.value,
                    image_url: form.editProductImage.value
                };

                const { error } = await supabaseClient
                    .from('products')
                    .update(updatedData)
                    .eq('id', productId);

                if (error) throw error;

                showNotification('Product updated successfully!', 'success');
                closeModal();
                loadProducts();
            } catch (error) {
                console.error('Error updating product:', error);
                showNotification(error.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Changes';
            }
        };
    } catch (error) {
        console.error('Error fetching product:', error);
        showNotification(error.message, 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) throw error;

        showNotification('Product deleted successfully!', 'success');
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification(error.message, 'error');
    }
}

// Products Management
async function loadProducts() {
    try {
        const supabaseClient = window.supabaseClient;
        if (!supabaseClient) {
            console.error('Supabase client not initialized');
            return;
        }
        const { data: products, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('name');

        if (error) throw error;

        const productsContainer = document.getElementById('products-table');
        if (!productsContainer) return;

        productsContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(product => `
                        <tr>
                            <td><img src="${product.image_url}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                            <td>${product.name}</td>
                            <td>₦${product.price.toLocaleString()}</td>
                            <td>${product.stock}</td>
                            <td>
                                <button onclick="editProduct(${product.id})" class="edit-btn">Edit</button>
                                <button onclick="deleteProduct(${product.id})" class="delete-btn">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Error loading products');
    }
}

// Orders Management
async function loadAllOrders() {
    try {
        const supabaseClient = window.supabaseClient;
        if (!supabaseClient) {
            console.error('Supabase client not initialized');
            return;
        }
        const { data: orders, error } = await supabaseClient
            .from('orders')
            .select('*, products (name)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const ordersContainer = document.getElementById('orders-table');
        if (!ordersContainer) return;

        ordersContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>#${order.id}</td>
                            <td>${order.name}</td>
                            <td>${order.products?.name || 'N/A'}</td>
                            <td>₦${order.total_amount.toLocaleString()}</td>
                            <td>
                                <select onchange="updateOrderStatus(${order.id}, this.value)" class="status-select status-${order.status.toLowerCase()}">
                                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </td>
                            <td>${new Date(order.created_at).toLocaleDateString()}</td>
                            <td>
                                <button onclick="viewOrderDetails(${order.id})" class="view-btn">View</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading orders:', error);
        alert('Error loading orders');
    }
}

// Customers Management
async function loadCustomers() {
    try {
        const supabaseClient = window.supabaseClient;
        if (!supabaseClient) {
            console.error('Supabase client not initialized');
            return;
        }
        const { data: customers, error } = await supabaseClient
            .from('orders')
            .select('email, name, phone')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Remove duplicates based on email
        const uniqueCustomers = Array.from(new Map(customers.map(item => [item.email, item])).values());

        const customersContainer = document.getElementById('customers-table');
        if (!customersContainer) return;

        customersContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${uniqueCustomers.map(customer => `
                        <tr>
                            <td>${customer.name}</td>
                            <td>${customer.email}</td>
                            <td>${customer.phone}</td>
                            <td>
                                <button onclick="viewCustomerOrders('${customer.email}')" class="view-btn">View Orders</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading customers:', error);
        alert('Error loading customers');
    }
}

// Order Status Update
async function updateOrderStatus(orderId, newStatus) {
    try {
        const supabaseClient = window.supabaseClient;
        if (!supabaseClient) {
            console.error('Supabase client not initialized');
            return;
        }
        const { error } = await supabaseClient
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) throw error;
        
        // Refresh orders list
        loadAllOrders();
        // Also refresh dashboard if we're showing it
        if (document.querySelector('.dashboard-content').style.display !== 'none') {
            loadDashboardStats();
            loadRecentOrders();
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Error updating order status');
    }
}

// Search functionality
const searchInput = document.querySelector('.search-bar input');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    // Get current active section
    const activeSection = document.querySelector('.section-content[style="display: block"]');
    if (!activeSection) return;

    // Apply search based on current section
    const tableRows = activeSection.querySelectorAll('table tbody tr');
    tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

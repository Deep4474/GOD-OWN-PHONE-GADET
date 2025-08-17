
// Wait for window.supabaseClient to be initialized
function waitForSupabase(maxAttempts = 10) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const check = () => {
            attempts++;
            if (window.supabaseClient) {
                resolve(window.supabaseClient);
            } else if (attempts >= maxAttempts) {
                reject(new Error('Supabase client not initialized after ' + maxAttempts + ' attempts'));
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}
// UI Helper Functions
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
}

function showMessage(message, type = 'error') {
    const container = document.getElementById('message-container');
    if (!container) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = message;

    container.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Initialize auth state
window.addEventListener('DOMContentLoaded', async () => {
    showLoading();
    try {
        // Wait for Supabase client to be initialized
        const supabaseClient = await waitForSupabase();
        if (!supabaseClient) {
            throw new Error('Supabase client not initialized');
        }

        // Check auth state
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;

        if (session) {
            const { user } = session;
            // Load user profile
            const { data: profile, error: profileError } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();
            
            if (profileError) throw profileError;

            if (profile) {
                // Store profile data
                localStorage.setItem('userProfile', JSON.stringify(profile));
                
                // Update UI
                const navLogin = document.getElementById('nav-login');
                if (navLogin) navLogin.innerText = 'Profile';
                
                const userProfileHeader = document.getElementById('user-profile-header');
                if (userProfileHeader) {
                    userProfileHeader.innerHTML = `
                        <img src="${profile.profile_image || 'https://placehold.co/40x40?text=No+Img'}" 
                            alt="Profile" 
                            style="width:32px;height:32px;border-radius:50%;margin-right:8px;">
                        <span>${profile.full_name || user.email}</span>
                    `;
                }

                showMessage('Welcome back, ' + (profile.full_name || user.email), 'success');
            }
        }
    } catch (error) {
        console.error('Auth state check failed:', error);
        showMessage(error.message || 'Failed to load user profile');
    } finally {
        hideLoading();
    }

    // Listen for auth changes
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            location.reload();
        } else if (event === 'SIGNED_OUT') {
            localStorage.removeItem('userProfile');
            location.reload();
        }
    });
});

// Helper functions for common database operations

// Products
async function getProducts() {
    const supabaseClient = await waitForSupabase();
    const { data, error } = await supabaseClient
        .from('products')
        .select('*')
    if (error) throw error
    return data
}

// Orders
async function createOrder(orderData) {
    const supabaseClient = await waitForSupabase();
    
    try {
        // Validate required fields
        const requiredFields = ['product_id', 'quantity', 'delivery_option', 'email', 'name', 'phone', 'total_amount'];
        const missingFields = requiredFields.filter(field => !orderData[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Create the order
        const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .insert([orderData])
            .select()
            .single();
        
        if (orderError) {
            console.error('Order creation error:', orderError);
            throw new Error('Failed to create order');
        }

        return [order];
    } catch (error) {
        console.error('Error in createOrder:', error);
        throw error;
    }
}

async function getUserOrders() {
    const supabaseClient = await waitForSupabase();
    const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
    if (error) throw error
    return data
}

// Customer Messages
async function sendMessage(messageData) {
    const supabaseClient = await waitForSupabase();
    const { data: { user } } = await supabaseClient.auth.getUser();
    const { data, error } = await supabaseClient
        .from('customerMessages')
        .insert([{
            ...messageData,
            user_id: user?.id
        }])
    if (error) throw error
    return data
}

async function getUserMessages() {
    const supabaseClient = await waitForSupabase();
    const { data, error } = await supabaseClient
        .from('customerMessages')
        .select('*')
        .order('created_at', { ascending: false })
    if (error) throw error
    return data
}

// Admin Functions
async function isUserAdmin() {
    const supabaseClient = await waitForSupabase();
    const { data: { user } } = await supabaseClient.auth.getUser();
    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user?.id)
        .single()
    if (error) throw error
    return profile?.is_admin || false
}

async function addProduct(productData) {
    const supabaseClient = await waitForSupabase();
    const { data, error } = await supabaseClient
        .from('products')
        .insert([productData])
    if (error) throw error
    return data
}

async function updateProduct(id, updates) {
    const supabaseClient = await waitForSupabase();
    const { data, error } = await supabaseClient
        .from('products')
        .update(updates)
        .eq('id', id)
    if (error) throw error
    return data
}

async function deleteProduct(id) {
    const supabaseClient = await waitForSupabase();
    const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', id)
    if (error) throw error
}

// Make functions available globally
window.getProducts = getProducts;
window.createOrder = createOrder;
window.getUserOrders = getUserOrders;
window.sendMessage = sendMessage;
window.getUserMessages = getUserMessages;
window.isUserAdmin = isUserAdmin;
window.addProduct = addProduct;
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;

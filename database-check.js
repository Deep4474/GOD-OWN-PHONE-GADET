// Database Structure Verification
async function checkDatabaseStructure() {
    const results = {
        connection: false,
        products: false,
        users: false,
        errors: []
    };

    try {
        // Wait for supabase client to be initialized
        if (!window.supabaseClient) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!window.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }
        }

        // Test connection with auth check first
        const { data: session } = await window.supabaseClient.auth.getSession();
        console.log('Auth session check:', session ? 'Active' : 'None');

        // Test products table
        const { data: products, error: productsError } = await window.supabaseClient
            .from('products')
            .select('id, name, description, price, image_url, stock')
            .limit(1);

        if (productsError) {
            results.errors.push(`Products table error: ${productsError.message}`);
        } else {
            results.products = true;
            results.connection = true;
            if (products && products[0]) {
                console.log('Sample product:', products[0]);
            }
        }

        // Test profiles table with RLS
        const { data: profiles, error: profilesError } = await window.supabaseClient
            .from('profiles')
            .select('id')
            .limit(1);

        if (profilesError && profilesError.code === 'PGRST301') {
            // This is normal for unauthenticated users
            console.log('Profiles access restricted (normal for anonymous users)');
            results.users = true;
        } else if (profilesError) {
            results.errors.push(`Profiles table error: ${profilesError.message}`);
        } else {
            results.users = true;
            console.log('Profiles table accessible');
        }

        return results;

    } catch (error) {
        results.errors.push(`Unexpected error: ${error.message}`);
        return results;
    }
}

// Run the check when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Checking database structure...');
    const results = await checkDatabaseStructure();
    
    // Create status display
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px;
        border-radius: 5px;
        font-family: monospace;
        z-index: 9999;
    `;

    let statusHTML = `
        <h3>Database Status</h3>
        <p>Connection: ${results.connection ? '✅' : '❌'}</p>
        <p>Products Table: ${results.products ? '✅' : '❌'}</p>
        <p>Users Table: ${results.users ? '✅' : '❌'}</p>
    `;

    if (results.errors.length > 0) {
        statusHTML += '<h4>Errors:</h4><ul>';
        results.errors.forEach(error => {
            statusHTML += `<li>${error}</li>`;
        });
        statusHTML += '</ul>';
    }

    statusDiv.innerHTML = statusHTML;
    document.body.appendChild(statusDiv);

    // Auto-hide after 10 seconds
    setTimeout(() => {
        statusDiv.style.opacity = '0';
        statusDiv.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => statusDiv.remove(), 500);
    }, 10000);
});

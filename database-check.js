// Database Structure Verification
async function checkDatabaseStructure() {
    const results = {
        connection: false,
        products: false,
        users: false,
        errors: []
    };

    try {
        // Test connection
        const { data: connectionTest, error: connectionError } = await supabaseClient
            .from('products')
            .select('count', { count: 'exact' });

        if (connectionError) {
            results.errors.push(`Connection error: ${connectionError.message}`);
        } else {
            results.connection = true;
        }

        // Check products table
        const { data: products, error: productsError } = await supabaseClient
            .from('products')
            .select('id, name, description, price, image_url, stock')
            .limit(1);

        if (productsError) {
            results.errors.push(`Products table error: ${productsError.message}`);
        } else {
            results.products = true;
            console.log('Sample product:', products[0]);
        }

        // Check users table
        const { data: users, error: usersError } = await supabaseClient
            .from('users')
            .select('id, email, name, verified')
            .limit(1);

        if (usersError) {
            results.errors.push(`Users table error: ${usersError.message}`);
        } else {
            results.users = true;
            console.log('Users table exists');
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

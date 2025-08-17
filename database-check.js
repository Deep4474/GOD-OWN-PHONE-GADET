// Check if we're on a mobile device
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Function to show error message
function showError(message, isTemporary = true) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: ${isMobile ? '0' : '20px'};
        left: ${isMobile ? '0' : '50%'};
        right: ${isMobile ? '0' : 'auto'};
        transform: ${isMobile ? 'none' : 'translateX(-50%)'};
        padding: 15px;
        background: #f44336;
        color: white;
        text-align: center;
        z-index: 9999;
        border-radius: ${isMobile ? '0' : '4px'};
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        font-size: ${isMobile ? '14px' : '16px'};
        max-width: ${isMobile ? '100%' : '400px'};
    `;
    errorDiv.innerHTML = `
        ${message}
        <button onclick="location.reload()" style="
            margin-left: 10px;
            padding: 5px 10px;
            border: none;
            background: white;
            color: #f44336;
            border-radius: 3px;
            cursor: pointer;
        ">
            Retry
        </button>
    `;
    document.body.appendChild(errorDiv);

    if (isTemporary) {
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            errorDiv.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => errorDiv.remove(), 500);
        }, 5000);
    }
}

// Database Structure Verification
async function checkDatabaseStructure() {
    const results = {
        connection: false,
        products: false,
        users: false,
        errors: []
    };

    try {
        // Wait for supabase client to be initialized with multiple retries
        let retries = 0;
        const maxRetries = 5;
        
        while (!window.supabaseClient && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries++;
            
            if (!window.supabaseClient && retries === maxRetries) {
                const errorMessage = isMobile
                    ? 'Unable to connect. Please check your internet connection.'
                    : 'Database connection failed. Please refresh the page.';
                showError(errorMessage, false);
                throw new Error('Supabase client not initialized after retries');
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
        ${isMobile ? 'bottom: 0; left: 0; right: 0;' : 'top: 10px; right: 10px;'}
        background: ${isMobile ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)'};
        color: white;
        padding: ${isMobile ? '15px 10px' : '20px'};
        border-radius: ${isMobile ? '10px 10px 0 0' : '5px'};
        font-family: system-ui, -apple-system, sans-serif;
        z-index: 9999;
        font-size: ${isMobile ? '14px' : '16px'};
        backdrop-filter: blur(5px);
        box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
        transition: transform 0.3s ease-out;
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

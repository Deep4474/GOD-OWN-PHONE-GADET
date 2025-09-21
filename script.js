// Toggle auth modal on user icon click
// Backend host for API requests
const BACKEND_HOST = 'https://glittery-torrone-d1184e.netlify.app'; // Change to your backend URL if different

// Example: Fetch users from backend
// Example: Fetch users from backend with Supabase auth token
async function fetchUsers() {
    // Get Supabase session (replace with your actual Supabase client usage)
    // const { data: { session } } = await supabase.auth.getSession();
    // const token = session?.access_token;
    const token = localStorage.getItem('supabase_token'); // Example: get token from localStorage
    fetch(`${BACKEND_HOST}/api/users`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
        .then(res => res.json())
        .then(data => {
            console.log('Users:', data);
        })
        .catch(err => console.error('API error:', err));
}
document.addEventListener('DOMContentLoaded', function() {
    var userIcon = document.getElementById('user-icon');
    var authModal = document.getElementById('supabase-auth-modal');
    if (userIcon && authModal) {
        userIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            authModal.classList.toggle('hidden');
        });
        // Hide modal if clicking outside
        document.addEventListener('click', function(e) {
            if (!userIcon.contains(e.target)) {
                authModal.classList.add('hidden');
            }
        });
    }
});


let advertIndex = 0;
const adverts = [
    "Welcome to Lamar Phone & Gadget!",
    "Check out our latest deals!",
    "Sign up for exclusive offers!"
];
function showAdvert() {
    const advertMessage = document.getElementById('advert-message');
    advertMessage.textContent = adverts[0]; // Show only first advert, no auto-rotation
}
window.onload = showAdvert;

// Placeholder for showHeaderAccountInfo to prevent ReferenceError
function showHeaderAccountInfo() {
    // TODO: Implement account info display logic
    console.log('showHeaderAccountInfo called');
}

// Show Google Sign-In button when user icon is clicked
document.addEventListener('DOMContentLoaded', function() {
    var userIcon = document.getElementById('menu-user-icon');
    var googleSignin = document.getElementById('user-google-signin');
    if (userIcon && googleSignin) {
        userIcon.addEventListener('click', function() {
            googleSignin.style.display = (googleSignin.style.display === 'none') ? 'block' : 'none';
        });
    }
});

// Google Sign-In callback
function handleGoogleSignIn(response) {
    // Decode credential (JWT) to get user info
    const data = parseJwt(response.credential);
    alert('Signed in as: ' + data.email);
}

// Helper to decode JWT
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

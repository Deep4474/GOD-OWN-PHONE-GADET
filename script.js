
let products = [];
let advertIndex = 0;

async function fetchProducts() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
        },
    });
    if (!res.ok) return [];
    return await res.json();
}

function showAdvert(idx) {
    if (!products.length) return;
    const product = products[idx];
    document.getElementById('advert-img').src = product.image_url || 'https://via.placeholder.com/150';
    document.getElementById('advert-img').alt = product.name;
    document.getElementById('advert-title').textContent = product.name;
    document.getElementById('advert-price').textContent = `$${Number(product.price).toFixed(2)}`;
    document.getElementById('advert-desc').textContent = product.description;
}

function startAdvertCycle() {
    showAdvert(0);
    setInterval(() => {
        advertIndex = (advertIndex + 1) % products.length;
        showAdvert(advertIndex);
    }, 3500);
}

function renderProducts() {
    const list = document.getElementById('products-list');
    list.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img class="product-img" src="${product.image_url || 'https://via.placeholder.com/160'}" alt="${product.name}">
            <div class="product-name">${product.name}</div>
            <div class="product-price">$${Number(product.price).toFixed(2)}</div>
            <button class="buy-btn">Buy Now</button>
        `;
        list.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    products = await fetchProducts();
    renderProducts();
    startAdvertCycle();
    // Auth modal logic
    const registerModal = document.getElementById('register-modal');
    const loginModal = document.getElementById('login-modal');
    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');
    const closeRegister = document.getElementById('close-register');
    const closeLogin = document.getElementById('close-login');
        // Registration form logic
        const registerForm = document.getElementById('register-form');
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            try {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password
                });
                if (error) {
                    alert('Registration failed: ' + error.message);
                } else {
                    alert('Registration successful! Please check your email to confirm your account.');
                    registerForm.reset();
                    registerModal.style.display = 'none';
                }
            } catch (err) {
                alert('Registration error: ' + err.message);
            }
        });

    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'flex';
    });
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });
    closeRegister.addEventListener('click', () => {
        registerModal.style.display = 'none';
    });
    closeLogin.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === registerModal) registerModal.style.display = 'none';
        if (e.target === loginModal) loginModal.style.display = 'none';
    });
});
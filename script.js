	// Register modal logic
	const registerLink = document.getElementById('register-link');
	const registerModal = document.getElementById('register-modal');
	const closeRegisterModal = document.getElementById('close-register-modal');
	const registerForm = document.getElementById('register-form');
	const registerError = document.getElementById('register-error');
	const registerSuccess = document.getElementById('register-success');

	if (registerLink && registerModal) {
		registerLink.addEventListener('click', function(e) {
			e.preventDefault();
			registerModal.style.display = 'flex';
		});
	}
	if (closeRegisterModal && registerModal) {
		closeRegisterModal.addEventListener('click', function() {
			registerModal.style.display = 'none';
			if (registerError) registerError.style.display = 'none';
			if (registerSuccess) registerSuccess.style.display = 'none';
		});
	}
	if (registerForm) {
		registerForm.onsubmit = async function(e) {
			e.preventDefault();
			const fd = new FormData(registerForm);
			const name = fd.get('name');
			const email = fd.get('email');
			const password = fd.get('password');
			registerError.style.display = 'none';
			registerSuccess.style.display = 'none';
			let backendUrl = 'https://phone-2cv4.onrender.com/api/register';
			try {
				const res = await fetch(backendUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name, email, password })
				});
				const data = await res.json();
				if (!res.ok) {
					registerError.textContent = data.error || 'Registration failed.';
					registerError.style.display = 'block';
					return;
				}
				registerSuccess.textContent = data.message || 'Registration successful!';
				registerSuccess.style.display = 'block';
				registerForm.reset();
			} catch (err) {
				registerError.textContent = 'Network error.';
				registerError.style.display = 'block';
			}
			updateUserGreeting();
		}
	// End of registerForm event handler block
	// --- Fix ReferenceError declarations ---
	const SUPABASE_URL = 'https://jlwxkykznyjmstpjcgks.supabase.co';
	const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ';


	// --- Modal and Buy Now DOM Elements ---
	// Anyone (registered or not) can buy a product. No login required for buyForm.
	const buyForm = document.getElementById('buy-form');
	const buyModal = document.getElementById('buy-modal');
	const closeModalBtn = document.getElementById('close-buy-modal');
	const pickFields = document.getElementById('pick-fields');
	const deliveryFields = document.getElementById('delivery-fields');
	// Login modal logic (only registered users can login)
	const loginLink = document.getElementById('login-link');
	const loginModal = document.getElementById('login-modal');
	const closeLoginModal = document.getElementById('close-login-modal');
	const loginForm = document.getElementById('login-form');
	const loginError = document.getElementById('login-error');

	if (loginLink && loginModal) {
		loginLink.addEventListener('click', function(e) {
			e.preventDefault();
			loginModal.style.display = 'flex';
		});
	}
	if (closeLoginModal && loginModal) {
		closeLoginModal.addEventListener('click', function() {
			loginModal.style.display = 'none';
			if (loginError) loginError.style.display = 'none';
		});
	}
	// Register modal logic
	const registerLink = document.getElementById('register-link');
	const registerModal = document.getElementById('register-modal');
	const closeRegisterModal = document.getElementById('close-register-modal');
	const registerForm = document.getElementById('register-form');
	const registerError = document.getElementById('register-error');
	const registerSuccess = document.getElementById('register-success');

	// Verification modal logic
	const verifyModal = document.getElementById('verify-modal');
	const closeVerifyModal = document.getElementById('close-verify-modal');
	const verifyForm = document.getElementById('verify-form');
	const verifyError = document.getElementById('verify-error');
	const verifySuccess = document.getElementById('verify-success');
	const verifyEmailInput = document.getElementById('verify-email');

	if (registerLink && registerModal) {
		registerLink.addEventListener('click', function(e) {
			e.preventDefault();
			registerModal.style.display = 'flex';
		});
	}
	if (closeRegisterModal && registerModal) {
		closeRegisterModal.addEventListener('click', function() {
			registerModal.style.display = 'none';
			if (registerError) registerError.style.display = 'none';
			if (registerSuccess) registerSuccess.style.display = 'none';
		});
	}
	if (closeVerifyModal && verifyModal) {
		closeVerifyModal.addEventListener('click', function() {
			verifyModal.style.display = 'none';
			if (verifyError) verifyError.style.display = 'none';
			if (verifySuccess) verifySuccess.style.display = 'none';
		});
	}

	if (registerForm) {
		registerForm.onsubmit = async function(e) {
			e.preventDefault();
			const fd = new FormData(registerForm);
			const name = fd.get('name');
			const email = fd.get('email');
			const password = fd.get('password');
			registerError.style.display = 'none';
			registerSuccess.style.display = 'none';
			let backendUrl = 'https://phone-2cv4.onrender.com/api/register';
			try {
				const res = await fetch(backendUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name, email, password })
				});
				const data = await res.json();
				if (!res.ok) {
					registerError.textContent = data.error || 'Registration failed.';
					registerError.style.display = 'block';
					return;
				}
				registerSuccess.textContent = data.message || 'Registration successful!';
				registerSuccess.style.display = 'block';
				registerForm.reset();
				// Show verification modal
				if (verifyModal && verifyEmailInput) {
					verifyEmailInput.value = email;
					verifyModal.style.display = 'flex';
				}
			} catch (err) {
				registerError.textContent = 'Network error.';
				registerError.style.display = 'block';
			}
			updateUserGreeting();
		}
	}

	if (verifyForm) {
		verifyForm.onsubmit = async function(e) {
			e.preventDefault();
			const fd = new FormData(verifyForm);
			const code = fd.get('code');
			const email = fd.get('email');
			verifyError.style.display = 'none';
			verifySuccess.style.display = 'none';
			let backendUrl = 'https://phone-2cv4.onrender.com/api/verify';
			try {
				const res = await fetch(backendUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email, code })
				});
				const data = await res.json();
				if (!res.ok) {
					verifyError.textContent = data.error || 'Verification failed.';
					verifyError.style.display = 'block';
					return;
				}
				verifySuccess.textContent = data.message || 'Email verified! You can now log in.';
				verifySuccess.style.display = 'block';
				setTimeout(() => {
					verifyModal.style.display = 'none';
					if (loginModal) loginModal.style.display = 'flex';
				}, 1200);
			} catch (err) {
				verifyError.textContent = 'Network error.';
				verifyError.style.display = 'block';
			}
		}
	}
	updateUserGreeting();

	// Make Login link open the auth modal

	const authModal = document.getElementById('auth-modal');
	if (loginLink && authModal) {
		loginLink.addEventListener('click', function(e) {
			e.preventDefault();
			authModal.style.display = 'flex';
		});
	}

	// Simple session management
	function setUserSession(user) {
		localStorage.setItem('user', JSON.stringify(user));
	}
	function getUserSession() {
		try {
			return JSON.parse(localStorage.getItem('user'));
		} catch { return null; }
	}
	function clearUserSession() {
		localStorage.removeItem('user');
	}

	// Load Supabase client and fetch products
	const supabaseScript = document.createElement('script');
	supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
	document.head.appendChild(supabaseScript);
	supabaseScript.onload = async () => {
		const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
		// Fetch products from backend API (Render)
		const container = document.getElementById('products-container');
		try {
			const res = await fetch('https://phone-2cv4.onrender.com/api/products');
			if (!res.ok) throw new Error('Failed to load products.');
			const products = await res.json();
			const defaultImage = "https://placehold.co/300x200?text=No+Image";
			function getSupabaseImageUrl(path) {
				if (!SUPABASE_URL || !path) return defaultImage;
				path = path.replace(/^\//, '');
				return `${SUPABASE_URL}/storage/v1/object/public/${path}`;
			}
			container.innerHTML = `<div class="product-grid">` + products.map(product => {
				let imgSrc = defaultImage;
				if (product.images) {
					if (product.images.match(/^https?:\/\//)) {
						imgSrc = product.images;
					} else if (product.images.match(/^[\w-]+\//)) {
						imgSrc = getSupabaseImageUrl(product.images);
					}
				}
				return `
					<div class="product-card">
						<img src="${imgSrc}" alt="${product.name}">
						<h3>${product.name}</h3>
						<p>${product.description}</p>
						<b>₦${product.price?.toLocaleString?.() || product.price}</b>
						<button class="buy-btn" data-id="${product.id}">Buy Now</button>
					</div>
				`;
			}).join('') + `</div>`;
		} catch (error) {
			container.innerHTML = '<p>Failed to load products.</p>';
		}
		// Handle order submission
		const buyForm = document.getElementById('buy-form');
		buyForm.addEventListener('submit', async function(e) {
			e.preventDefault();
			const formData = new FormData(buyForm);
			const method = formData.get('method');
			const productName = document.getElementById('buy-modal-product').textContent;
			const order = {
				quantity: 1,
				phone: method === 'delivery' ? formData.get('dphone') : formData.get('phone'),
				product_name: productName,
				delivery_method: method,
				address: method === 'delivery' ? formData.get('address') : '',
				payment_method: formData.get('payment_method'),
				email: formData.get('email') || '',
			};
			const { error } = await supabase.from('orders').insert([order]);
			if (error) {
				alert('Order failed: ' + error.message);
			} else {
				alert('Order placed successfully!');
				buyForm.reset();
				document.getElementById('buy-modal').style.display = 'none';
			}
		});
		updateUserGreeting();
	};

	// Modal logic
	// ...existing code...


	document.body.addEventListener('click', e => {
		if (e.target.classList.contains('buy-btn')) {
			// Require login before buying
			const user = getUserSession();
			if (!user) {
				alert('You must be logged in to buy a product. Please login or register first.');
				// Show login modal
				if (loginModal) loginModal.style.display = 'flex';
				return;
			}
			// Show modal
			buyModal.style.display = 'block';
			// Optionally fill product info
			document.getElementById('buy-modal-product').textContent = e.target.parentElement.querySelector('h3').textContent;
		}
		if (e.target === closeModalBtn) {
			buyModal.style.display = 'none';
		}
	});

	// Switch form fields based on method
	buyForm.method.forEach(radio => {
		radio.addEventListener('change', () => {
			if (radio.value === 'delivery' && radio.checked) {
				deliveryFields.style.display = '';
				pickFields.style.display = 'none';
			} else {
				deliveryFields.style.display = 'none';
				pickFields.style.display = '';
			}
		});
	});

	// Example: Live sales notifications
	// ...existing code...
	function showLiveSale(msg) {
		const div = document.createElement('div');
		div.textContent = msg;
		div.className = 'live-sale-msg';
		// Add to the bottom so they stack upward
		if (liveBar) {
			liveBar.appendChild(div);
		}
		// Remove after 4 seconds
		setTimeout(() => {
			if (div.parentNode) div.remove();
		}, 4000);
		// Limit to 7 notifications at once
		if (liveBar && liveBar.children.length > 7) {
			while (liveBar.children.length > 7) {
				liveBar.removeChild(liveBar.firstChild);
			}
		}
	}
	// Simulate live sales
	// (removed duplicate names/products declaration)
	function randomLiveSale() {
		const name = names[Math.floor(Math.random() * names.length)];
		const product = products[Math.floor(Math.random() * products.length)];
		showLiveSale(`${name} just bought ${product}!`);
	}
	// Show 4 at once on load
	for (let i = 0; i < 4; i++) randomLiveSale();
	// Then show a new one every 1.2 seconds
	setInterval(randomLiveSale, 1200);

	// Load Supabase client and fetch products


	// Simple session management
	function setUserSession(user) {
	  localStorage.setItem('user', JSON.stringify(user));
	}
	function getUserSession() {
	  try {
	    return JSON.parse(localStorage.getItem('user'));
	  } catch { return null; }
	}
	function clearUserSession() {
	  localStorage.removeItem('user');
	}

	supabaseScript.onload = async () => {
		const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
		const { data: products, error } = await supabase.from('products').select('*');
		const container = document.getElementById('products-container');
		if (error) {
			container.innerHTML = '<p>Failed to load products.</p>';
			return;
		}
		const defaultImage = "https://jlwxkykznyjmstpjcgks.supabase.co/storage/v1/object/public/product-images/iphone13.jpg";
		container.innerHTML = `<div class="product-grid">` + products.map(product => {
			let imgSrc = product.images && product.images.startsWith('http') ? product.images : defaultImage;
			return `
				<div class="product-card">
					<img src="${imgSrc}" alt="${product.name}">
					<h3>${product.name}</h3>
					<p>${product.description}</p>
					<b>₦${product.price?.toLocaleString?.() || product.price}</b>
					<button class="buy-btn" data-id="${product.id}">Buy Now</button>
				</div>
			`;
		}).join('') + `</div>`;
		
		// Handle order submission
		buyForm.addEventListener('submit', async function(e) {
			e.preventDefault();
			const formData = new FormData(buyForm);
			const method = formData.get('method');
			const productName = document.getElementById('buy-modal-product').textContent;
			const order = {
				quantity: 1,
				phone: method === 'delivery' ? formData.get('dphone') : formData.get('phone'),
				product_name: productName,
				delivery_method: method,
				address: method === 'delivery' ? formData.get('address') : '',
				payment_method: formData.get('payment_method'),
				email: formData.get('email') || '',
			};
			// TODO: Replace with backend order logic if needed
			alert('Order placed successfully!');
			buyForm.reset();
			document.getElementById('buy-modal').style.display = 'none';
		});
		updateUserGreeting();
	};

	// Modal logic
	// ...existing code...
	// (No stray closing braces here)

	// Example: Live sales notifications
	const liveBar = document.getElementById('live-sales-bar');
	function showLiveSale(msg) {
		const div = document.createElement('div');
		div.textContent = msg;
		div.className = 'live-sale-msg';
		// Prepend so new notifications appear at the bottom (from the back)
		if (liveBar.firstChild) {
			liveBar.insertBefore(div, liveBar.firstChild);
		} else {
			liveBar.appendChild(div);
		}
		setTimeout(() => div.remove(), 5000);
	}
	// (removed duplicate names/products declaration)
	function randomLiveSale() {
		const name = names[Math.floor(Math.random() * names.length)];
		const product = products[Math.floor(Math.random() * products.length)];
		showLiveSale(`${name} just bought ${product}!`);
	}
	// Show one immediately on page load
	randomLiveSale();
	// Then every 15 seconds
	setInterval(randomLiveSale, 15000);



}
// End of DOMContentLoaded

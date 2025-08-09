// Set your Render public API base URL
const API_BASE_URL = 'https://phone-2cv4.onrender.com';

// Order form logic (send order to backend, which saves to Supabase)
function setupOrderForm() {
	var orderForm = document.getElementById('order-form');
	if (!orderForm) return;
	orderForm.onsubmit = async function(e) {
		e.preventDefault();
		var fd = new FormData(orderForm);
		var order = {};
		fd.forEach(function(value, key) { order[key] = value; });
		if (!order.email || !order.product_name) {
			alert('Email and product name are required!');
			return;
		}
		try {
			var res = await fetch(API_BASE_URL + '/api/order', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(order)
			});
			var data = await res.json();
			if (!res.ok) {
				alert(data.error || 'Order failed.');
				return;
			}
			alert('Order placed successfully!');
			orderForm.reset();
		} catch (err) {
			alert('Network error.');
		}
	};
}

window.addEventListener('DOMContentLoaded', function() {
	setupOrderForm();
	// ...existing code...
});
// Supabase config
const SUPABASE_URL = 'https://jlwxkykznyjmstpjcgks.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ';

window.addEventListener('DOMContentLoaded', function() {
	// Registration, login, verification logic (already present)
	// ...existing code...

	// Product display logic: Try Supabase, fallback to backend
	var container = document.getElementById('products-container');
	if (!container) return;
	var supabaseScript = document.createElement('script');
	supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
	document.head.appendChild(supabaseScript);
	supabaseScript.onload = function() {
		var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
		supabase.from('products').select('*').then(function(result) {
			var products = result.data || [];
			if (!Array.isArray(products) || products.length === 0) {
				// fallback to backend
				fetch(API_BASE_URL + '/api/products')
					.then(function(res) { return res.json(); })
					.then(renderProducts)
					.catch(function() {
						container.innerHTML = '<p>Failed to load products.</p>';
					});
				return;
			}
			renderProducts(products);
		}).catch(function() {
			// fallback to backend
			fetch(API_BASE_URL + '/api/products')
				.then(function(res) { return res.json(); })
				.then(renderProducts)
				.catch(function() {
					container.innerHTML = '<p>Failed to load products.</p>';
				});
		});
	};

	function renderProducts(products) {
		if (!Array.isArray(products) || products.length === 0) {
			container.innerHTML = '<p>No products found.</p>';
			return;
		}
		container.innerHTML = '<div class="product-grid">' + products.map(function(product) {
			var imgSrc = product.images && product.images.startsWith('http')
				? product.images
				: (product.images ? SUPABASE_URL + '/storage/v1/object/public/' + product.images : 'https://placehold.co/300x200?text=No+Image');
			return '<div class="product-card">' +
				'<img src="' + imgSrc + '" alt="' + (product.name || '') + '">' +
				'<h3>' + (product.name || '') + '</h3>' +
				'<p>' + (product.description || '') + '</p>' +
				'<b>₦' + (product.price ? product.price.toLocaleString() : '') + '</b>' +
			'</div>';
		}).join('') + '</div>';
	}
});
// ...existing code...

// Product display logic (no Supabase)
window.addEventListener('DOMContentLoaded', function() {
	var container = document.getElementById('products-container');
	if (!container) return;
	fetch(API_BASE_URL + '/api/products')
		.then(function(res) { return res.json(); })
		.then(function(products) {
			if (!Array.isArray(products) || products.length === 0) {
				container.innerHTML = '<p>No products found.</p>';
				return;
			}
			container.innerHTML = '<div class="product-grid">' + products.map(function(product) {
				var imgSrc = product.images && product.images.startsWith('http') ? product.images : 'https://placehold.co/300x200?text=No+Image';
				return '<div class="product-card">' +
					'<img src="' + imgSrc + '" alt="' + (product.name || '') + '">' +
					'<h3>' + (product.name || '') + '</h3>' +
					'<p>' + (product.description || '') + '</p>' +
					'<b>₦' + (product.price ? product.price.toLocaleString() : '') + '</b>' +
				'</div>';
			}).join('') + '</div>';
		})
		.catch(function() {
			container.innerHTML = '<p>Failed to load products.</p>';
		});
});
// Register modal logic
var registerLink = document.getElementById('register-link');
var registerModal = document.getElementById('register-modal');
var closeRegisterModal = document.getElementById('close-register-modal');
var registerForm = document.getElementById('register-form');
var registerError = document.getElementById('register-error');
var registerSuccess = document.getElementById('register-success');

// Verification modal logic
var verifyModal = document.getElementById('verify-modal');
var closeVerifyModal = document.getElementById('close-verify-modal');
var verifyForm = document.getElementById('verify-form');
var verifyError = document.getElementById('verify-error');
var verifySuccess = document.getElementById('verify-success');
var verifyEmailInput = document.getElementById('verify-email');

// Login modal logic
var loginLink = document.getElementById('login-link');
var loginModal = document.getElementById('login-modal');
var closeLoginModal = document.getElementById('close-login-modal');
var loginForm = document.getElementById('login-form');
var loginError = document.getElementById('login-error');

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
if (closeLoginModal && loginModal) {
	closeLoginModal.addEventListener('click', function() {
		loginModal.style.display = 'none';
		if (loginError) loginError.style.display = 'none';
	});
}

if (registerForm) {
	registerForm.onsubmit = async function(e) {
		e.preventDefault();
		var fd = new FormData(registerForm);
		var name = fd.get('name');
		var email = fd.get('email');
		var password = fd.get('password');
		registerError.style.display = 'none';
		registerSuccess.style.display = 'none';
	var backendUrl = API_BASE_URL + '/api/register';
		try {
			var res = await fetch(backendUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: name, email: email, password: password })
			});
			var data = await res.json();
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
	}
}

if (verifyForm) {
	verifyForm.onsubmit = async function(e) {
		e.preventDefault();
		var fd = new FormData(verifyForm);
		var code = fd.get('code');
		var email = fd.get('email');
		verifyError.style.display = 'none';
		verifySuccess.style.display = 'none';
	var backendUrl = API_BASE_URL + '/api/verify';
		try {
			var res = await fetch(backendUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: email, code: code })
			});
			var data = await res.json();
			if (!res.ok) {
				verifyError.textContent = data.error || 'Verification failed.';
				verifyError.style.display = 'block';
				return;
			}
			verifySuccess.textContent = data.message || 'Email verified! You can now log in.';
			verifySuccess.style.display = 'block';
			setTimeout(function() {
				verifyModal.style.display = 'none';
				if (loginModal) loginModal.style.display = 'flex';
			}, 1200);
		} catch (err) {
			verifyError.textContent = 'Network error.';
			verifyError.style.display = 'block';
		}
	}
}

if (loginForm) {
	loginForm.onsubmit = async function(e) {
		e.preventDefault();
		var fd = new FormData(loginForm);
		var email = fd.get('email');
		var password = fd.get('password');
		loginError.style.display = 'none';
		try {
			var backendUrl = API_BASE_URL + '/api/login';
			var res = await fetch(backendUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: email, password: password })
			});
			var data = await res.json();
			if (!res.ok) {
				loginError.textContent = data.error || 'Login failed.';
				loginError.style.display = 'block';
				return;
			}
			loginModal.style.display = 'none';
			alert('Login successful!');
		} catch (err) {
			loginError.textContent = 'Network error.';
			loginError.style.display = 'block';
		}
	}
}

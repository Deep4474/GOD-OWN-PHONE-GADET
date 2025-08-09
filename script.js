// Add logout button and user info display
function showUserInfo(user) {
	let userInfoDiv = document.getElementById('user-info');
	if (!userInfoDiv) {
		userInfoDiv = document.createElement('div');
		userInfoDiv.id = 'user-info';
		userInfoDiv.style.margin = '16px 0';
		document.body.prepend(userInfoDiv);
	}
	// Fetch full user profile from backend
	fetch(API_BASE_URL + '/api/user/' + user.id)
		.then(res => res.json())
		.then(profile => {
			userInfoDiv.innerHTML = `
				<span>Welcome, ${profile.name || user.email}</span><br>
				<b>Email:</b> ${profile.email}<br>
				<b>Address:</b> ${profile.address || ''}<br>
				<img src="${profile.profile_image || 'https://placehold.co/100x100?text=No+Image'}" alt="Profile" style="width:100px;height:100px;border-radius:50%;"><br>
				<button id="logout-btn" style="margin:10px 0;">Logout</button>
				<button id="edit-profile-btn">Edit Profile</button>
				<div id="profile-form-container"></div>
			`;
			document.getElementById('logout-btn').onclick = async function() {
				await supabaseClient.auth.signOut();
				userInfoDiv.remove();
				showAuthUI();
			};
			document.getElementById('edit-profile-btn').onclick = function() {
				showProfileForm(profile);
			};
		});
}

function showProfileForm(profile) {
	const container = document.getElementById('profile-form-container');
	container.innerHTML = `
		<form id="profile-update-form" style="margin-top:10px;">
			<label>Name: <input type="text" name="name" value="${profile.name || ''}"></label><br>
			<label>Address: <input type="text" name="address" value="${profile.address || ''}"></label><br>
			<label>Profile Image URL: <input type="text" name="profile_image" value="${profile.profile_image || ''}"></label><br>
			<button type="submit">Save</button>
		</form>
		<div id="profile-update-msg"></div>
	`;
	document.getElementById('profile-update-form').onsubmit = async function(e) {
		e.preventDefault();
		const fd = new FormData(e.target);
		const updates = {
			name: fd.get('name'),
			address: fd.get('address'),
			profile_image: fd.get('profile_image')
		};
		const res = await fetch(API_BASE_URL + '/api/user/' + profile.id, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updates)
		});
		const data = await res.json();
		const msgDiv = document.getElementById('profile-update-msg');
		if (res.ok) {
			msgDiv.textContent = 'Profile updated!';
			showUserInfo(data.user);
		} else {
			msgDiv.textContent = data.error || 'Update failed.';
		}
	};
}
// Set your Render public API base URL
const API_BASE_URL = 'https://phone-2cv4.onrender.com';

let supabaseClient;
window.addEventListener('DOMContentLoaded', function() {
	if (window.supabase) {
		supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
		checkAuthState();
	} else {
		var supabaseScript = document.createElement('script');
		supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
		document.head.appendChild(supabaseScript);
		supabaseScript.onload = function() {
			supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
			checkAuthState();
		};
	}
});

function checkAuthState() {
	supabaseClient.auth.getSession().then(({ data }) => {
		if (data.session && data.session.user) {
			hideAuthUI();
			showUserInfo(data.session.user);
		} else {
			showAuthUI();
			let userInfoDiv = document.getElementById('user-info');
			if (userInfoDiv) userInfoDiv.remove();
		}
	});
}

function hideAuthUI() {
	var loginLink = document.getElementById('login-link');
	var registerLink = document.getElementById('register-link');
	var loginModal = document.getElementById('login-modal');
	var registerModal = document.getElementById('register-modal');
	if (loginLink) loginLink.style.display = 'none';
	if (registerLink) registerLink.style.display = 'none';
	if (loginModal) loginModal.style.display = 'none';
	if (registerModal) registerModal.style.display = 'none';
}

function showAuthUI() {
	var loginLink = document.getElementById('login-link');
	var registerLink = document.getElementById('register-link');
	if (loginLink) loginLink.style.display = '';
	if (registerLink) registerLink.style.display = '';
}

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
		try {
			const { data, error } = await supabaseClient.auth.signUp({ email, password, options: { data: { name } } });
			if (error) {
				registerError.textContent = error.message || 'Registration failed.';
				registerError.style.display = 'block';
				return;
			}
			registerSuccess.textContent = 'Registration successful! Please check your email to verify your account.';
			registerSuccess.style.display = 'block';
			registerForm.reset();
			hideAuthUI();
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
			const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
			if (error) {
				loginError.textContent = error.message || 'Login failed.';
				loginError.style.display = 'block';
				return;
			}
			loginModal.style.display = 'none';
			hideAuthUI();
			alert('Login successful!');
		} catch (err) {
			loginError.textContent = 'Network error.';
			loginError.style.display = 'block';
		}
	}
}

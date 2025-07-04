const API_BASE = "https://phone-2cv4.onrender.com";

let currentUser = JSON.parse(localStorage.getItem("user")) || null;

document.addEventListener("DOMContentLoaded", () => {
  if (currentUser) {
    document.getElementById("welcome").textContent = `Hi, ${currentUser.email.split("@")[0]}`;
    showSection("products-section");
  }

  setupAuthHandlers();
  fetchAndRenderProducts();
  setupUIEvents();
});

function showSection(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function setupAuthHandlers() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const verifyBtn = document.getElementById("verify-btn");

  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = loginForm["login-email"].value;
    const password = loginForm["login-password"].value;

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("user", JSON.stringify(data.user));
      currentUser = data.user;
      document.getElementById("welcome").textContent = `Hi, ${currentUser.email.split("@")[0]}`;
      showSection("products-section");
    } catch (err) {
      document.getElementById("login-message").textContent = err.message;
    }
  };

  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: registerForm.name.value,
      email: registerForm.email.value,
      state: registerForm.state.value,
      lga: registerForm.lga.value,
      address: registerForm.address.value,
      phone: registerForm.phone.value,
      password: registerForm.password.value
    };

    if (payload.password !== registerForm["confirm-password"].value) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      alert("Registered! Please verify your email.");
      document.getElementById("verify-email").value = payload.email;
      showSection("verify-section");
    } catch (err) {
      alert(err.message);
    }
  };

  verifyBtn.onclick = async () => {
    const email = document.getElementById("verify-email").value;
    const code = document.getElementById("verification-code").value;

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      alert("Email verified successfully!");
      showSection("login-section");
    } catch (err) {
      alert(err.message);
    }
  };
}

function fetchAndRenderProducts() {
  fetch(`${API_BASE}/api/products`)
    .then(res => res.json())
    .then(products => {
      const container = document.getElementById("product-list");
      container.innerHTML = "";

      products.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <img src="${p.image}" alt="${p.name}" style="width:100%;height:200px;object-fit:cover;">
          <h4>${p.name}</h4>
          <p>₦${p.price.toLocaleString()}</p>
          <button class="btn-primary" onclick="selectProduct('${p._id}', '${p.name}', ${p.price})">Buy Now</button>
        `;
        container.appendChild(card);
      });
    })
    .catch(() => alert("Unable to fetch products. Please try again later."));
}

function selectProduct(id, name, price) {
  showSection("buy-section");
  document.getElementById("selected-product-name").textContent = name;
  document.getElementById("selected-product-price").textContent = `₦${price.toLocaleString()}`;

  document.getElementById("place-order-btn").onclick = async () => {
    const quantity = parseInt(document.getElementById("quantity").value);
    const option = document.getElementById("buy-option").value;
    const method = document.getElementById("payment-method").value;
    const email = document.getElementById("order-email").value;
    const phone = document.getElementById("order-phone").value;

    if (!option || !method || !email || !phone) return alert("Fill all fields to place an order.");

    const total = price * quantity * (option === "Delivery" ? 1.5 : 1.2);

    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          email,
          phone,
          quantity,
          method,
          deliveryOption: option,
          totalAmount: total
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order error");

      alert("Order placed successfully!");
      showSection("products-section");
    } catch (err) {
      alert(err.message);
    }
  };
}

document.getElementById("customer-care-message-form").onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById("customer-care-name").value;
  const email = document.getElementById("customer-care-email").value;
  const text = document.getElementById("customer-care-message").value;

  try {
    const res = await fetch(`${API_BASE}/api/support/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, text })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Send failed");

    document.getElementById("customer-care-history").innerHTML += `
      <div><b>${name}</b>: ${text}</div>
    `;
    document.getElementById("customer-care-message").value = "";
  } catch (err) {
    alert(err.message);
  }
};

function setupUIEvents() {
  document.getElementById("logout-btn").onclick = () => {
    localStorage.removeItem("user");
    location.reload();
  };
  document.getElementById("menu-toggle").onclick = () => {
    document.getElementById("menu-dropdown").classList.toggle("hidden");
  };
  document.getElementById("show-register-link").onclick = () => showSection("register-section");
  document.getElementById("show-login-link").onclick = () => showSection("login-section");
  document.getElementById("show-login-link-2").onclick = () => showSection("login-section");

  document.getElementById("customer-care-btn").onclick = () => {
    document.getElementById("customer-care-modal").style.display = "flex";
  };
  document.getElementById("close-customer-care").onclick = () => {
    document.getElementById("customer-care-modal").style.display = "none";
  };
}

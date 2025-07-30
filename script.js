// Show selected category label above product grid
const categoryFilter = document.getElementById('category-filter');
const selectedCategoryLabel = document.getElementById('selected-category-label');
categoryFilter.addEventListener('change', function() {
  filterAndRenderProducts();
});

// Ensure products are loaded and shown on page load if already logged in
document.addEventListener('DOMContentLoaded', function() {
  if (isLoggedIn()) {
    showProducts();
    loadProducts();
  }
});
// --- Auth Gate for Main Content ---
function showMainContent() {
  document.getElementById('main-content').style.display = 'block';
  document.getElementById('auth-section').style.display = 'none';
}
function showAuthSection() {
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('auth-section').style.display = 'block';
}
function isLoggedIn() {
  return !!localStorage.getItem('token');
}
function checkAuthOnLoad() {
  if (isLoggedIn()) {
    showMainContent();
  } else {
    showAuthSection();
  }
}
window.addEventListener('DOMContentLoaded', checkAuthOnLoad);

// Hide menu and menu toggle on login section
function showLoginSection() {
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('main-content').style.display = 'none';
  if (sideMenu) sideMenu.style.display = 'none';
  if (menuToggle) menuToggle.style.display = 'none';
}

// After successful login, save token and show main content:
function handleLoginSuccess(token) {
  localStorage.setItem('token', token);
  showMainContent();
  if (sideMenu) sideMenu.style.display = '';
  if (menuToggle) menuToggle.style.display = '';
}
// Example: call handleLoginSuccess(token) after login API returns token
// --- API CONFIG ---
const API_BASE_URL = 'https://phone-2cv4.onrender.com';
const API_ENDPOINTS = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  VERIFY: '/api/auth/verify',
  PRODUCTS: '/api/products',
};

// --- Menu logic ---

const menuToggle = document.getElementById('menu-toggle');
const sideMenu = document.getElementById('side-menu');
const closeMenu = document.getElementById('close-menu');
const notifBtn = document.getElementById('menu-notifications');
const darkModeBtn = document.getElementById('menu-darkmode');
const logoutBtn = document.getElementById('menu-logout');
const notifBadge = document.getElementById('notif-badge');
const notifModal = document.getElementById('notification-modal');
const closeNotif = document.getElementById('close-notif');
const notifList = document.getElementById('notif-list');
const myOrdersBtn = document.getElementById('menu-myorders');
const ordersModal = document.getElementById('orders-modal');
const closeOrdersModal = document.getElementById('close-orders-modal');
const ordersList = document.getElementById('orders-list');
const profileBtn = document.getElementById('menu-profile');
const helpBtn = document.getElementById('menu-help');
const profileModal = document.getElementById('profile-modal');
const helpModal = document.getElementById('help-modal');
const closeProfileModal = document.getElementById('close-profile-modal');
const closeHelpModal = document.getElementById('close-help-modal');

// --- Settings Modal ---
let settingsModal = document.getElementById('settings-modal');
if (!settingsModal) {
  settingsModal = document.createElement('div');
  settingsModal.id = 'settings-modal';
  settingsModal.className = 'modal';
  settingsModal.innerHTML = `
    <div class="modal-content" style="max-width:400px;">
      <button id="close-settings-modal" class="close-modal">&times;</button>
      <h3>Settings</h3>
      <div id="settings-user-info" style="margin-bottom:1em;"></div>
      <button id="settings-darkmode-toggle" class="btn-main" style="margin-bottom:1em;width:100%;">Toggle Dark Mode</button>
      <form id="change-password-form" style="margin-bottom:1em;">
        <label>Old Password:<input type="password" id="old-password" required></label><br>
        <label>New Password:<input type="password" id="new-password" required></label><br>
        <label>Confirm New Password:<input type="password" id="confirm-new-password" required></label><br>
        <button type="submit" class="btn-main" style="width:100%;margin-top:8px;">Change Password</button>
        <div id="change-password-message" style="margin-top:6px;font-size:0.98em;"></div>
      </form>
      <button id="settings-logout-btn" class="btn-main" style="background:#d63031;width:100%;">Logout</button>
    </div>
  `;
  document.body.appendChild(settingsModal);
}
let openSettingsBtn = document.getElementById('menu-settings');
if (!openSettingsBtn && sideMenu) {
  // Create the settings button if not present
  openSettingsBtn = document.createElement('button');
  openSettingsBtn.id = 'menu-settings';
  openSettingsBtn.className = 'menu-btn';
  openSettingsBtn.innerHTML = '<span class="icon">⚙️</span> Settings';
  // Insert before logout if possible, else at end
  if (logoutBtn && logoutBtn.parentNode === sideMenu) {
    sideMenu.insertBefore(openSettingsBtn, logoutBtn);
  } else {
    sideMenu.appendChild(openSettingsBtn);
  }
}
settingsModal.classList.add('hidden');
settingsModal.style.display = 'none';
if (openSettingsBtn) {
  openSettingsBtn.onclick = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    document.getElementById('settings-user-info').innerHTML = `<b>Name:</b> ${user.name || ''}<br><b>Email:</b> ${user.email || ''}`;
    settingsModal.classList.remove('hidden');
    settingsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  };
}
document.getElementById('close-settings-modal').onclick = () => {
  settingsModal.classList.add('hidden');
  settingsModal.style.display = 'none';
  document.body.style.overflow = '';
};
document.getElementById('settings-darkmode-toggle').onclick = () => {
  setDarkMode(!document.body.classList.contains('dark-mode'));
};
document.getElementById('settings-logout-btn').onclick = () => {
  logoutBtn.onclick();
  settingsModal.classList.add('hidden');
  settingsModal.style.display = 'none';
};
document.getElementById('change-password-form').onsubmit = async function(e) {
  e.preventDefault();
  const oldPass = document.getElementById('old-password').value;
  const newPass = document.getElementById('new-password').value;
  const confirmNew = document.getElementById('confirm-new-password').value;
  const msg = document.getElementById('change-password-message');
  msg.textContent = '';
  if (newPass !== confirmNew) {
    msg.textContent = 'New passwords do not match.';
    msg.style.color = '#d63031';
    return;
  }
  if (newPass.length < 8) {
    msg.textContent = 'Password must be at least 8 characters.';
    msg.style.color = '#d63031';
    return;
  }
  // Simulate password change (replace with real API if available)
  setTimeout(() => {
    msg.textContent = 'Password changed successfully!';
    msg.style.color = '#00b894';
    document.getElementById('old-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-new-password').value = '';
  }, 1200);
};

// Hide menu by default
sideMenu.classList.remove('open');
sideMenu.style.display = 'none';

menuToggle.onclick = () => {
  sideMenu.style.display = 'flex';
  setTimeout(() => sideMenu.classList.add('open'), 10);
};
closeMenu.onclick = () => {
  sideMenu.classList.remove('open');
  setTimeout(() => sideMenu.style.display = 'none', 300);
};
sideMenu.onclick = (e) => {
  if (e.target === sideMenu) {
    sideMenu.classList.remove('open');
    setTimeout(() => sideMenu.style.display = 'none', 300);
  }
};
document.addEventListener('keydown', (e) => {
  if (sideMenu.classList.contains('open') && e.key === 'Escape') {
    sideMenu.classList.remove('open');
    setTimeout(() => sideMenu.style.display = 'none', 300);
  }
});

// --- Dark mode logic ---
function setDarkMode(enabled) {
  if (enabled) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', '1');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', '0');
  }
}
darkModeBtn.onclick = () => {
  setDarkMode(!document.body.classList.contains('dark-mode'));
};
if (localStorage.getItem('darkMode') === '1') setDarkMode(true);

// --- Notification logic (demo) ---
const demoNotifs = [

];
function updateNotifBadge() {
  if (demoNotifs.length > 0) {
    notifBadge.textContent = demoNotifs.length;
    notifBadge.classList.remove('hidden');
  } else {
    notifBadge.classList.add('hidden');
  }
}
notifBtn.onclick = async () => {
  notifModal.classList.remove('hidden');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  let notifs = [];
  if (user.email) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications?email=${encodeURIComponent(user.email)}`);
      notifs = await res.json();
    } catch {}
  }
  // Also fetch updates/announcements
  let updates = [];
  try {
    const res = await fetch(`${API_BASE_URL}/api/updates`);
    updates = await res.json();
  } catch {}
  const allNotifs = [
    ...notifs.map(n => ({ text: n.message, time: new Date(n.date).toLocaleString() })),
    ...updates.map(u => ({ text: u.message, time: new Date(u.date).toLocaleString() }))
  ];
  notifList.innerHTML = allNotifs.length
    ? allNotifs.map(n => `<li><b>${n.text}</b><br><span style='font-size:0.9em;color:#888;'>${n.time}</span></li>`).join('')
    : '<li>No notifications</li>';
  sideMenu.classList.remove('open');
  setTimeout(() => sideMenu.style.display = 'none', 300);
};
closeNotif.onclick = () => notifModal.classList.add('hidden');
document.addEventListener('keydown', (e) => {
  if (!notifModal.classList.contains('hidden') && e.key === 'Escape') notifModal.classList.add('hidden');
});
updateNotifBadge();

// --- Logout logic (demo) ---
logoutBtn.onclick = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('pendingVerificationEmail');
  localStorage.removeItem('stage');
  alert('You have been logged out.');
  showLogin();
  // Hide main content and show login section
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('auth-section').style.display = 'block';
};

// --- Navigation logic (unchanged) ---
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const productsSection = document.getElementById('products-section');
const authSection = document.getElementById('auth-section');

function showLogin() {
  loginView.classList.remove('hidden');
  registerView.classList.add('hidden');
  productsSection.classList.add('hidden');
  authSection.classList.remove('hidden');
  menuToggle.style.display = 'none';
  sideMenu.style.display = 'none';
}
function showRegister() {
  loginView.classList.add('hidden');
  registerView.classList.remove('hidden');
  productsSection.classList.add('hidden');
  authSection.classList.remove('hidden');
  menuToggle.style.display = 'none';
  sideMenu.style.display = 'none';
}
function showProducts() {
  loginView.classList.add('hidden');
  registerView.classList.add('hidden');
  productsSection.classList.remove('hidden');
  authSection.classList.add('hidden');
  menuToggle.style.display = 'inline-block';
  sideMenu.style.display = 'none';
}
document.getElementById('show-register-link').onclick = (e) => { e.preventDefault(); showRegister(); };
document.getElementById('show-login-link').onclick = (e) => { e.preventDefault(); showLogin(); };

// --- API Helpers ---
async function apiPost(endpoint, data) {
  const res = await fetch(API_BASE_URL + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || json.message || 'Request failed');
  return json;
}
async function apiGet(endpoint) {
  const res = await fetch(API_BASE_URL + endpoint);
  if (!res.ok) throw new Error('Failed to fetch');
  return await res.json();
}

// --- Nigerian States and LGAs ---
const statesAndLGAs = {
  'Abia': ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'],
  'Adamawa': ['Demsa', 'Fufore', 'Ganye', 'Girei', 'Gombi', 'Guyuk', 'Hong', 'Jada', 'Lamurde', 'Madagali', 'Maiha', 'Mayo Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'],
  'Akwa Ibom': ['Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat Enin', 'Nsit Atai', 'Nsit Ibom', 'Nsit Ubium', 'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Udung Uko', 'Ukanafun', 'Uruan', 'Urue-Offong/Oruko', 'Uyo'],
  'Anambra': ['Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi'],
  'Bauchi': ['Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Gamawa', 'Ganjuwa', 'Giade', 'Itas/Gadau', 'Jama are', 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki'],
  'Bayelsa': ['Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa'],
  'Benue': ['Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu', 'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'],
  'Borno': ['Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala/Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Mafa', 'Magumeri', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani'],
  'Cross River': ['Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakurr', 'Yala'],
  'Delta': ['Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South', 'Warri South West'],
  'Ebonyi': ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha'],
  'Edo': ['Akoko-Edo', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East', 'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba Okha', 'Oredo', 'Orhionmwon', 'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West', 'Uhunmwonde'],
  'Ekiti': ['Ado Ekiti', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West', 'Emure', 'Gbonyin', 'Ido Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun/Ifelodun', 'Ise/Orun', 'Moba', 'Oye'],
  'Enugu': ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo Etiti', 'Igbo Eze North', 'Igbo Eze South', 'Isi Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Udi', 'Uzo Uwani'],
  'FCT': ['Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Municipal Area Council'],
  'Gombe': ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba'],
  'Imo': ['Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North', 'Ideato South', 'Ihitte/Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema', 'Okigwe', 'Onuimo', 'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West'],
  'Jigawa': ['Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kaugama', 'Kazaure', 'Kiri Kasama', 'Kiyawa', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi'],
  'Kaduna': ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema a', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'],
  'Kano': ['Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'],
  'Katsina': ['Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandume', 'Danja', 'Dan Musa', 'Daura', 'Dutsi', 'Dutsin Ma', 'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', 'Mai Adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango'],
  'Kebbi': ['Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko/Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu/Danko', 'Yauri', 'Zuru'],
  'Kogi': ['Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela Odolu', 'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja', 'Mopa Muro', 'Ofu', 'Ogori/Magongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'],
  'Kwara': ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero', 'Oyun', 'Pategi'],
  'Lagos': ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'],
  'Nasarawa': ['Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa Egon', 'Obi', 'Toto', 'Wamba'],
  'Niger': ['Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Moya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi'],
  'Ogun': ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North', 'Egbado South', 'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode', 'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Shagamu'],
  'Ondo': ['Akoko North-East', 'Akoko North-West', 'Akoko South-West', 'Akoko South-East', 'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 'Ilaje', 'Ile Oluji/Okeigbo', 'Irele', 'Odigbo', 'Okitipupa', 'Ondo East', 'Ondo West', 'Ose', 'Owo'],
  'Osun': ['Atakunmosa East', 'Atakunmosa West', 'Aiyedaade', 'Aiyedire', 'Boluwaduro', 'Boripe', 'Ede North', 'Ede South', 'Egbedore', 'Ejigbo', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Ifedayo', 'Ifelodun', 'Ila', 'Ilesa East', 'Ilesa West', 'Irepodun', 'Irewole', 'Isokan', 'Iwo', 'Obokun', 'Odo Otin', 'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo'],
  'Oyo': ['Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho North', 'Ogbomosho South', 'Ogo Oluwa', 'Olorunsogo', 'Oluyole', 'Ona Ara', 'Orelope', 'Ori Ire', 'Oyo', 'Oyo East', 'Saki East', 'Saki West', 'Surulere'],
  'Plateau': ['Barkin Ladi', 'Bassa', 'Bokkos', 'Jos East', 'Jos North', 'Jos South', 'Kanam', 'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', 'Qua an Pan', 'Riyom', 'Shendam', 'Wase'],
  'Rivers': ['Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku Toru', 'Andoni', 'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emohua', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio/Akpor', 'Ogba/Egbema/Ndoni', 'Ogu/Bolo', 'Okrika', 'Omuma', 'Opobo/Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai'],
  'Sokoto': ['Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo'],
  'Taraba': ['Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karim Lamido', 'Kumi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing'],
  'Yobe': ['Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko', 'Karasuwa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari'],
  'Zamfara': ['Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi', 'Gusau', 'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara', 'Chafe', 'Zurmi']
};

// Populate state and LGA dropdowns on registration form
document.addEventListener('DOMContentLoaded', function() {
  const stateSelect = document.getElementById('reg-state');
  const lgaSelect = document.getElementById('reg-lga');
  if (stateSelect && lgaSelect) {
    // Populate states
    stateSelect.innerHTML = '<option value="">Select State</option>' + Object.keys(statesAndLGAs).map(state => `<option value="${state}">${state}</option>`).join('');
    // On state change, populate LGAs
    stateSelect.addEventListener('change', function() {
      const lgas = statesAndLGAs[this.value] || [];
      lgaSelect.innerHTML = '<option value="">Select LGA</option>' + lgas.map(lga => `<option value="${lga}">${lga}</option>`).join('');
    });
    // Optionally, clear LGA if state changes
    lgaSelect.innerHTML = '<option value="">Select LGA</option>';
  }
});

// --- Auth logic ---
document.getElementById('login-form').onsubmit = async function(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const loginMsg = document.getElementById('login-message');
  loginMsg.textContent = '';
  try {
    loginMsg.textContent = 'Logging in...';
    const res = await apiPost(API_ENDPOINTS.LOGIN, { email, password });
    // If login is successful, show welcome back message
    loginMsg.textContent = 'Welcome back!';
    localStorage.setItem('user', JSON.stringify(res.user));
    localStorage.setItem('stage', 'products');
    handleLoginSuccess(res.token); // Show main content after login
    showProducts();
    loadProducts();
  } catch (err) {
    // If password is incorrect or any error, show error message
    loginMsg.textContent = err.message || 'Incorrect email or password.';
  }
};
document.getElementById('register-form').onsubmit = async function(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;
  const registerMsg = document.getElementById('register-message');
  registerMsg.textContent = '';
  // Password match check
  if (password !== confirmPassword) {
    registerMsg.textContent = 'Passwords do not match.';
    return;
  }
  // Password strength check
  const strongPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!strongPassword.test(password)) {
    registerMsg.textContent = 'Password must be at least 8 characters and include a number, an uppercase letter, and a symbol.';
    return;
  }
  try {
    registerMsg.textContent = 'Registering...';
    const res = await apiPost(API_ENDPOINTS.REGISTER, {
      name, email, password, confirmPassword,
      state: document.getElementById('reg-state').value,
      lga: document.getElementById('reg-lga').value,
      address: document.getElementById('reg-address').value
    });
    registerMsg.textContent = 'Registration successful! Please verify your email.';
    // Save pending verification state
    window.pendingVerificationEmail = email;
    localStorage.setItem('pendingVerificationEmail', email);
    localStorage.setItem('stage', 'verify');
    document.getElementById('register-view').classList.remove('hidden');
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('verify-code-section').classList.remove('hidden');
  } catch (err) {
    registerMsg.textContent = err.message;
    // Show the register view and verification form even on error
    document.getElementById('register-view').classList.remove('hidden');
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('verify-code-section').classList.remove('hidden');
  }
};
document.getElementById('verify-btn').onclick = async function() {
  const code = document.getElementById('verification-code').value.trim();
  const email = window.pendingVerificationEmail || localStorage.getItem('pendingVerificationEmail') || document.getElementById('reg-email').value.trim();
  const registerMsg = document.getElementById('register-message');
  if (!code) {
    registerMsg.textContent = 'Please enter the verification code.';
    return;
  }
  try {
    registerMsg.textContent = 'Verifying...';
    const res = await apiPost(API_ENDPOINTS.VERIFY, { email, code });
    registerMsg.textContent = 'Email verified! Welcome.';
    document.getElementById('verify-code-section').classList.add('hidden');
    localStorage.removeItem('pendingVerificationEmail');
    localStorage.setItem('user', JSON.stringify(res.user));
    localStorage.setItem('token', res.token);
    localStorage.setItem('stage', 'products');
    handleLoginSuccess(res.token);
    showProducts();
    loadProducts();
  } catch (err) {
    registerMsg.textContent = err.message;
  }
};

let allProducts = [];

// --- Products logic ---
async function loadProducts() {
  try {
    allProducts = await apiGet(API_ENDPOINTS.PRODUCTS);
    filterAndRenderProducts();
  } catch (err) {
    const productList = document.getElementById('product-list');
    if (productList) productList.innerHTML = '<p style="text-align:center;">Failed to load products</p>';
  }
}


// --- Premium Section Logic ---
// This function will handle the Buy Now for premium section only
function setupPremiumSection() {
  const premiumSection = document.getElementById('premium-section');
  if (!premiumSection) return;
  premiumSection.addEventListener('click', function(e) {
    if (e.target.classList.contains('premium-buy-btn')) {
      e.preventDefault();
      const productId = e.target.getAttribute('data-product-id');
      showPremiumBuyModal(productId);
    }
  });
}

function showPremiumBuyModal(productId) {
  // You can fetch product details by ID if needed
  // For demo, just show a simple modal
  let modal = document.getElementById('premium-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'premium-modal';
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.zIndex = '9999';
    modal.style.background = 'rgba(0,0,0,0.35)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.overflowY = 'auto';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="modal-content" style="background:#fff;max-width:420px;width:95vw;padding:24px 18px 18px 18px;border-radius:12px;box-shadow:0 4px 24px #0002;position:relative;">
      <button id="close-premium-modal" class="close-modal" style="position:absolute;top:10px;right:10px;font-size:1.5em;background:none;border:none;cursor:pointer;">&times;</button>
      <h3 style="margin-top:0;">Premium Product Purchase</h3>
      <div style="margin:1em 0;">This is the premium buy modal for product ID: <b>${productId}</b></div>
      <button class="btn-main" id="premium-buy-confirm">Confirm Purchase</button>
    </div>
  `;
  document.getElementById('close-premium-modal').onclick = () => {
    modal.classList.add('hidden');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };
  document.getElementById('premium-buy-confirm').onclick = () => {
    alert('Premium product purchased!');
    modal.classList.add('hidden');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Call this on DOMContentLoaded
document.addEventListener('DOMContentLoaded', setupPremiumSection);

function filterAndRenderProducts() {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  let filtered = allProducts;
  const selectedCategory = categoryFilter && categoryFilter.value;
  if (selectedCategory && selectedCategory !== 'All') {
    filtered = filtered.filter(p => (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()));
  }
  // Then filter by search if any
  if (searchInput && searchInput.value.trim()) {
    const q = searchInput.value.trim().toLowerCase();
    filtered = filtered.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }
  renderProducts(filtered);
  // Update UI to show selected category (just the name)
  const catLabel = document.getElementById('selected-category-label');
  if (catLabel) {
    catLabel.textContent = selectedCategory && selectedCategory !== 'All' ? selectedCategory : '';
    catLabel.style.display = selectedCategory && selectedCategory !== 'All' ? 'block' : 'none';
  }
}

function renderProducts(products) {
  const productList = document.getElementById('product-list');
  if (!productList) return;
  if (!products.length) {
    productList.innerHTML = '<p style="text-align:center;">No products available</p>';
    return;
  }
  productList.innerHTML = products.map((product, idx) => {
    // All products, including premium, get only a Buy Now button
    return `
      <div class="product-card${product.premium ? ' premium-product-card' : ''}" data-idx="${idx}"${product.premium ? ' style="border:2px solid #ffe7b2;box-shadow:0 2px 12px #ffe7b2;position:relative;cursor:pointer;"' : ''}>
        <img src="${product.images[0]}" alt="${product.name}" class="product-img" data-idx="${idx}" style="cursor:pointer;" />
        <h4${product.premium ? ' style="color:#b97a00;"' : ''}>${product.name}${product.premium ? ' <span style="font-size:0.9em;background:#ffe7b2;color:#b97a00;padding:2px 8px;border-radius:6px;">Premium</span>' : ''}</h4>
        <p class="description" id="desc-${idx}" style="display:none;">${product.description}</p>
        <span class="category-badge" data-category="${product.category}">${product.category}</span>
        <p class="price">₦${product.price.toLocaleString()}</p>
        <button class="btn-main buy-now-btn" data-idx="${idx}">Buy Now</button>
      </div>
    `;
  }).join('');

  // Add event listeners for product images to toggle description
  document.querySelectorAll('.product-img').forEach(img => {
    img.onclick = function(e) {
      e.stopPropagation();
      const idx = this.getAttribute('data-idx');
      // Hide all descriptions first
      document.querySelectorAll('.description').forEach(desc => desc.style.display = 'none');
      // Show only the clicked one
      const desc = document.getElementById('desc-' + idx);
      if (desc) {
        desc.style.display = 'block';
      }
    };
  });
  // Add event listeners for buy now buttons (all products)
  document.querySelectorAll('.buy-now-btn').forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      const idx = this.getAttribute('data-idx');
      showBuyNowForm(products[idx]);
    };
  });
  // Add event listeners for category badges
  document.querySelectorAll('.category-badge').forEach(badge => {
    badge.onclick = function(e) {
      e.stopPropagation();
      const cat = this.getAttribute('data-category');
      const categoryFilter = document.getElementById('category-filter');
      if (categoryFilter) {
        categoryFilter.value = cat;
        filterAndRenderProducts();
      }
    };
  });
}

// Show modal for premium product sharing (with social and copy)
function showPremiumShareModal(product) {
  let modal = document.getElementById('order-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'order-modal';
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.zIndex = '9999';
    modal.style.background = 'rgba(0,0,0,0.35)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.overflowY = 'auto';
    document.body.appendChild(modal);
  } else {
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.zIndex = '9999';
    modal.style.background = 'rgba(0,0,0,0.35)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.overflowY = 'auto';
  }
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const inviteBase = window.location.origin || 'https://godsownpane.netlify.app';
  const inviteLink = `${inviteBase}/?ref=${encodeURIComponent(user.email || 'guest')}&product=${product.id}`;
  let invitedCount = parseInt(localStorage.getItem(`referral_count_${product.id}`) || '0', 10);
  if (isNaN(invitedCount)) invitedCount = 0;
  modal.innerHTML = `
    <div class="modal-content" style="background:#fff;max-width:420px;width:95vw;padding:24px 18px 18px 18px;border-radius:12px;box-shadow:0 4px 24px #0002;position:relative;">
      <button id="close-order-modal" class="close-modal" style="position:absolute;top:10px;right:10px;font-size:1.5em;background:none;border:none;cursor:pointer;">&times;</button>
      <h3 style="margin-top:0;">Share & Get Discount: ${product.name}</h3>
      <div class="referral-box" style="background:#f8f8f8;padding:16px 12px 18px 12px;margin-bottom:10px;border-radius:8px;border:1px solid #eee;text-align:center;">
        <b style="font-size:1.1em;">Invite 10 people to unlock 20% discount on this premium product!</b><br>
        <span style="font-size:13px;">Share this link with your friends. When 10 register and buy, you get your discount automatically.</span><br>
        <input type="text" id="invite-link" value="${inviteLink}" readonly style="width:90%;margin:8px 0 0 0;padding:4px;background:#fff;color:#222;${document.body.classList.contains('dark-mode') ? 'background:#222;color:#fff;border:1px solid #444;' : ''}">
        <button id="copy-invite-link" style="margin-left:5px;">Copy Link</button>
        <div style="margin-top:10px;font-size:1em;color:#555;">Progress: <b id="referral-progress">${invitedCount}</b>/10 invited</div>
        <div id="referral-info-msg" style="margin-top:8px;color:#d63031;font-size:0.98em;"></div>
        <div style="margin-top:14px;">
          <span style="font-size:1em;">Share on: </span>
          <a href="https://wa.me/?text=${encodeURIComponent('Check out this premium product: ' + product.name + ' ' + inviteLink)}" target="_blank" rel="noopener" style="margin:0 6px;font-size:1.3em;">🟢 WhatsApp</a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}" target="_blank" rel="noopener" style="margin:0 6px;font-size:1.3em;">🔵 Facebook</a>
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this premium product: ' + product.name + ' ' + inviteLink)}" target="_blank" rel="noopener" style="margin:0 6px;font-size:1.3em;">🐦 Twitter</a>
          <a href="mailto:?subject=Premium%20Product&body=${encodeURIComponent('Check out this premium product: ' + product.name + ' ' + inviteLink)}" style="margin:0 6px;font-size:1.3em;">✉️ Email</a>
        </div>
      </div>
    </div>
  `;
  setTimeout(() => {
    const copyBtn = document.getElementById('copy-invite-link');
    const inviteInput = document.getElementById('invite-link');
    const progress = document.getElementById('referral-progress');
    const infoMsg = document.getElementById('referral-info-msg');
    if (copyBtn && inviteInput && progress) {
      copyBtn.onclick = function() {
        inviteInput.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy Link'; }, 1200);
        // Simulate referral increment for demo (remove in production)
        let count = parseInt(progress.textContent, 10) || 0;
        if (count < 10) {
          count++;
          progress.textContent = count;
          localStorage.setItem(`referral_count_${product.id}`, count);
          if (count >= 10 && infoMsg) {
            infoMsg.style.color = '#00b894';
            infoMsg.textContent = 'You have invited 10 people! You can now buy at a discount.';
          }
        }
      };
    }
    const closeBtn = document.getElementById('close-order-modal');
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        // Restore menu toggle if needed
        if (typeof menuToggle !== 'undefined' && menuToggle) menuToggle.style.display = 'inline-block';
      };
    }
  }, 200);
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
}

// --- Buy Now Modal Logic ---
function showBuyNowForm(product) {
  let modal = document.getElementById('order-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'order-modal';
    modal.className = 'modal';
    // Overlay styles for modal
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.zIndex = '9999';
    modal.style.background = 'rgba(0,0,0,0.35)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.overflowY = 'auto';
    document.body.appendChild(modal);
  } else {
    // Ensure modal is styled correctly if it already exists
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.zIndex = '9999';
    modal.style.background = 'rgba(0,0,0,0.35)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.overflowY = 'auto';
  }
  // Hide products section and prevent background scroll
  document.body.style.overflow = 'hidden';
  const productsSection = document.getElementById('products-section');
  if (productsSection) productsSection.style.display = 'none';
  // Referral/invite logic for premium products
  let referralHtml = '';
  if (product.premium) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const inviteBase = window.location.origin || 'https://godsownpane.netlify.app';
    const inviteLink = `${inviteBase}/?ref=${encodeURIComponent(user.email || 'guest')}&product=${product.id}`;
    let invitedCount = parseInt(localStorage.getItem(`referral_count_${product.id}`) || '0', 10);
    if (isNaN(invitedCount)) invitedCount = 0;
    const isDark = document.body.classList.contains('dark-mode');
    referralHtml = `
      <div class="referral-box" style="background:${isDark ? '#222' : '#fff'};padding:16px 12px 18px 12px;margin-bottom:10px;border-radius:8px;border:1px solid ${isDark ? '#444' : '#bbb'};text-align:center;box-shadow:0 2px 8px #0001;">
        <b style="font-size:1.1em;color:${isDark ? '#ffe082' : '#b97a00'};">Invite 10 people to unlock 20% discount on this premium product!</b><br>
        <span style="font-size:13px;color:${isDark ? '#fff' : '#222'};">Share this link with your friends. When 10 register and buy, you get your discount automatically.</span><br>
        <input type="text" id="invite-link" value="${inviteLink}" readonly style="width:90%;margin:8px 0 0 0;padding:4px;background:${isDark ? '#333' : '#f8f8f8'};color:${isDark ? '#fff' : '#222'};border:1px solid ${isDark ? '#666' : '#bbb'};font-size:1em;border-radius:6px;">
        <button id="copy-invite-link" style="margin-left:5px;">Copy Link</button>
        <div style="margin-top:10px;font-size:1em;color:${isDark ? '#ffe082' : '#b97a00'};">Progress: <b id="referral-progress">${invitedCount}</b>/10 invited</div>
        <div id="referral-info-msg" style="margin-top:8px;color:#d63031;font-size:0.98em;"></div>
      </div>
    `;
  }
  modal.innerHTML = `
    <div class="modal-content" style="background:#fff;max-width:430px;width:97vw;padding:24px 18px 18px 18px;border-radius:12px;box-shadow:0 4px 24px #0002;position:relative;">
      <button id="close-order-modal" class="close-modal" style="position:absolute;top:10px;right:10px;font-size:1.5em;background:none;border:none;cursor:pointer;">&times;</button>
      <h3 style="margin-top:0;">Buy Now: ${product.name}</h3>
      ${referralHtml}
      <form id="order-form">
        <label>Quantity:<input type="number" id="order-qty" min="1" value="1" required style="width:60px;"></label><br>
        <label>Delivery Method:<br>
          <input type="radio" name="delivery-method" value="Pick Up" checked> Pick Up
          <input type="radio" name="delivery-method" value="Deliver"> Deliver
        </label><br>
        <div id="pickup-section">
          <div style="background:#f8f8f8;padding:10px 8px 10px 8px;margin-bottom:10px;border-radius:8px;border:1px solid #eee;">
            <b>Pick Up Location:</b><br>
            <span>Lagos, Nigeria (Store Address)</span><br>
            <span style="font-size:0.95em;color:#888;">You will pick up your order at our store. ₦30 fee applies.</span>
          </div>
        </div>
        <div id="delivery-section" style="display:none;">
          <div style="background:#f8f8f8;padding:10px 8px 10px 8px;margin-bottom:10px;border-radius:8px;border:1px solid #eee;">
            <b>Delivery Address:</b><br>
            <input type="text" id="order-address" style="width:95%;margin-top:4px;" placeholder="Enter delivery address">
            <div id="map-container" style="margin:10px 0 0 0;"></div>
            <span style="font-size:0.95em;color:#888;">Delivery fee is calculated based on your address.</span>
          </div>
        </div>
        <label>Phone:<input type="text" id="order-phone" required style="width:90%;"></label><br>
        <label>Email:<input type="email" id="order-email" required style="width:90%;"></label><br>
        <label>Payment Method:
          <select id="payment-method" required style="width:90%;">
            <option value="Pay on Delivery">Pay on Delivery</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </label><br>
        <div id="total-amount-box" style="margin:10px 0 0 0;font-weight:bold;font-size:1.1em;color:#1976d2;text-align:right;"></div>
        <button type="submit" class="btn-main" id="order-submit-btn" style="width:100%;margin-top:10px;">Send Order</button>
        <div id="order-spinner" style="display:none;text-align:center;margin-top:1em;"><div class="loader"></div> Sending order...</div>
      </form>
      <div id="order-message"></div>
    </div>
  `;
  // Restore scroll and products section when modal closes (cancelled)
  setTimeout(() => {
    const closeBtn = document.getElementById('close-order-modal');
    if (closeBtn) {
      closeBtn.onclick = function() {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        const productsSection = document.getElementById('products-section');
        if (productsSection) productsSection.style.display = '';
      };
    }
    // Also close on clicking outside modal content
    modal.onclick = function(e) {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        const productsSection = document.getElementById('products-section');
        if (productsSection) productsSection.style.display = '';
      }
    };
  }, 200);
  // --- Total Amount Calculation ---
  function estimateDeliveryFee(fromAddress, toAddress) {
    // Placeholder: In real app, use geocoding API to get distance. Here, use a fixed fee or a simple estimate.
    // For demo, if both addresses are in the same state, fee = 500; else 1500
    if (!fromAddress || !toAddress) return 1500;
    const from = String(fromAddress).toLowerCase();
    const to = String(toAddress).toLowerCase();
    // Try to extract state from address (very basic)
    let fromState = from.split(',').pop().trim();
    let toState = to.split(',').pop().trim();
    if (fromState && toState && fromState === toState) return 500;
    return 1500;
  }

  function updateTotalAmount() {
    const qty = parseInt(document.getElementById('order-qty').value, 10) || 1;
    const deliveryMethod = modal.querySelector('input[name="delivery-method"]:checked').value;
    let total = product.price * qty;
    let extra = 0;
    let extraLabel = '';
    if (deliveryMethod === 'Pick Up') {
      extra = 30;
      extraLabel = 'Pick Up Fee: ₦30';
    } else {
      // Delivery: estimate fee based on entered address
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const fromAddress = 'Lagos, Nigeria'; // Store location (customize as needed)
      const addressInput = document.getElementById('order-address');
      let toAddress = '';
      if (addressInput && addressInput.value.trim()) {
        toAddress = addressInput.value.trim();
      } else if (user.address) {
        toAddress = user.address;
      }
      extra = estimateDeliveryFee(fromAddress, toAddress);
      extraLabel = `Delivery Fee: ₦${extra}`;
    }
    const grandTotal = total + extra;
    document.getElementById('total-amount-box').innerHTML = `Product: ₦${total.toLocaleString()}<br>${extraLabel}<br><span style=\"font-size:1.15em;color:#009688;\">Total: ₦${grandTotal.toLocaleString()}</span>`;
  }

  // Initial total
  setTimeout(updateTotalAmount, 250);

  // Update total on qty, delivery method, or address change
  setTimeout(() => {
    document.getElementById('order-qty').addEventListener('input', updateTotalAmount);
    modal.querySelectorAll('input[name="delivery-method"]').forEach(r => r.addEventListener('change', updateTotalAmount));
    const addressInput = document.getElementById('order-address');
    if (addressInput) addressInput.addEventListener('input', updateTotalAmount);
  }, 300);
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  // Prevent background scroll
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  // Get registered address from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const registeredAddress = user.address || 'Lagos, Nigeria';

  // Pre-fill address field with registered address
  const addressInput = document.getElementById('order-address');
  if (addressInput && registeredAddress) {
    addressInput.value = registeredAddress;
  }

  // Map logic (only for delivery)
  function showMap(address) {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;
    if (!address) {
      mapContainer.innerHTML = '';
      return;
    }
    const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
    const realMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    mapContainer.innerHTML = `
      <iframe width="100%" height="200" frameborder="0" style="border:0" src="${mapUrl}" allowfullscreen></iframe>
      <div style="margin-top:6px;text-align:right;">
        <a href="${realMapUrl}" target="_blank" rel="noopener" style="font-size:0.98em;color:#1976d2;text-decoration:underline;">Open in Google Maps</a>
      </div>
    `;
  }

  // Show map for registered address by default if available
  setTimeout(() => {
    const addressInput = document.getElementById('order-address');
    if (addressInput && registeredAddress) {
      addressInput.value = registeredAddress;
      showMap(registeredAddress);
    }
  }, 200);

  // Delivery method logic: show/hide sections
  // Use requestAnimationFrame to ensure DOM is ready on all devices (including mobile)
  function setupDeliverySections() {
    const deliveryRadios = modal.querySelectorAll('input[name="delivery-method"]');
    const pickupSection = document.getElementById('pickup-section');
    const deliverySection = document.getElementById('delivery-section');
    const addressInput = document.getElementById('order-address');
    function updateSections() {
      const selected = modal.querySelector('input[name="delivery-method"]:checked');
      if (selected && selected.value === 'Deliver') {
        if (pickupSection) pickupSection.style.display = 'none';
        if (deliverySection) deliverySection.style.display = '';
        if (addressInput) {
          addressInput.required = true;
          showMap(addressInput.value || registeredAddress);
        }
      } else {
        if (pickupSection) pickupSection.style.display = '';
        if (deliverySection) deliverySection.style.display = 'none';
        if (addressInput) addressInput.required = false;
      }
      updateTotalAmount();
    }
    deliveryRadios.forEach(radio => {
      radio.onchange = updateSections;
    });
    // Initial state
    updateSections();
    // Update map live as address changes (when Deliver is selected)
    if (addressInput) {
      addressInput.addEventListener('input', function() {
        const selectedDelivery = modal.querySelector('input[name="delivery-method"]:checked').value;
        if (selectedDelivery === 'Deliver') {
          showMap(addressInput.value);
        }
        updateTotalAmount();
      });
    }
  }
  // Use rAF for best compatibility
  requestAnimationFrame(setupDeliverySections);

  document.getElementById('close-order-modal').onclick = () => {
    modal.classList.add('hidden');
    modal.style.display = 'none';
    // Restore background scroll
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  };

  document.getElementById('order-form').onsubmit = async function(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('order-submit-btn');
    const spinner = document.getElementById('order-spinner');
    submitBtn.disabled = true;
    spinner.style.display = 'block';
    const quantity = document.getElementById('order-qty').value;
    const deliveryMethod = modal.querySelector('input[name="delivery-method"]:checked').value;
    const address = document.getElementById('order-address').value;
    const phone = document.getElementById('order-phone').value;
    const email = document.getElementById('order-email').value;
    const paymentMethod = document.getElementById('payment-method').value;
    const orderMsg = document.getElementById('order-message');
    orderMsg.textContent = '';
    try {
      const res = await apiPost('/api/orders', {
        productId: product.id || product._id || product.name,
        quantity,
        address: deliveryMethod === 'Deliver' ? address : '',
        phone,
        email,
        deliveryMethod,
        paymentMethod
      });
      orderMsg.textContent = 'Order sent successfully!';
      orderMsg.style.color = '#00b894';
      setTimeout(() => {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        const productsSection = document.getElementById('products-section');
        if (productsSection) productsSection.style.display = '';
        // Automatically open My Orders and refresh the list
        if (typeof myOrdersBtn !== 'undefined' && myOrdersBtn) {
          myOrdersBtn.click();
        }
      }, 1500);
    } catch (err) {
      orderMsg.textContent = err.message || 'Failed to send order.';
      orderMsg.style.color = '#d63031';
    } finally {
      submitBtn.disabled = false;
      spinner.style.display = 'none';
    }
  };
}

if (myOrdersBtn && ordersModal && closeOrdersModal && ordersList) {
  myOrdersBtn.onclick = async () => {
    ordersModal.classList.remove('hidden');
    ordersModal.style.display = 'block';
    ordersList.innerHTML = '<div class="spinner" style="text-align:center;padding:2em;"><div class="loader"></div> Loading orders...</div>';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
      try {
        // Fetch orders for this user
        const res = await fetch(`${API_BASE_URL}/api/orders?email=${encodeURIComponent(user.email)}&t=${Date.now()}`); // force fresh fetch
        const orders = await res.json();
        // Fetch products for mapping productId to name (if products exist)
        let products = [];
        try {
          const prodRes = await fetch(`${API_BASE_URL}/api/products`);
          products = await prodRes.json();
        } catch {}
        const getProductName = (id) => {
          const p = products.find(pr => String(pr.id) === String(id));
          return p ? p.name : id;
        };
        if (!orders.length) {
          ordersList.innerHTML = `
            <div style="margin-bottom:1em;font-size:1.05em;color:#444;text-align:center;">
              <b>No orders yet.</b><br>When you place an order, it will appear here with its status and details.
            </div>
            <table style="width:100%;font-size:0.98em;"><thead><tr><th>Product</th><th>Qty</th><th>Status</th><th>Date</th><th>Delivery</th><th>Payment</th><th>Address</th></tr></thead><tbody>
            </tbody></table>`;
        } else {
          ordersList.innerHTML = `
            <div style="margin-bottom:1em;font-size:1.05em;color:#444;text-align:center;">
              <b>My Orders</b><br>Below are all your orders and their current status. Click a row for more info.
            </div>
            <table style="width:100%;font-size:1em;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px #0001;">
              <thead style="background:#f8f8f8;"><tr><th>Product</th><th>Qty</th><th>Status</th><th>Date</th><th>Delivery</th><th>Payment</th><th>Address</th></tr></thead>
              <tbody>
                ${orders.map(o => `<tr style="cursor:pointer;" title="Order details"><td>${getProductName(o.productId)}</td><td>${o.quantity}</td><td>${o.status || 'pending'}</td><td>${o.date ? new Date(o.date).toLocaleString() : ''}</td><td>${o.deliveryMethod || ''}</td><td>${o.paymentMethod || ''}</td><td>${o.address || ''}</td></tr>`).join('')}
              </tbody>
            </table>`;
        }
      } catch {
        ordersList.innerHTML = '<p style="color:#d63031;text-align:center;">Failed to load orders.</p>';
      }
    } else {
      ordersList.innerHTML = '<p style="text-align:center;">You must be logged in to view your orders.</p>';
    }
  };
  closeOrdersModal.onclick = () => {
    ordersModal.classList.add('hidden');
    ordersModal.style.display = 'none';
  };
}

if (profileBtn && profileModal && closeProfileModal) {
  profileBtn.onclick = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const infoDiv = document.getElementById('profile-info');
    if (user && user.email) {
      infoDiv.innerHTML = `<b>Name:</b> ${user.name || ''}<br><b>Email:</b> ${user.email}`;
    } else {
      infoDiv.innerHTML = 'Not logged in.';
    }
    profileModal.classList.remove('hidden');
    profileModal.style.display = 'block';
    sideMenu.classList.remove('open');
    setTimeout(() => sideMenu.style.display = 'none', 300);
  };
  closeProfileModal.onclick = () => {
    profileModal.classList.add('hidden');
    profileModal.style.display = 'none';
  };
}
if (helpBtn && helpModal && closeHelpModal) {
  helpBtn.onclick = () => {
    helpModal.classList.remove('hidden');
    helpModal.style.display = 'block';
    sideMenu.classList.remove('open');
    setTimeout(() => sideMenu.style.display = 'none', 300);
  };
  closeHelpModal.onclick = () => {
    helpModal.classList.add('hidden');
    helpModal.style.display = 'none';
  };
}

// --- Password visibility toggle ---
function setupPasswordToggle(inputId, toggleBtnId) {
  const input = document.getElementById(inputId);
  const toggleBtn = document.getElementById(toggleBtnId);
  if (input && toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      toggleBtn.textContent = isPassword ? '🙈' : '👁️';
      toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  }
}
document.addEventListener('DOMContentLoaded', function() {
  setupPasswordToggle('login-password', 'toggle-login-password');
  setupPasswordToggle('reg-password', 'toggle-reg-password');
  setupPasswordToggle('reg-confirm-password', 'toggle-reg-confirm-password');
});




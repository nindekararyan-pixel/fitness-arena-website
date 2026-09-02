// public/js/dashboard.js
// Handles login/register, loads the member dashboard, and (for admins)
// the admin panel. Token is kept in localStorage — this is a real,
// user-deployed site (not a sandboxed preview), so that's appropriate here.

const TOKEN_KEY = 'fitness_arena_token';

const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const logoutBtn = document.getElementById('logout-btn');

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

function showAuthView() {
    authView.hidden = false;
    dashboardView.hidden = true;
    logoutBtn.hidden = true;
}

function showDashboardView() {
    authView.hidden = true;
    dashboardView.hidden = false;
    logoutBtn.hidden = false;
}

// ---------- tab switching ----------
tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.hidden = false;
    registerForm.hidden = true;
});
tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.hidden = false;
    loginForm.hidden = true;
});

// ---------- login ----------
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Login failed.');
        setToken(data.token);
        loginForm.reset();
        await loadDashboard();
    } catch (err) {
        loginError.textContent = err.message;
        loginError.style.display = 'block';
    }
});

// ---------- register ----------
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.style.display = 'none';
    const payload = {
        name: document.getElementById('register-name').value,
        phone: document.getElementById('register-phone').value,
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value,
    };

    try {
        const res = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Registration failed.');
        setToken(data.token);
        registerForm.reset();
        await loadDashboard();
    } catch (err) {
        registerError.textContent = err.message;
        registerError.style.display = 'block';
    }
});

// ---------- logout ----------
logoutBtn.addEventListener('click', () => {
    clearToken();
    showAuthView();
});

// ---------- rendering helpers ----------
function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatAmount(paise) {
    return '₹' + (paise / 100).toFixed(0);
}

function renderBookings(bookings) {
    const body = document.getElementById('bookings-body');
    if (!bookings.length) {
        body.innerHTML = '<tr class="empty-row"><td colspan="4">No bookings yet — book a class from the timetable.</td></tr>';
        return;
    }
    body.innerHTML = bookings.map(b => `
    <tr>
      <td>${b.className}</td>
      <td>${b.day || '—'}</td>
      <td>${b.time || '—'}</td>
      <td>${formatDate(b.bookedAt)}</td>
    </tr>
  `).join('');
}

function renderPayments(payments) {
    const body = document.getElementById('payments-body');
    if (!payments.length) {
        body.innerHTML = '<tr class="empty-row"><td colspan="4">No payments yet.</td></tr>';
        return;
    }
    body.innerHTML = payments.map(p => `
    <tr>
      <td>${p.plan}</td>
      <td>${formatAmount(p.amount)}</td>
      <td><span class="status-pill ${p.status === 'paid' ? 'paid' : ''}">${p.status}</span></td>
      <td>${formatDate(p.createdAt)}</td>
    </tr>
  `).join('');
}

function renderMembers(members) {
    document.getElementById('members-count').textContent = members.length;
    document.getElementById('members-body').innerHTML = members.map(m => `
    <tr><td>${m.name}</td><td>${m.email}</td><td>${m.phone}</td><td>${m.role}</td></tr>
  `).join('') || '<tr class="empty-row"><td colspan="4">No members yet.</td></tr>';
}

function renderAllBookings(bookings) {
    document.getElementById('all-bookings-count').textContent = bookings.length;
    document.getElementById('all-bookings-body').innerHTML = bookings.map(b => `
    <tr><td>${b.user ? b.user.name : b.name + ' (guest)'}</td><td>${b.className}</td><td>${b.day || '—'}</td><td>${b.time || '—'}</td></tr>
  `).join('') || '<tr class="empty-row"><td colspan="4">No bookings yet.</td></tr>';
}

function renderAllPayments(payments) {
    document.getElementById('all-payments-count').textContent = payments.length;
    document.getElementById('all-payments-body').innerHTML = payments.map(p => `
    <tr><td>${p.user ? p.user.name : p.name + ' (guest)'}</td><td>${p.plan}</td><td>${formatAmount(p.amount)}</td><td><span class="status-pill ${p.status === 'paid' ? 'paid' : ''}">${p.status}</span></td></tr>
  `).join('') || '<tr class="empty-row"><td colspan="4">No payments yet.</td></tr>';
}

// ---------- load dashboard ----------
async function loadDashboard() {
    const token = getToken();
    if (!token) { showAuthView(); return; }

    try {
        const res = await fetch('/api/dashboard', {
            headers: { Authorization: 'Bearer ' + token },
        });
        if (res.status === 401) { clearToken(); showAuthView(); return; }
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Could not load dashboard.');

        document.getElementById('welcome-name').textContent = 'Welcome back, ' + data.user.name;
        document.getElementById('welcome-email').textContent = data.user.email;
        renderBookings(data.bookings);
        renderPayments(data.payments);
        showDashboardView();

        const adminSection = document.getElementById('admin-section');
        if (data.user.role === 'admin') {
            adminSection.hidden = false;
            loadAdminData(token);
        } else {
            adminSection.hidden = true;
        }
    } catch (err) {
        clearToken();
        showAuthView();
    }
}

async function loadAdminData(token) {
    const headers = { Authorization: 'Bearer ' + token };
    try {
        const [membersRes, bookingsRes, paymentsRes] = await Promise.all([
            fetch('/api/admin/members', { headers }),
            fetch('/api/admin/bookings', { headers }),
            fetch('/api/admin/payments', { headers }),
        ]);
        const [membersData, bookingsData, paymentsData] = await Promise.all([
            membersRes.json(), bookingsRes.json(), paymentsRes.json(),
        ]);
        if (membersData.ok) renderMembers(membersData.members);
        if (bookingsData.ok) renderAllBookings(bookingsData.bookings);
        if (paymentsData.ok) renderAllPayments(paymentsData.payments);
    } catch (err) {
        // Admin panel failing to load shouldn't break the rest of the dashboard.
        console.error('Error loading admin data:', err);
    }
}

// ---------- init ----------
loadDashboard();
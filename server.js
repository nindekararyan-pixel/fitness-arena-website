// server.js
// Fitness Arena — static site + lightweight API for contact forms,
// class bookings, and membership sign-ups.

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Data file paths ----------
const DATA_DIR = path.join(__dirname, 'data');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const SIGNUPS_FILE = path.join(DATA_DIR, 'signups.json');

// ---------- Helpers ----------
function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  for (const file of [CONTACTS_FILE, BOOKINGS_FILE, SIGNUPS_FILE]) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, '[]', 'utf8');
  }
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function writeJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`❌ Failed to write ${file}:`, err);
  }
}

function appendJson(file, entry) {
  const records = readJson(file);
  records.push(entry);
  writeJson(file, records);
  return records.length;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------- Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- API Routes ----------

// Contact form
app.post('/api/contact', (req, res) => {
  const { name, phone, email, message } = req.body || {};

  if (!isNonEmptyString(name) || !isNonEmptyString(phone) || !isNonEmptyString(email)) {
    return res.status(400).json({ ok: false, error: 'Name, phone, and email are required.' });
  }
  if (!looksLikeEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email format.' });
  }

  const entry = {
    id: generateId(),
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    message: isNonEmptyString(message) ? message.trim() : '',
    submittedAt: new Date().toISOString(),
  };

  appendJson(CONTACTS_FILE, entry);
  res.status(201).json({ ok: true, message: "Thanks — we'll get back to you soon." });
});

// Class bookings
app.post('/api/bookings', (req, res) => {
  const { name, phone, email, day, time, className } = req.body || {};

  if (!isNonEmptyString(name) || !isNonEmptyString(phone) || !isNonEmptyString(className)) {
    return res.status(400).json({ ok: false, error: 'Name, phone, and class are required.' });
  }

  const entry = {
    id: generateId(),
    name: name.trim(),
    phone: phone.trim(),
    email: isNonEmptyString(email) ? email.trim() : '',
    day: day || '',
    time: time || '',
    className: className.trim(),
    bookedAt: new Date().toISOString(),
  };

  appendJson(BOOKINGS_FILE, entry);
  res.status(201).json({ ok: true, message: `You're booked for ${entry.className}${entry.day ? ' on ' + entry.day : ''}.` });
});

// Membership sign-ups
app.post('/api/signups', (req, res) => {
  const { name, phone, email, plan } = req.body || {};
  const validPlans = ['Monthly', 'Quarterly', 'Yearly'];

  if (!isNonEmptyString(name) || !isNonEmptyString(phone) || !isNonEmptyString(email)) {
    return res.status(400).json({ ok: false, error: 'Name, phone, and email are required.' });
  }
  if (!validPlans.includes(plan)) {
    return res.status(400).json({ ok: false, error: 'Plan must be Monthly, Quarterly, or Yearly.' });
  }

  const entry = {
    id: generateId(),
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    plan,
    signedUpAt: new Date().toISOString(),
  };

  appendJson(SIGNUPS_FILE, entry);
  res.status(201).json({ ok: true, message: `Welcome to Fitness Arena — ${plan} plan received.` });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'running', time: new Date().toISOString() });
});

// Fallback route for SPA
app.get('*', (req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- Start ----------
ensureDataFiles();
app.listen(PORT, () => {
  console.log(`🚀 Fitness Arena server running at http://localhost:${PORT}`);
});

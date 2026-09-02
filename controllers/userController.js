// controllers/userController.js
// Handles user registration, login, and profile retrieval.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isNonEmptyString, looksLikeEmail } = require('../utils/validators');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

// ---------- Helpers ----------
function signToken(user) {
    return jwt.sign(
        { sub: user._id.toString(), email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

function publicUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
    };
}

// ---------- Controllers ----------

// POST /api/users/register
async function register(req, res) {
    try {
        const { name, phone, email, password } = req.body || {};

        // Validation
        if (!isNonEmptyString(name) || !isNonEmptyString(phone) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
            return res.status(400).json({ ok: false, error: 'Name, phone, email, and password are required.' });
        }
        if (!looksLikeEmail(email)) {
            return res.status(400).json({ ok: false, error: "That email address doesn't look right." });
        }
        if (password.length < 8) {
            return res.status(400).json({ ok: false, error: 'Password must be at least 8 characters.' });
        }

        // Check for existing user
        const existing = await User.findOne({ email: email.trim().toLowerCase() });
        if (existing) {
            return res.status(409).json({ ok: false, error: 'An account with that email already exists.' });
        }

        // Hash password & create user
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await User.create({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            passwordHash,
        });

        // Issue JWT
        const token = signToken(user);
        return res.status(201).json({ ok: true, token, user: publicUser(user) });
    } catch (err) {
        console.error('❌ Error registering user:', err.message);
        return res.status(500).json({ ok: false, error: 'Something went wrong creating your account. Please try again later.' });
    }
}

// POST /api/users/login
async function login(req, res) {
    try {
        const { email, password } = req.body || {};

        // Validation
        if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
            return res.status(400).json({ ok: false, error: 'Email and password are required.' });
        }

        // Find user
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
        }

        // Compare password
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
        }

        // Issue JWT
        const token = signToken(user);
        return res.json({ ok: true, token, user: publicUser(user) });
    } catch (err) {
        console.error('❌ Error logging in user:', err.message);
        return res.status(500).json({ ok: false, error: 'Something went wrong logging you in. Please try again later.' });
    }
}

// GET /api/users/me (protected)
async function me(req, res) {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ ok: false, error: 'User not found.' });
        }
        return res.json({ ok: true, user: publicUser(user) });
    } catch (err) {
        console.error('❌ Error fetching user:', err.message);
        return res.status(500).json({ ok: false, error: 'Something went wrong.' });
    }
}

module.exports = { register, login, me };

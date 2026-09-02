// middleware/authMiddleware.js
// JWT verification middleware with three variants:
//   verifyToken   — blocks the request if there's no valid token (protected routes)
//   optionalAuth  — attaches req.userId if a valid token is present, but never blocks
//                   (used on routes like payment checkout that support both logged-in
//                   members and guest checkout)
//   requireAdmin  — chain after verifyToken to enforce admin-only access

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Extract token from Authorization header
function getToken(req) {
    const header = req.headers.authorization || '';
    return header.startsWith('Bearer ') ? header.slice(7) : null;
}

// Strict authentication: requires a valid token
function verifyToken(req, res, next) {
    const token = getToken(req);
    if (!token) {
        return res.status(401).json({ ok: false, error: 'Missing or invalid Authorization header.' });
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.sub; // use "sub" (subject) from JWT payload
        next();
    } catch (err) {
        return res.status(401).json({ ok: false, error: 'Invalid or expired token.' });
    }
}

// Optional authentication: attaches req.userId if valid, otherwise continues as guest
function optionalAuth(req, res, next) {
    const token = getToken(req);
    if (!token) return next();
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.sub;
    } catch (err) {
        // Invalid/expired token on optional-auth route — proceed as guest
    }
    next();
}

// Admin-only access: chain after verifyToken
async function requireAdmin(req, res, next) {
    try {
        const user = await User.findById(req.userId).select('role');
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ ok: false, error: 'Admin access required.' });
        }
        next();
    } catch (err) {
        console.error('❌ Error checking admin role:', err.message);
        res.status(500).json({ ok: false, error: 'Something went wrong checking permissions.' });
    }
}

module.exports = { verifyToken, optionalAuth, requireAdmin };

// routes/users.js
// Routes for handling user registration, login, and profile retrieval.

const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/users/register — register a new user
router.post('/register', register);

// POST /api/users/login — authenticate and return JWT
router.post('/login', login);

// GET /api/users/me — get current user profile (requires valid JWT)
router.get('/me', verifyToken, me);

module.exports = router;

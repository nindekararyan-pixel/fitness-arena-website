// routes/dashboard.js
// Dashboard route for logged-in members

const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protect this route with JWT
router.get('/', verifyToken, getDashboard);

module.exports = router;

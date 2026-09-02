// routes/admin.js
// Admin-only routes. Every route here requires:
//   1. A valid JWT (verifyToken)
//   2. Role: "admin" on the user (requireAdmin)

const express = require('express');
const router = express.Router();
const { listMembers, listBookings, listPayments } = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Apply authentication + admin check to all routes in this file
router.use(verifyToken, requireAdmin);

// GET /api/admin/members — list all registered members
router.get('/members', listMembers);

// GET /api/admin/bookings — list all bookings
router.get('/bookings', listBookings);

// GET /api/admin/payments — list all payments
router.get('/payments', listPayments);

module.exports = router;

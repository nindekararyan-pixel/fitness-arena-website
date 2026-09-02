// routes/bookings.js
// Routes for handling class bookings (Yoga, Zumba, HIIT, Strength Training).

const express = require('express');
const router = express.Router();
const { submitBooking } = require('../controllers/bookingController');
const { optionalAuth } = require('../middleware/authMiddleware');

// POST /api/bookings — submit a new class booking
// optionalAuth attaches req.userId if a JWT is provided, but does not block guests
router.post('/', optionalAuth, submitBooking);

module.exports = router;

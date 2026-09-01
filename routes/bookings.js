// routes/bookings.js
// Routes for handling class bookings (Yoga, Zumba, HIIT, Strength Training).

const express = require('express');
const router = express.Router();
const { submitBooking } = require('../controllers/bookingController');

// POST /api/bookings — submit a new class booking
router.post('/', submitBooking);

module.exports = router;

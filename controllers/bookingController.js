// controllers/bookingController.js
// Handles class booking submissions.

const Booking = require('../models/Booking');
const { isNonEmptyString } = require('../utils/validators');

// POST /api/bookings
async function submitBooking(req, res) {
    try {
        const { name, phone, email, day, time, className } = req.body || {};

        // ---------- Validation ----------
        if (!isNonEmptyString(name) || !isNonEmptyString(phone) || !isNonEmptyString(className)) {
            return res.status(400).json({ ok: false, error: 'Name, phone, and class are required.' });
        }

        // Save to MongoDB
        const booking = await Booking.create({
            name: name.trim(),
            phone: phone.trim(),
            email: isNonEmptyString(email) ? email.trim() : '',
            day: isNonEmptyString(day) ? day.trim() : '',
            time: isNonEmptyString(time) ? time.trim() : '',
            className: className.trim(),
        });

        // Success response
        return res.status(201).json({
            ok: true,
            message: `You're booked for ${booking.className}${booking.day ? ' on ' + booking.day : ''}.`,
            id: booking._id,
        });
    } catch (err) {
        console.error('❌ Error saving booking:', err.message);
        return res.status(500).json({
            ok: false,
            error: 'Something went wrong saving your booking. Please try again later.',
        });
    }
}

module.exports = { submitBooking };

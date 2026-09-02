// controllers/dashboardController.js
// Powers the logged-in member's dashboard: profile, bookings, and payments.
// Note: "Progress" (body composition tracking) is not yet implemented.

const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// GET /api/dashboard (protected — requires Authorization: Bearer <token>)
async function getDashboard(req, res) {
    try {
        // Fetch user, bookings, and payments in parallel
        const [user, bookings, payments] = await Promise.all([
            User.findById(req.userId).select('name email phone role'),
            Booking.find({ user: req.userId }).sort({ bookedAt: -1 }),
            Payment.find({ user: req.userId }).sort({ createdAt: -1 }),
        ]);

        if (!user) {
            return res.status(404).json({ ok: false, error: 'User not found.' });
        }

        return res.json({
            ok: true,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
            bookings,
            payments,
        });
    } catch (err) {
        console.error('❌ Error loading dashboard:', err.message);
        return res.status(500).json({ ok: false, error: 'Something went wrong loading your dashboard.' });
    }
}

module.exports = { getDashboard };

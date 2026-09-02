// controllers/adminController.js
// Admin functions: list all members, bookings, and payments.

const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// GET /api/admin/members
async function listMembers(req, res) {
    try {
        const members = await User.find().select('name email phone role createdAt');
        res.json({ ok: true, members });
    } catch (err) {
        console.error('❌ Error listing members:', err.message);
        res.status(500).json({ ok: false, error: 'Something went wrong fetching members.' });
    }
}

// GET /api/admin/bookings
async function listBookings(req, res) {
    try {
        const bookings = await Booking.find().populate('user', 'name email').sort({ bookedAt: -1 });
        res.json({ ok: true, bookings });
    } catch (err) {
        console.error('❌ Error listing bookings:', err.message);
        res.status(500).json({ ok: false, error: 'Something went wrong fetching bookings.' });
    }
}

// GET /api/admin/payments
async function listPayments(req, res) {
    try {
        const payments = await Payment.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json({ ok: true, payments });
    } catch (err) {
        console.error('❌ Error listing payments:', err.message);
        res.status(500).json({ ok: false, error: 'Something went wrong fetching payments.' });
    }
}

module.exports = { listMembers, listBookings, listPayments };

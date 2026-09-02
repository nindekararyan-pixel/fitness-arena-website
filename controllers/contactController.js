// controllers/contactController.js
// Handles contact form submissions.

const Contact = require('../models/Contact');
const { isNonEmptyString, looksLikeEmail } = require('../utils/validators');

// POST /api/contact
async function submitContact(req, res) {
    try {
        const { name, phone, email, message } = req.body || {};

        // ---------- Validation ----------
        if (!isNonEmptyString(name) || !isNonEmptyString(phone) || !isNonEmptyString(email)) {
            return res.status(400).json({ ok: false, error: 'Name, phone, and email are required.' });
        }
        if (!looksLikeEmail(email)) {
            return res.status(400).json({ ok: false, error: "That email address doesn't look right." });
        }

        // ---------- Save to MongoDB ----------
        const contact = await Contact.create({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            message: isNonEmptyString(message) ? message.trim() : '',
        });

        // ---------- Success Response ----------
        return res.status(201).json({
            ok: true,
            message: "Thanks — we'll get back to you within a day.",
            id: contact._id,
        });
    } catch (err) {
        console.error('❌ Error saving contact:', err.message);
        return res.status(500).json({
            ok: false,
            error: 'Something went wrong saving your message. Please try again later.',
        });
    }
}

module.exports = { submitContact };

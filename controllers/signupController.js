// controllers/signupController.js
// Handles membership sign-up submissions.

const Signup = require('../models/Signup');
const { isNonEmptyString, looksLikeEmail, isValidPlan } = require('../utils/validators');

// POST /api/signups
async function submitSignup(req, res) {
    try {
        const { name, phone, email, plan } = req.body || {};

        // Basic validation
        if (!isNonEmptyString(name) || !isNonEmptyString(phone) || !isNonEmptyString(email)) {
            return res.status(400).json({ ok: false, error: 'Name, phone, and email are required.' });
        }
        if (!looksLikeEmail(email)) {
            return res.status(400).json({ ok: false, error: "That email address doesn't look right." });
        }
        if (!isValidPlan(plan)) {
            return res.status(400).json({ ok: false, error: 'Plan must be Monthly, Quarterly, or Yearly.' });
        }

        // Save to MongoDB
        const signup = await Signup.create({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            plan: plan.trim(),
        });

        // Success response
        return res.status(201).json({
            ok: true,
            message: `Welcome to Fitness Arena — ${signup.plan} plan received.`,
            id: signup._id,
        });
    } catch (err) {
        console.error('❌ Error saving signup:', err.message);
        return res.status(500).json({
            ok: false,
            error: 'Something went wrong saving your sign-up. Please try again later.',
        });
    }
}

module.exports = { submitSignup };

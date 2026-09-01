// routes/signups.js
// Routes for handling membership sign-ups (Monthly / Quarterly / Yearly).

const express = require('express');
const router = express.Router();
const { submitSignup } = require('../controllers/signupController');

// POST /api/signups — submit a new membership sign-up
router.post('/', submitSignup);

module.exports = router;

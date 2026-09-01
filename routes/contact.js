// routes/contact.js
// Routes for handling contact form submissions.

const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contactController');

// POST /api/contact — submit a new contact form
router.post('/', submitContact);

module.exports = router;

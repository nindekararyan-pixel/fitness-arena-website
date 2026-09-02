// routes/payments.js
// Routes for handling payment operations via Razorpay.

const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { optionalAuth } = require('../middleware/authMiddleware');

// POST /api/payments/create-order — create a new Razorpay order
// optionalAuth: links the payment to a logged-in user when a valid JWT is provided,
// but still allows guest checkout without one.
router.post('/create-order', optionalAuth, createOrder);

// POST /api/payments/verify — verify Razorpay payment signature
router.post('/verify', verifyPayment);

module.exports = router;

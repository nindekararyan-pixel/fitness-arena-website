// controllers/paymentController.js
// Handles payment order creation and verification via Razorpay.

const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const { isNonEmptyString, looksLikeEmail, isValidPaymentPlan } = require('../utils/validators');

// ---------- Helpers ----------
function getRazorpayClient() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return null;
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

// ---------- Controllers ----------

// POST /api/payments/create-order
// Body: { name, phone, email, plan } — plan: Trial | Monthly | Quarterly | Yearly
async function createOrder(req, res) {
    try {
        const { name, phone, email, plan } = req.body || {};

        // Validation
        if (!isNonEmptyString(name) || !isNonEmptyString(phone) || !isNonEmptyString(email)) {
            return res.status(400).json({ ok: false, error: 'Name, phone, and email are required.' });
        }
        if (!looksLikeEmail(email)) {
            return res.status(400).json({ ok: false, error: "That email address doesn't look right." });
        }
        if (!isValidPaymentPlan(plan)) {
            return res.status(400).json({ ok: false, error: 'Plan must be Trial, Monthly, Quarterly, or Yearly.' });
        }

        const razorpay = getRazorpayClient();
        if (!razorpay) {
            return res.status(500).json({
                ok: false,
                error: 'Payment gateway is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.',
            });
        }

        const amountInPaise = Payment.PLAN_AMOUNTS_INR[plan] * 100;

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: { plan, name, email },
        });

        // Save payment record
        const payment = await Payment.create({
            user: req.userId || null,
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            plan,
            amount: amountInPaise,
            currency: 'INR',
            razorpayOrderId: order.id,
            status: 'created',
        });

        return res.status(201).json({
            ok: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            paymentRecordId: payment._id,
        });
    } catch (err) {
        console.error('❌ Error creating Razorpay order:', err.message);
        return res.status(502).json({ ok: false, error: 'Could not start the payment. Please try again shortly.' });
    }
}

// POST /api/payments/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
async function verifyPayment(req, res) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

        // Validation
        if (!isNonEmptyString(razorpay_order_id) || !isNonEmptyString(razorpay_payment_id) || !isNonEmptyString(razorpay_signature)) {
            return res.status(400).json({ ok: false, error: 'Missing payment verification fields.' });
        }
        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ ok: false, error: 'Payment gateway is not configured yet.' });
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        // Find payment record
        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
        if (!payment) {
            return res.status(404).json({ ok: false, error: 'No matching payment found for that order.' });
        }

        if (!isValid) {
            payment.status = 'failed';
            await payment.save();
            return res.status(400).json({ ok: false, error: 'Payment signature verification failed.' });
        }

        // Update payment record
        payment.status = 'paid';
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.paidAt = new Date();
        await payment.save();

        return res.json({ ok: true, message: 'Payment verified — welcome to Fitness Arena!', payment });
    } catch (err) {
        console.error('❌ Error verifying payment:', err.message);
        return res.status(500).json({ ok: false, error: 'Something went wrong verifying your payment.' });
    }
}

module.exports = { createOrder, verifyPayment };

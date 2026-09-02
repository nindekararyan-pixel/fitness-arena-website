// models/Payment.js
// Schema for membership payments processed through Razorpay.

const mongoose = require('mongoose');

// Membership pricing in rupees — update here if site pricing changes.
// "Trial" is a ₹1 one-day pass, payment-only (not part of Signup.js plans).
const PLAN_AMOUNTS_INR = {
    Trial: 1,
    Monthly: 999,
    Quarterly: 2499,
    Yearly: 8999,
};

const paymentSchema = new mongoose.Schema(
    {
        // Optional — set when the payer is logged in. Guest checkout is allowed.
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        name: {
            type: String,
            required: [true, 'Name is required.'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters long.'],
        },
        email: {
            type: String,
            required: [true, 'Email is required.'],
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.'],
        },
        phone: {
            type: String,
            required: [true, 'Phone is required.'],
            trim: true,
            match: [/^\+?[0-9]{7,15}$/, 'Please enter a valid phone number.'],
        },
        plan: {
            type: String,
            required: [true, 'Plan is required.'],
            enum: {
                values: ['Trial', 'Monthly', 'Quarterly', 'Yearly'],
                message: 'Plan must be Trial, Monthly, Quarterly, or Yearly.',
            },
        },
        // Stored in paise (smallest INR unit) — matches Razorpay expectations
        amount: {
            type: Number,
            required: true,
            min: [1, 'Amount must be at least 1 paise.'],
        },
        currency: {
            type: String,
            default: 'INR',
            uppercase: true,
        },
        provider: {
            type: String,
            default: 'razorpay',
            lowercase: true,
        },
        razorpayOrderId: {
            type: String,
            required: true,
            index: true, // speeds up lookups during verification
        },
        razorpayPaymentId: {
            type: String,
            default: null,
        },
        razorpaySignature: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ['created', 'paid', 'failed'],
            default: 'created',
        },
        paidAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

// Static pricing reference
paymentSchema.statics.PLAN_AMOUNTS_INR = PLAN_AMOUNTS_INR;

module.exports = mongoose.model('Payment', paymentSchema);

// models/Signup.js
// Schema for membership sign-ups (Monthly / Quarterly / Yearly).

const mongoose = require('mongoose');

const signupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required.'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters long.'],
        },
        phone: {
            type: String,
            required: [true, 'Phone is required.'],
            trim: true,
            match: [/^\+?[0-9]{7,15}$/, 'Please enter a valid phone number.'],
        },
        email: {
            type: String,
            required: [true, 'Email is required.'],
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.'],
        },
        plan: {
            type: String,
            required: [true, 'Plan is required.'],
            enum: {
                values: ['Monthly', 'Quarterly', 'Yearly'],
                message: 'Plan must be Monthly, Quarterly, or Yearly.',
            },
        },
        signedUpAt: {
            type: Date,
            default: Date.now,
            immutable: true,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

module.exports = mongoose.model('Signup', signupSchema);

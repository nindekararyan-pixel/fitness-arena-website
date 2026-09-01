// models/Contact.js
// Schema for contact form submissions.

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
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
        message: {
            type: String,
            trim: true,
            maxlength: [500, 'Message cannot exceed 500 characters.'],
            default: '',
        },
        submittedAt: {
            type: Date,
            default: Date.now,
            immutable: true, // once set, cannot be changed
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

module.exports = mongoose.model('Contact', contactSchema);

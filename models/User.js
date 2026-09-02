// models/User.js
// Schema for gym member accounts (used for auth + linking payments/bookings).

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
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
            unique: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.'],
        },
        phone: {
            type: String,
            required: [true, 'Phone is required.'],
            trim: true,
            match: [/^\+?[0-9]{7,15}$/, 'Please enter a valid phone number.'],
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required.'],
            minlength: [60, 'Password hash must be a valid bcrypt string.'], // sanity check
        },
        role: {
            type: String,
            enum: ['member', 'admin'],
            default: 'member',
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

module.exports = mongoose.model('User', userSchema);

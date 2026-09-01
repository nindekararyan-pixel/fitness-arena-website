// models/Booking.js
// Schema for class bookings (Yoga, Zumba, HIIT, Strength Training).

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
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
            trim: true,
            lowercase: true,
            default: '',
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.'],
        },
        day: {
            type: String,
            trim: true,
            default: '',
            enum: [
                '',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
            ],
        },
        time: {
            type: String,
            trim: true,
            default: '',
        },
        className: {
            type: String,
            required: [true, 'Class name is required.'],
            trim: true,
            enum: ['Yoga', 'Zumba', 'HIIT', 'Strength Training'],
        },
        bookedAt: {
            type: Date,
            default: Date.now,
            immutable: true,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

module.exports = mongoose.model('Booking', bookingSchema);

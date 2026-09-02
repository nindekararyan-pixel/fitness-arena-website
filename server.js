// server.js
// Fitness Arena — static site + API for contact, bookings, sign-ups, users, payments, dashboard, and admin.

require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

// Import routes
const contactRoutes = require('./routes/contact');
const bookingRoutes = require('./routes/bookings');
const signupRoutes = require('./routes/signups');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DB_URI;

// ---------- Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- API Routes ----------
app.use('/api/contact', contactRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/signups', signupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
        ok: true,
        status: 'running',
        db: states[mongoose.connection.readyState] || 'unknown',
        time: new Date().toISOString(),
    });
});

// Fallback route (SPA support)
app.get('*', (req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- Start ----------
async function start() {
    if (!DB_URI) {
        console.error('❌ Missing DB_URI in .env — set it to your MongoDB connection string.');
        process.exit(1);
    }

    if (!process.env.JWT_SECRET) {
        console.warn('⚠️  Missing JWT_SECRET in .env — /api/users routes will fail until it is set.');
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.warn('⚠️  Missing Razorpay keys in .env — /api/payments routes will fail until they are set.');
    }

    try {
        mongoose.set('strictQuery', false); // recommended for Mongoose 7+
        await mongoose.connect(DB_URI);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    }

    const server = app.listen(PORT, () => {
        console.log(`🚀 Fitness Arena server running at http://localhost:${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down server...');
        await mongoose.connection.close();
        server.close(() => process.exit(0));
    });
}

start();

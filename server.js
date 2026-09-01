// server.js
// Fitness Arena — static site + API for contact, bookings, and sign-ups, backed by MongoDB.

require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

// Import routes
const contactRoutes = require('./routes/contact');
const bookingRoutes = require('./routes/bookings');
const signupRoutes = require('./routes/signups');

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
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- Start ----------
async function start() {
    if (!DB_URI) {
        console.error('❌ Missing DB_URI in .env — set it to your MongoDB connection string.');
        process.exit(1);
    }

    try {
        mongoose.set('strictQuery', false); // recommended for Mongoose 7+
        await mongoose.connect(DB_URI);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`🚀 Fitness Arena server running at http://localhost:${PORT}`);
    });
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await mongoose.connection.close();
    process.exit(0);
});

start();

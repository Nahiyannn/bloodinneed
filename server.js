const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const donorRoutes = require('./routes/donors');

// Load environment variables
dotenv.config();

const app = express();

// Print current environment for debugging
console.log('Current environment:', {
    MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 10000
});

// Security middleware
app.use((req, res, next) => {
    // Force HTTPS
    if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
        return res.redirect(301, `https://${req.get('host')}${req.url}`);
    }

    // Security headers
    res.set({
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });

    // Handle domain redirect
    const host = req.get('host');
    if (host.includes('onrender.com')) {
        return res.redirect(301, `https://bloodinneed.org${req.url}`);
    }

    next();
});

// CORS configuration
app.use(cors({
    origin: ['https://bloodinneed.org', 'https://www.bloodinneed.org'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Parse JSON bodies
app.use(express.json());

// API routes
app.use('/api/donors', donorRoutes);

// Serve static files
const staticPath = path.join(__dirname, 'client/build');
console.log('Static files path:', staticPath);
app.use(express.static(staticPath));

// MongoDB Atlas Connection
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not set');
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB Atlas');
        
        // Start server after successful DB connection
        const PORT = process.env.PORT || 10000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        });
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

// Handle all other routes by serving the React app
app.get('*', (req, res) => {
    console.log('Serving React app for path:', req.path);
    res.sendFile(path.join(__dirname, 'client/build/index.html'), err => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error loading application');
        }
    });
});

// Connect to database and start server
connectDB();

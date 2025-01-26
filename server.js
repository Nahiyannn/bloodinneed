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
    PORT: process.env.PORT || 5000
});

// Redirect middleware for onrender.com to custom domain
app.use((req, res, next) => {
    const host = req.get('host');
    // Check if we're on the Render domain
    if (host.includes('onrender.com')) {
        return res.redirect(301, `https://bloodinneed.org${req.originalUrl}`);
    }
    next();
});

// CORS configuration
app.use(cors({
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200
}));

// Parse JSON bodies
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// API routes
app.use('/api/donors', donorRoutes);

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
        const PORT = process.env.PORT || 5000;
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
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Connect to database and start server
connectDB();

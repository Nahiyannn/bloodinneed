const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Donor = require('./models/Donor');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection with retry logic
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloodDonation';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: true,
            w: 'majority'
        });
        console.log('MongoDB connected successfully');
        
        // Start server only after successful DB connection
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('MongoDB connection error:', err);
        // Retry connection after 5 seconds
        setTimeout(connectDB, 5000);
    }
};

connectDB();

// API Routes
app.get('/api/donors', async (req, res) => {
    try {
        const { bloodGroup } = req.query;
        const query = bloodGroup && bloodGroup !== 'All' ? { bloodGroup } : {};
        const donors = await Donor.find(query).sort({ createdAt: -1 });
        res.json(donors);
    } catch (error) {
        console.error('Error fetching donors:', error);
        res.status(500).json({ error: 'Error fetching donors' });
    }
});

app.post('/api/donors', async (req, res) => {
    try {
        if (!req.body.phoneNumber && !req.body.facebookProfileUrl) {
            return res.status(400).json({ 
                error: 'Either Phone Number or Facebook Profile URL is required' 
            });
        }

        const donor = new Donor(req.body);
        await donor.save();
        res.status(201).json(donor);
    } catch (error) {
        console.error('Error creating donor:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: messages.join('. ') });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                error: 'A donor with this email already exists' 
            });
        }
        
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during MongoDB disconnect:', err);
        process.exit(1);
    }
});

const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');

// Get all donors or filter by blood group
router.get('/', async (req, res) => {
    console.log('GET /api/donors request received');
    try {
        const { bloodGroup } = req.query;
        const query = bloodGroup && bloodGroup !== 'All' ? { bloodGroup } : {};
        
        const donors = await Donor.find(query)
            .sort({ createdAt: -1 })
            .select('-__v'); // Exclude version field
        
        console.log(`Found ${donors.length} donors`);
        res.json(donors);
    } catch (error) {
        console.error('Error fetching donors:', error);
        res.status(500).json({ 
            error: 'Error fetching donors. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Register new donor
router.post('/', async (req, res) => {
    console.log('POST /api/donors request received');
    console.log('Request body:', req.body);
    
    try {
        console.log('Received donor registration:', req.body);
        
        // Validate required fields
        const requiredFields = ['name', 'location', 'email', 'bloodGroup'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate contact information
        if (!req.body.phoneNumber && !req.body.facebookProfileUrl) {
            console.log('Missing contact information');
            return res.status(400).json({ 
                error: 'Either Phone Number or Facebook Profile URL is required'
            });
        }

        // Validate phone number format if provided
        if (req.body.phoneNumber && !/^\d{11}$/.test(req.body.phoneNumber)) {
            console.log('Invalid phone number format');
            return res.status(400).json({
                error: 'Phone number must be exactly 11 digits'
            });
        }

        // Validate email format
        if (!req.body.email.endsWith('@gmail.com')) {
            console.log('Invalid email format');
            return res.status(400).json({
                error: 'Please use a valid Gmail address'
            });
        }

        // Create and save donor
        console.log('Creating new donor with data:', req.body);
        const donor = new Donor(req.body);
        const savedDonor = await donor.save();
        console.log('Donor saved successfully:', savedDonor._id);
        
        res.status(201).json({
            message: 'Registration successful!',
            donor: savedDonor
        });
    } catch (error) {
        console.error('Error creating donor:', error);
        
        if (error.name === 'ValidationError') {
            const errorMessage = Object.values(error.errors).map(err => err.message).join('. ');
            console.log('Validation error:', errorMessage);
            return res.status(400).json({ error: errorMessage });
        }
        
        if (error.code === 11000) {
            console.log('Duplicate email error');
            return res.status(400).json({ 
                error: 'A donor with this email already exists'
            });
        }
        
        res.status(500).json({ 
            error: 'Registration failed. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;

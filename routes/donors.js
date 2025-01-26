const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');

// Get all donors or filter by blood group
router.get('/', async (req, res) => {
    console.log('GET /api/donors request received');
    console.log('Query params:', req.query);
    
    try {
        const { bloodGroup } = req.query;
        const query = bloodGroup && bloodGroup !== 'All' ? { bloodGroup } : {};
        
        console.log('MongoDB query:', query);
        
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
        // Validate required fields
        const requiredFields = ['name', 'location', 'email', 'bloodGroup'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate contact information
        if (!req.body.phoneNumber && !req.body.facebookProfileUrl) {
            return res.status(400).json({ 
                error: 'Either Phone Number or Facebook Profile URL is required'
            });
        }

        // Create new donor
        const donor = new Donor(req.body);
        await donor.save();
        
        console.log('New donor registered:', donor);
        res.status(201).json(donor);
    } catch (error) {
        console.error('Error registering donor:', error);
        
        // Handle duplicate email error
        if (error.code === 11000) {
            return res.status(400).json({
                error: 'A donor with this email already exists.'
            });
        }
        
        res.status(500).json({ 
            error: 'Error registering donor. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;

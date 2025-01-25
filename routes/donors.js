const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');

// Create a new donor
router.post('/', async (req, res) => {
    try {
        const donor = new Donor(req.body);
        await donor.save();
        res.status(201).json(donor);
    } catch (error) {
        // Check if this is a duplicate key error for email
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(400).json({ error: 'This email is already registered' });
        }
        res.status(400).json({ error: error.message });
    }
});

// Get all donors with optional blood group filter
router.get('/', async (req, res) => {
    try {
        const { bloodGroup } = req.query;
        const query = bloodGroup && bloodGroup !== 'All' ? { bloodGroup: decodeURIComponent(bloodGroup) } : {};
        const donors = await Donor.find(query).sort({ createdAt: -1 });
        res.json(donors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear all donors
router.delete('/clear', async (req, res) => {
    try {
        await Donor.deleteMany({});
        res.json({ message: 'All donor data cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

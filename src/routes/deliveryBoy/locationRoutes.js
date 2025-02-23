const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middleware/deliveryBoyMidilwhere/authmidilwhere');
const Location = require('../../models/deliveryBoy/locationSchema');

// ✅ Update Location (Live Update)
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { latitude, longitude, address } = req.body;
        let location = await Location.findOne({ user: req.user.id });

        if (location) {
            location.latitude = latitude;
            location.longitude = longitude;
            location.address = address;
        } else {
            location = new Location({ user: req.user.id, latitude, longitude, address });
        }

        await location.save();
        res.status(200).json({ message: "Location updated", location });
    } catch (error) {
        res.status(500).json({ message: "Error updating location", error });
    }
});

// ✅ Get Location
router.get('/', authenticateUser, async (req, res) => {
    try {
        const location = await Location.findOne({ user: req.user.id }).populate('user', 'email phone');
        if (!location) return res.status(404).json({ message: "Location not found" });

        res.status(200).json({ location });
    } catch (error) {
        res.status(500).json({ message: "Error fetching location", error });
    }
});

// ✅ Delete Location
router.delete('/', authenticateUser, async (req, res) => {
    try {
        await Location.findOneAndDelete({ user: req.user.id });
        res.status(200).json({ message: "Location deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting location", error });
    }
});

module.exports = router;    

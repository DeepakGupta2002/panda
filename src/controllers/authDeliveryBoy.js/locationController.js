const Location = require('../../models/deliveryBoy/locationSchema');

// Create a new location
const createLocation = async (req, res) => {
    try {
        const { latitude, longitude, address, isActive } = req.body;
        const userId = req.user.id;
        console.log("User ID:", userId); // Debugging ke liye

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const newLocation = await Location.create({ userId, latitude, longitude, address, isActive });
        res.status(201).json(newLocation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create location' });
    }
};

// Get all locations
const getAllLocations = async (req, res) => {
    try {
        const locations = await Location.find({ userId: req.user.id });
        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
};

// Get a location by ID
const getLocationById = async (req, res) => {
    try {
        const location = await Location.findOne({ _id: req.params.id, userId: req.user.id });
        if (!location) return res.status(404).json({ error: 'Location not found' });
        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch location' });
    }
};

// Update a location by ID
const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude, address, isActive } = req.body;
        const updatedLocation = await Location.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { latitude, longitude, address, isActive },
            { new: true }
        );
        if (!updatedLocation) return res.status(404).json({ error: 'Location not found' });
        res.status(200).json(updatedLocation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update location' });
    }
};

// Delete a location by ID
const deleteLocation = async (req, res) => {
    try {
        const deletedLocation = await Location.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!deletedLocation) return res.status(404).json({ error: 'Location not found' });
        res.status(200).json({ message: 'Location deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete location' });
    }
};

module.exports = {
    createLocation,
    getAllLocations,
    getLocationById,
    updateLocation,
    deleteLocation
};

const express = require("express");
const {
    createLocation,
    getAllLocations,
    getLocationById,
    updateLocation,
    deleteLocation
} = require("../../controllers/authDeliveryBoy.js/locationController");

const LocationRouter = express.Router();

// Create a new location
LocationRouter.post('/locations', createLocation);

// Get all locations
LocationRouter.get('/locations', getAllLocations);

// Get a location by ID
LocationRouter.get('/locations/:id', getLocationById);

// Update a location by ID
LocationRouter.put('/locations/:id', updateLocation);

// Delete a location by ID
LocationRouter.delete('/locations/:id', deleteLocation);

module.exports = { LocationRouter };

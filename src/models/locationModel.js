// /models/locationModel.js
const locations = {}; // In-memory store for locations

// Add or update the location of a user
const updateLocation = (id, latitude, longitude) => {
    locations[id] = { latitude, longitude };
};

// Remove a user
const removeLocation = (id) => {
    delete locations[id];
};

// Get the current locations of all users
const getAllLocations = () => {
    return locations;
};

module.exports = { updateLocation, removeLocation, getAllLocations };

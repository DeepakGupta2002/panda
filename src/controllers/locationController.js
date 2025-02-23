// /controllers/locationController.js
const locationModel = require('../models/locationModel');

const handleLocationUpdate = (socket, data) => {
    const { id, latitude, longitude } = data;

    // Update location in the model
    locationModel.updateLocation(id, latitude, longitude);

    // Broadcast the updated location to other clients
    socket.broadcast.emit('update-location', { id, latitude, longitude });
};

const handleUserDisconnect = (socket) => {
    // Remove user from the model
    locationModel.removeLocation(socket.id);

    // Notify other users to remove the marker for this user
    socket.broadcast.emit('remove-marker', socket.id);
};

module.exports = { handleLocationUpdate, handleUserDisconnect };

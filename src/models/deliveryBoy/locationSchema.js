const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String },
    isActive: { type: Boolean, default: false } // Active Mode for Live Tracking
});

module.exports = mongoose.model('Location', locationSchema);

const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true },
    isActive: { type: Boolean, default: false } // Live Tracking only for Delivery Boys
}, { timestamps: true });

const Location = mongoose.models.Location || mongoose.model("Location", locationSchema);

module.exports = { Location };
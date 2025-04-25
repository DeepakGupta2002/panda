const mongoose = require('mongoose');

const idSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    aadhaarNumber: { type: String, required: true },
    aadhaarImage: { type: String },
    panNumber: { type: String },
    panImage: { type: String },
    drivingLicenseNumber: { type: String },
    drivingLicenseImage: { type: String }
});

module.exports = mongoose.model('Identification', idSchema);

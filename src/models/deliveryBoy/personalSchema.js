const mongoose = require('mongoose');

const personalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    profileImage: { type: String }
});

module.exports = mongoose.model('PersonalDetail', personalSchema);

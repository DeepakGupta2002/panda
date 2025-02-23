const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accountNumber: { type: String },
    ifscCode: { type: String },
    upiId: { type: String }
});

module.exports = mongoose.model('BankDetail', bankSchema);

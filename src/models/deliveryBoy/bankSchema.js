const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ✅ Ensure ref is correct
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    upiId: { type: String }
});

const BankDetail = mongoose.model('BankDetail', bankSchema);
module.exports = BankDetail;

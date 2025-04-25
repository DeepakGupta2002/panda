const mongoose = require('mongoose');

const personalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    gender: { type: String, required: true },
    profileImage: { type: String }
});

const PersonalDetail = mongoose.model('PersonalDetail', personalSchema);
module.exports = { PersonalDetail };

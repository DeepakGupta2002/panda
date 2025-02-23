const mongoose = require('mongoose');

const UseraddressSchema = new mongoose.Schema({
    contactInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'ContactInfo' },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    deliveryInstructions: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryInstructions' },
});

const Address = mongoose.model('UserAddress', UseraddressSchema);
module.exports = { Address };

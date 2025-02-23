const mongoose = require('mongoose');

const deliveryInstructionsSchema = new mongoose.Schema({
    instructions: { type: String, required: true },
});

const DeliveryInstructions = mongoose.model('DeliveryInstructions', deliveryInstructionsSchema);
module.exports = { DeliveryInstructions };

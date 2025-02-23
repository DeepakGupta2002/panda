const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,  // Optional: agar image ko required na karna ho toh `required: true` hata sakte hain
    },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = { Category };

const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    discount: { type: Number, required: true },
    description: { type: String },
    expiry: { type: String } // Could be a Date type, but string matches original
});

module.exports = mongoose.model('Offer', offerSchema);
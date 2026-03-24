const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String },
    fullDescription: String,
    duration: Number,
    bulletPoints: [String]
});

module.exports = mongoose.model('Service', serviceSchema);
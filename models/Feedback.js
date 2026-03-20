const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    // You could link this to a client or booking
    // clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
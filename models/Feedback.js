const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    service: { type: String }, // For general service feedback
    image: { type: String }, // For uploaded image
    // You could link this to a client or booking
    // clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
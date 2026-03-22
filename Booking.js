const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String }, // Can be a guest
    email: { type: String, required: true },
    service: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    vehicleType: { type: String },
    vehicleModel: { type: String },
    plateNumber: { type: String },
    price: { type: Number },
    notes: { type: String },
    location: { type: String },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    // For compatibility with older client-side code
    clientName: String,
    clientUser: String,
    clientEmail: String,
}, { timestamps: true }); // adds createdAt and updatedAt

module.exports = mongoose.model('Booking', bookingSchema);
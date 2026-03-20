const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customerName: String,
  vehicleType: String,
  vehicleModel: String,
  plateNumber: String,
  service: String,
  price: Number,
  date: String,
  time: String,
  status: String,
  location: String,
  email: String,
  notes: String,
  clientName: String,
  clientUser: String
}, { timestamps: true });

module.exports = mongoose.model("Booking",bookingSchema);
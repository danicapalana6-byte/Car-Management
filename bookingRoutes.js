const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");

router.get("/",async(req,res)=>{
res.json(await Booking.find());
});

router.post("/",async(req,res)=>{
const booking = new Booking(req.body);
await booking.save();
res.json(booking);
});

router.delete("/:id",async(req,res)=>{
await Booking.findByIdAndDelete(req.params.id);
res.json("Deleted");
});

router.put("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status !== "pending") {
      return res.status(403).json({ message: "Cannot edit confirmed or completed booking" });
    }
    
    const updates = req.body;
    // Allow updating these fields
    const allowedUpdates = ["service", "date", "time", "vehicleType", "vehicleModel", "plateNumber", "location", "email", "notes", "price"];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        booking[field] = updates[field];
      }
    });
    
    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = express();

// --- Database Setup ---
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/carwashpro";
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully.");
        seedDatabase(); // Seed database with initial data if empty
    })
    .catch(err => console.error("MongoDB connection error:", err));

// Import Mongoose Models
const Client = require('./models/Client');
const Booking = require('./models/Booking');
const Feedback = require('./models/Feedback');
const Service = require('./models/Service');
const Offer = require('./models/Offer');
const User = require('./models/User'); // For admin

// --- Initial Data Seeding ---
async function seedDatabase() {
  const defaultServices = [
    { name: "Basic Wash", price: 150, description: "Exterior wash" },
    { name: "Premium Wash", price: 300, description: "Interior + exterior" },
    { name: "Interior Cleaning", price: 250, description: "Interior vacuum" },
    { name: "Full Detail", price: 600, description: "Complete detail" }
  ];
  const defaultOffers = [
    { name: 'New Customer 10% Off', discount: 10, description: 'First time customers get 10% off any service', expiry: '2024-12-31'},
    { name: 'Weekend Special', discount: 15, description: '15% off Fri-Sun bookings', expiry: 'ongoing'}
  ];

  if (await Service.countDocuments() === 0) {
    console.log('Seeding Services...');
    await Service.insertMany(defaultServices);
  }
  if (await Offer.countDocuments() === 0) {
    console.log('Seeding Offers...');
    await Offer.insertMany(defaultOffers);
  }
}

// NOTE: You will need to update your route files to use the Mongoose models.
// For example, pass the models to the route handlers.
const profileRoutes = require('./routes/profileRoutes')(Client);
const feedbackRoutes = require('./routes/feedbackRoutes')(Feedback, Client);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


app.use('/api/profile', profileRoutes);
app.use('/api/feedback', feedbackRoutes);

const transporter = nodemailer.createTransport({
    service: "gmail",
    // IMPORTANT: Use environment variables for credentials in production
    auth: {
        user: process.env.EMAIL_USER || "yourgmail@gmail.com",
        pass: process.env.EMAIL_PASS || "your_app_password"
    }
});

app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Note: Using a simple token. For production, consider JWT (JSON Web Tokens).
        const token = 'admin-token-' + Date.now();
        res.json({ token });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
});


app.get("/api/services", async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: "Error fetching services" });
    }
});

app.post("/api/clientAuth/signup", async (req, res) => {
    try {
        const body = req.body || {};
        // Add fallbacks to match different client scripts (just like the booking route)
        const name = body.name || body.clientName || body.fullName || '';
        const email = body.email || body.clientEmail || '';
        const username = body.username || body.clientUser || email.split('@')[0] || name || '';
        const password = body.password || body.clientPassword || '';

        // Prevent bcrypt or validation from throwing errors if fields are missing
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required fields." });
        }

        const existingClient = await Client.findOne({ $or: [{ email }, { username }] });
        if (existingClient) {
            return res.status(400).json({ message: "Email or username already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newClient = await Client.create({
            ...body, // Passes any extra fields (like phone, number) that the Mongoose schema might require
            name,
            email,
            username,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Registration successful",
            user: { id: newClient._id, name: newClient.name, email: newClient.email, username: newClient.username },
            token: "token-" + newClient._id // Using MongoDB's _id
        });
    } catch (error) {
        console.error("Signup error:", error);
        // Handle Duplicate Key Database Error (e.g. Email or Username already exists)
        if (error.code === 11000) {
            return res.status(400).json({ message: "Registration failed: Email or username is already in use." });
        }
        if (error.name === 'ValidationError') {
            // Pass explicit validation errors back to the frontend so you can see exactly what is missing
            const messages = Object.values(error.errors).map(e => e.message).join(', ');
            return res.status(400).json({ message: "Validation Error: " + messages });
        }
        res.status(500).json({ message: "Server error during registration.", error: error.message });
    }
});

// POST booking - accept multiple client field names from different client scripts
app.post("/api/book", async (req, res) => {
    const body = req.body || {};
    // normalize client identity
    const finalName = body.clientName || body.name || '';
    const finalUsername = body.clientUser || body.username || finalName || '';
    const finalEmail = body.clientEmail || body.email || '';

    const booking = {
        ...body,  // Save ALL fields from frontend (vehicleType, vehicleModel, plateNumber, etc.)
        name: finalName,
        username: finalUsername,
        email: finalEmail,
        status: body.status || 'pending',
    };

    try {
        const newBooking = await Booking.create(booking);

        // try sending confirmation email if email exists
        if (finalEmail) {
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER || "yourgmail@gmail.com",
                    to: finalEmail,
                    subject: "CarWash Booking Confirmation",
                    html: `
              <h2>Booking Confirmed</h2>
              <p>Name: ${booking.name}</p>
              <p>Service: ${booking.service}</p>
              <p>Date: ${booking.date}</p>
              <p>Time: ${booking.time}</p>
            `
                });
            } catch (emailError) {
                console.error("Failed to send confirmation email:", emailError);
            }
        }
        // return created booking for client to immediately display
        res.status(201).json({ message: "Booking successful", booking: newBooking });

    } catch (error) {
        console.error("Booking failed:", error);
        res.status(500).json({ message: "Error creating booking." });
    }
});

// GET bookings by path param (keeps compatibility)
app.get("/api/bookings/:username", async (req, res) => {
    try {
        const userBookings = await Booking.find({ username: req.params.username });
        res.json(userBookings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bookings." });
    }
});

// New: GET bookings by query param (client uses ?clientName= or ?username=)
app.get("/api/clientBookings", async (req, res) => {
    try {
        const qName = req.query.clientName || req.query.username || '';
        if (!qName) {
            return res.json([]);
        }
        const userBookings = await Booking.find({
            $or: [{ username: qName }, { name: qName }, { email: qName }, { clientUser: qName }]
        });
        res.json(userBookings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching client bookings." });
    }
});

// Admin APIs
const protectAdmin = (req, res, next) => {
    const token = req.headers.authorization;
    if (token && token.startsWith('admin-token-')) {
        next();
    } else {
        res.status(403).json({ message: "Forbidden" });
    }
};

const adminApiRouter = express.Router();
adminApiRouter.use(protectAdmin);

adminApiRouter.get("/offers", async (req, res) => {
  try { res.json(await Offer.find()); } catch (e) { res.status(500).json({error: e.message}); }
});

adminApiRouter.post("/offers", async (req, res) => {
  try {
    const newOffer = await Offer.create(req.body);
    res.status(201).json(newOffer);
  } catch (e) { res.status(500).json({error: e.message}); }
});

adminApiRouter.put("/offers/:id", async (req, res) => {
  try {
    const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedOffer) res.json(updatedOffer);
    else res.status(404).json({error: 'Not found'});
  } catch (e) { res.status(500).json({error: e.message}); }
});

adminApiRouter.delete("/offers/:id", async (req, res) => {
  try {
    const deleted = await Offer.findByIdAndDelete(req.params.id);
    if (deleted) res.json({message: 'Deleted'});
    else res.status(404).json({error: 'Not found'});
  } catch (e) { res.status(500).json({error: e.message}); }
});

adminApiRouter.get("/bookings", async (req, res) => {
    try { res.json(await Booking.find().sort({ createdAt: -1 })); } catch (e) { res.status(500).json({error: e.message}); }
});

adminApiRouter.get("/clients", async (req, res) => {
    try { res.json(await Client.find().select('-password')); } catch (e) { res.status(500).json({error: e.message}); }
});

adminApiRouter.get("/services", async (req, res) => {
    try {
        const services = await Service.find();
        // Enhance services with images/details
        const enhanced = services.map(s => ({
            ...s.toObject(),
            _id: s._id, // ensure _id is present
            image: `/image/${s.name.toLowerCase().replace(/ /g, '_')}.jpg`,
            duration: 45,
            fullDescription: `${s.description}. Professional car wash service.`
        }));
        res.json(enhanced);
    } catch (e) { res.status(500).json({error: e.message}); }
});

adminApiRouter.post("/services", async (req, res) => {
  try {
    const newService = await Service.create(req.body);
    res.status(201).json(newService);
  } catch (e) { res.status(500).json({error: e.message}); }
});

adminApiRouter.put("/services/:id", async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updated) res.json(updated);
    else res.status(404).json({error: 'Not found'});
  } catch (e) { res.status(500).json({error: e.message}); }
});

adminApiRouter.delete("/services/:id", async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (deleted) res.json({message: 'Deleted'});
    else res.status(404).json({error: 'Not found'});
  } catch (e) { res.status(500).json({error: e.message}); }
});

// Update booking
adminApiRouter.put("/bookings/:id", async (req, res) => {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedBooking) {
            res.json(updatedBooking);
        } else {
            res.status(404).json({error: 'Booking not found'});
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Client booking endpoints
app.get("/api/book/:id", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (booking) {
            res.json(booking);
        } else {
            res.status(404).json({ message: "Booking not found" });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.put("/api/book/:id", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.status !== "pending") {
            return res.status(403).json({ message: "Cannot edit confirmed or completed booking" });
        }
        
        Object.assign(booking, req.body);
        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Client-safe DELETE endpoint
app.delete("/api/book/:id", async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({ message: "Username required for verification" });
        }
        
        const deletedBooking = await Booking.findOneAndDelete({
            _id: req.params.id,
            $or: [{ username: username }, { clientUser: username }]
        });

        if (!deletedBooking) {
            return res.status(404).json({ message: "Booking not found or access denied" });
        }
        
        res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Delete booking
adminApiRouter.delete("/bookings/:id", async (req, res) => {
    try {
        const deleted = await Booking.findByIdAndDelete(req.params.id);
        if (deleted) {
            res.json({message: 'Deleted'});
        } else {
            res.status(404).json({error: 'Not found'});
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.use('/api/admin', adminApiRouter);

// prevent direct access to admin folder
app.use('/admin', (req, res, next) => {
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
});

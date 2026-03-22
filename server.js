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
        console.log("MongoDB connected successfully at", MONGO_URI);
        seedDatabase(); // Seed database with initial data if empty
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
        console.log("Starting without MongoDB - using fallback data");
    });

// Import Mongoose Models
const Client = require('./models/Client');
const Booking = require('./models/Booking');
const Feedback = require('./models/Feedback');
const Service = require('./models/Service');
const Offer = require('./models/Offer');
const User = require('./models/User'); // For admin

// --- Initial Data Seeding ---
async function seedDatabase() {
  console.log('🔄 Seeding database...');
  
  const defaultServices = [
    { name: "Basic Wash", price: 150, description: "Exterior wash", image: "basic_wash.jpg" },
    { name: "Premium Wash", price: 300, description: "Interior + exterior", image: "Deluxe_Wash.jpg" },
    { name: "Interior Cleaning", price: 250, description: "Interior vacuum", image: "Interior_Detailing.jpg" },
    { name: "Full Detail", price: 600, description: "Complete detail", image: "sp.png" },
    { name: "Tire Shine", price: 100, description: "Tire dressing", image: "tire_shine.jpg" },
    { name: "Engine Wash", price: 400, description: "Engine bay cleaning", image: "Engine_Cleaning.jpg" },
    { name: "Headlight Restoration", price: 500, description: "Restore headlight clarity", image: "Headlight_restoration.jpg" },
    { name: "Wax & Polish", price: 800, description: "Protect and shine your car", image: "Wax_&_Polish.jpg" },
    { name: "Scratch Removal", price: 1200, description: "Minor scratch repair", image: "Scratch_removal.jpg" },
    { name: "Ceramic Coating", price: 5000, description: "Long-term paint protection", image: "Ceramic_coating.jpg" }
  ];
  
  const defaultOffers = [
    { name: 'New Customer 10% Off', discount: 10, description: 'First time customers get 10% off any service', expiry: '2024-12-31'},
    { name: 'Weekend Special', discount: 15, description: '15% off Fri-Sun bookings', expiry: 'ongoing'}
  ];

  try {
    const serviceCount = await Service.countDocuments();
    console.log(`📊 Found ${serviceCount} services in DB`);
    
    if (serviceCount === 0) {
      console.log('🌱 Seeding Services...');
      await Service.insertMany(defaultServices);
      console.log('✅ Services seeded');
    }
    
    const offerCount = await Offer.countDocuments();
    console.log(`📊 Found ${offerCount} offers in DB`);
    if (offerCount === 0) {
      console.log('🌱 Seeding Offers...');
      await Offer.insertMany(defaultOffers);
      console.log('✅ Offers seeded');
    }
  } catch (error) {
    console.error('❌ Seed error:', error);
  }
}

// NOTE: You will need to update your route files to use the Mongoose models.
// For example, pass the models to the route handlers.
const profileRoutes = require('./routes/profileRoutes')(Client);
const feedbackRoutes = require('./routes/feedbackRoutes')(Feedback, Client);
const hasEmailConfig =
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_USER !== "yourgmail@gmail.com" &&
    process.env.EMAIL_PASS !== "your_app_password";

const transporter = hasEmailConfig
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })
    : null;
const clientAuthRoutes = require('./routes/clientAuth')(Client, transporter);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Serve client static files
app.use('/client', express.static(path.join(__dirname, "client")));

app.use('/api/profile', profileRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/clientAuth', clientAuthRoutes);

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
    console.log('API /api/services hit');
    try {
        const services = await Service.find();
        console.log(`DB returned ${services.length} services`);
        
        if (services.length === 0) {
            console.log('⚠️ No services in DB, returning fallback');
            return res.json([
                {
                    _id: "basic_wash",
                    name: "Basic Wash", 
                    price: 150,
                    image: "/client/image/basic_wash.jpg",
                    duration: 30,
                    description: "Quick exterior wash",
                    fullDescription: "Our Basic Wash includes exterior hand wash, rims and tire cleaning, hand drying, and light interior vacuum."
                },
                {
                    _id: "deluxe_wash",
                    name: "Deluxe Wash",
                    price: 400,
                    image: "/client/image/Deluxe_Wash.jpg", 
                    duration: 60,
                    description: "Full exterior & interior clean",
                    fullDescription: "Deluxe Wash includes everything in Basic plus detailed interior cleaning and tire dressing."
                }
            ]);
        }
        
        // Enhance services with images/details
        const enhanced = services.map(s => ({
            ...s.toObject(),
            _id: s._id,
            image: `/client/image/${s.name.toLowerCase().replace(/ /g, '_')}.jpg`,
            duration: s.duration || 45,
            fullDescription: `${s.description || ''}. Professional car wash service.`
        }));
        console.log(`✅ Returning ${enhanced.length} services`);
        res.json(enhanced);
    } catch (error) {
        console.error('Services API error:', error);
        // Fallback response
        res.json([{ _id: "error", name: "Service temporarily unavailable", price: 0 }]);
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
    const identifiers = [
        req.query.clientName,
        req.query.username,
        req.query.email,
        req.query.legacyUsername,
        req.query.legacyEmail
    ].filter(Boolean);
    console.log('API /api/clientBookings hit for:', identifiers);
    try {
        if (identifiers.length === 0) {
            console.log('No client identifier provided');
            return res.json([]);
        }
        const userBookings = await Booking.find({
            $or: identifiers.flatMap(value => ([
                { username: value },
                { name: value },
                { email: value },
                { clientUser: value }
            ]))
        });
        console.log(`Found ${userBookings.length} bookings for provided identifiers`);
        res.json(userBookings);
    } catch (error) {
        console.error('ClientBookings API error:', error);
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
            image: `/client/image/${s.name.toLowerCase().replace(/ /g, '_')}.jpg`,
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
        const identifiers = [
            req.query.username,
            req.query.email,
            req.query.legacyUsername,
            req.query.legacyEmail
        ].filter(Boolean);
        if (identifiers.length === 0) {
            return res.status(400).json({ message: "Client identity required for verification" });
        }
        
        const deletedBooking = await Booking.findOneAndDelete({
            _id: req.params.id,
            $or: identifiers.flatMap(value => ([
                { username: value },
                { clientUser: value },
                { email: value }
            ]))
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

app.use((err, req, res, next) => {
    if (err && err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Image upload is too large. Please choose a smaller photo.' });
    }
    next(err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
});

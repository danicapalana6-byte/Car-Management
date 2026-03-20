const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const app = express();

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const readJsonFile = (filename, defaultValue = []) => {
    const filePath = path.join(dataDir, filename);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        return JSON.parse(content);
    }
    return defaultValue;
};

const writeJsonFile = (filename, data) => {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

let clients = readJsonFile('clients.json');
let bookings = readJsonFile('bookings.json');
let feedbacks = readJsonFile('feedbacks.json');
let services = readJsonFile('services.json', [
    { name: "Basic Wash", price: 150, description: "Exterior wash" },
    { name: "Premium Wash", price: 300, description: "Interior + exterior" },
    { name: "Interior Cleaning", price: 250, description: "Interior vacuum" },
    { name: "Full Detail", price: 600, description: "Complete detail" }
]);
let offers = readJsonFile('offers.json', [
  {id: 'off1', name: 'New Customer 10% Off', discount: 10, description: 'First time customers get 10% off any service', expiry: '2024-12-31'},
  {id: 'off2', name: 'Weekend Special', discount: 15, description: '15% off Fri-Sun bookings', expiry: 'ongoing'}
]);


const profileRoutes = require('./routes/profileRoutes')(clients);
const feedbackRoutes = require('./routes/feedbackRoutes')(feedbacks, clients);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// serve static files from the public folder (so /client/signup.html works)
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


app.use('/api/profile', profileRoutes);
app.use('/api/feedback', feedbackRoutes);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "yourgmail@gmail.com",
        pass: "your_app_password"
    }
});

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        const token = 'admin-token-' + Date.now();
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});


app.get("/api/services", (req, res) => {
    res.json(services);
});

app.post("/api/clientAuth/signup", (req, res) => {
    const { name, email, username, password } = req.body;
    const newClient = {
        id: Date.now(),
        name,
        email,
        username,
        password
    };
    clients.push(newClient);
    writeJsonFile('clients.json', clients);
    res.json({
        message: "Registration successful",
        user: newClient,
        token: "token-" + newClient.id
    });
});

// POST booking - accept multiple client field names from different client scripts
app.post("/api/book", async (req, res) => {
    const body = req.body || {};
    // normalize client identity
    const finalName = body.clientName || body.name || '';
    const finalUsername = body.clientUser || body.username || finalName || '';
    const finalEmail = body.clientEmail || body.email || '';

    const booking = {
        id: Date.now().toString(),
        ...body,  // Save ALL fields from frontend (vehicleType, vehicleModel, plateNumber, etc.)
        name: finalName,
        username: finalUsername,
        email: finalEmail,
        status: body.status || 'pending',
        createdAt: new Date().toISOString()
    };

    bookings.push(booking);
    writeJsonFile('bookings.json', bookings);

    // try sending confirmation email if email exists
    try {
        if (finalEmail) {
            await transporter.sendMail({
                from: "yourgmail@gmail.com",
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
        }
    } catch (e) {
        console.log("Email failed", e);
    }

    // return created booking for client to immediately display
    res.status(201).json({ message: "Booking successful", booking });
});

// GET bookings by path param (keeps compatibility)
app.get("/api/bookings/:username", (req, res) => {
    const userBookings = bookings.filter(b => b.username === req.params.username);
    res.json(userBookings);
});

// New: GET bookings by query param (client uses ?clientName= or ?username=)
app.get("/api/clientBookings", (req, res) => {
    const qName = req.query.clientName || req.query.username || '';
    if (!qName) {
        return res.json([]);
    }
    const userBookings = bookings.filter(b =>
        b.username === qName || b.name === qName || b.email === qName || b.clientUser === qName
    );
    res.json(userBookings);
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

adminApiRouter.get("/offers", (req, res) => {
  res.json(offers);
});

adminApiRouter.post("/offers", (req, res) => {
  const newOffer = {id: Date.now().toString(), ...req.body};
  offers.push(newOffer);
  writeJsonFile('offers.json', offers);
  res.status(201).json(newOffer);
});

adminApiRouter.put("/offers/:id", (req, res) => {
  const index = offers.findIndex(o => o.id === req.params.id);
  if (index !== -1) {
    offers[index] = {...offers[index], ...req.body};
    writeJsonFile('offers.json', offers);
    res.json(offers[index]);
  } else res.status(404).json({error: 'Not found'});
});

adminApiRouter.delete("/offers/:id", (req, res) => {
  const index = offers.findIndex(o => o.id === req.params.id);
  if (index !== -1) {
    offers.splice(index, 1);
    writeJsonFile('offers.json', offers);
    res.json({message: 'Deleted'});
  } else res.status(404).json({error: 'Not found'});
});

adminApiRouter.get("/bookings", (req, res) => {
    res.json(bookings);
});

adminApiRouter.get("/clients", (req, res) => {
    res.json(clients);
});

adminApiRouter.get("/services", (req, res) => {
    // Enhance services with images/details
    const enhanced = services.map(s => ({
        ...s,
        image: `/image/${s.name.toLowerCase().replace(/ /g, '_')}.jpg`,
        duration: 45,
        fullDescription: `${s.description}. Professional car wash service.`
    }));
    res.json(enhanced);
});

adminApiRouter.post("/services", (req, res) => {
  const newService = {...req.body, id: Date.now().toString()};
  services.push(newService);
  writeJsonFile('services.json', services);
  res.status(201).json(newService);
});

adminApiRouter.put("/services/:id", (req, res) => {
  const index = services.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    services[index] = {...services[index], ...req.body};
    writeJsonFile('services.json', services);
    res.json(services[index]);
  } else res.status(404).json({error: 'Not found'});
});

adminApiRouter.delete("/services/:id", (req, res) => {
  const index = services.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    services.splice(index, 1);
    writeJsonFile('services.json', services);
    res.json({message: 'Deleted'});
  } else res.status(404).json({error: 'Not found'});
});

// Update booking
adminApiRouter.put("/bookings/:id", (req, res) => {
    const id = req.params.id;
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
        bookings[index] = { ...bookings[index], ...req.body };
        writeJsonFile('bookings.json', bookings);
        res.json(bookings[index]);
    } else {
        res.status(404).json({error: 'Booking not found'});
    }
});

// Client booking endpoints
app.get("/api/book/:id", (req, res) => {
    const id = req.params.id;
    const booking = bookings.find(b => b.id === id);
    if (booking) {
        res.json(booking);
    } else {
        res.status(404).json({ message: "Booking not found" });
    }
});

app.put("/api/book/:id", (req, res) => {
    const id = req.params.id;
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) {
        return res.status(404).json({ message: "Booking not found" });
    }
    if (bookings[index].status !== "pending") {
        return res.status(403).json({ message: "Cannot edit confirmed or completed booking" });
    }
    
    bookings[index] = { ...bookings[index], ...req.body };
    writeJsonFile('bookings.json', bookings);
    res.json(bookings[index]);
});

// Client-safe DELETE endpoint
app.delete("/api/book/:id", (req, res) => {
    const id = req.params.id;
    const username = req.query.username;
    if (!username) {
        return res.status(400).json({ message: "Username required" });
    }
    
    const index = bookings.findIndex(b => b.id === id && 
        (b.username === username || b.clientUser === username));
    if (index === -1) {
        return res.status(404).json({ message: "Booking not found or access denied" });
    }
    
    bookings.splice(index, 1);
    writeJsonFile('bookings.json', bookings);
    res.json({ message: "Booking cancelled successfully" });
});

// Delete booking
adminApiRouter.delete("/bookings/:id", (req, res) => {
    const id = req.params.id;
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
        bookings.splice(index, 1);
        writeJsonFile('bookings.json', bookings);
        res.json({message: 'Deleted'});
    } else {
        res.status(404).json({error: 'Not found'});
    }
});

app.use('/api/admin', adminApiRouter);

// prevent direct access to admin folder
app.use('/admin', (req, res, next) => {
    res.redirect('/');
});


app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

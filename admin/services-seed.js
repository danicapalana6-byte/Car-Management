const mongoose = require('mongoose');
const Service = require('../../models/Service.js');  // Path to shared model
const Service = require('../models/Service.js');  // Path to shared model

// EXACT CLIENT-MATCHING SERVICES - Basic Wash price=200 to match your client
const syncedServices = [
  {
    _id: "basic_wash",
    name: "Basic Wash",
    price: 200,
    duration: 30,
    description: "Exterior wash",
    fullDescription: "Exterior hand wash, rims and tire cleaning, hand drying, light interior vacuum.",
    image: "/client/image/basic_wash.jpg",
    bulletPoints: ["Quick 30 min service", "Exterior focus", "Tire shine included"]
  },
  {
    _id: "premium_wash",
    name: "Premium Wash",
    price: 300,
    duration: 45,
    description: "Interior + exterior",
    fullDescription: "Complete exterior wash + basic interior vacuum and wipe down.",
    image: "/client/image/Deluxe_Wash.jpg",
    bulletPoints: ["Interior vacuum", "Full exterior", "Dashboard wipe"]
  },
  {
    _id: "interior_cleaning",
    name: "Interior Cleaning",
    price: 250,
    duration: 60,
    description: "Interior vacuum",
    fullDescription: "Deep interior vacuuming, seat cleaning, dashboard and vents.",
    image: "/client/image/Interior_Detailing.jpg",
    bulletPoints: ["Seats & carpets", "Dashboard clean", "Odor removal"]
  },
  {
    _id: "full_detail",
    name: "Full Detail",
    price: 600,
    duration: 120,
    description: "Complete detail",
    fullDescription: "Full exterior + comprehensive interior detailing. Showroom condition.",
    image: "/client/image/sp.png",
    bulletPoints: ["Complete service", "Premium finish", "2 hour service"]
  },
  {
    _id: "tire_shine",
    name: "Tire Shine",
    price: 100,
    duration: 20,
    description: "Tire dressing",
    fullDescription: "Tire and rim cleaning with premium shine dressing.",
    image: "/client/image/tire_shine.jpg",
    bulletPoints: ["Wheel specialist", "Long lasting", "Quick add-on"]
  },
  {
    _id: "engine_wash",
    name: "Engine Wash",
    price: 400,
    duration: 45,
    description: "Engine bay cleaning",
    fullDescription: "Safe engine degreasing and compartment cleaning.",
    image: "/client/image/Engine_Cleaning.jpg",
    bulletPoints: ["Safe chemicals", "Engine protection", "Performance boost"]
  },
  {
    _id: "headlight_restoration",
    name: "Headlight Restoration",
    price: 500,
    duration: 60,
    description: "Restore headlight clarity",
    fullDescription: "Oxidation removal, restore brightness and safety.",
    image: "/client/image/Headlight_restoration.jpg",
    bulletPoints: ["Night driving safe", "UV coating", "Crystal clear"]
  },
  {
    _id: "wax_polish",
    name: "Wax & Polish",
    price: 800,
    duration: 90,
    description: "Protect and shine your car",
    fullDescription: "Premium wax and polish for protection and mirror shine.",
    image: "/client/image/Wax_&_Polish.jpg",
    bulletPoints: ["UV protection", "Weeks of shine", "Paint safe"]
  },
  {
    _id: "scratch_removal",
    name: "Scratch Removal",
    price: 1200,
    duration: 120,
    description: "Minor scratch repair",
    fullDescription: "Light scratch removal and paint correction.",
    image: "/client/image/Scratch_removal.jpg",
    bulletPoints: ["Minor swirls", "Professional compounds", "No repainting"]
  },
  {
    _id: "ceramic_coating",
    name: "Ceramic Coating",
    price: 5000,
    duration: 240,
    description: "Long-term paint protection",
    fullDescription: "Premium ceramic coating - hydrophobic, self-cleaning protection.",
    image: "/client/image/Ceramic_coating.jpg",
    bulletPoints: ["5+ years protection", "Easy maintenance", "Gloss enhancement"]
  }
];

async function seedServices() {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/carwashpro";
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB:', MONGO_URI);
    
    await Service.deleteMany({});
    console.log('🗑️ Cleared existing services');
    
    await Service.insertMany(syncedServices);
    console.log(`✅ Inserted ${syncedServices.length} services PERFECTLY MATCHING CLIENT`);
    console.log('💯 Basic Wash now ₱200 like your client!');
    console.log('🔄 Restart server and refresh admin/client pages');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

seedServices();

const mongoose = require('mongoose');
const Offer = require('../models/Offer.js');

async function seedOffers() {
  await mongoose.connect('mongodb://localhost:27017/carwash_pro', { useNewUrlParser: true, useUnifiedTopology: true });

  const offers = [
    {
      name: 'New Customer 10% Off',
      discount: 10,
      description: 'First time customers get 10% off any service',
      expiry: '2026-12-31'
    },
    {
      name: 'Weekend Special',
      discount: 15,
      description: '15% off Fri-Sun bookings',
      expiry: 'ongoing'
    },
    {
      name: '5% off for a Student Customer',
      discount: 5,
      description: 'A client that is studying and currently on school',
      expiry: '2026-11-30'
    },
    {
      name: 'hhhhh',
      discount: 20,
      description: 'aaaaaaaaaaaaaaaaaaaaaaaa',
      expiry: '2026-04-22'
    }
  ];

  for (const offerData of offers) {
    const existingOffer = await Offer.findOne({ name: offerData.name });
    if (!existingOffer) {
      const offer = new Offer(offerData);
      await offer.save();
      console.log(`Created offer: ${offerData.name}`);
    } else {
      console.log(`Offer already exists: ${offerData.name}`);
    }
  }

  console.log('Offers seeding completed.');
  process.exit(0);
}

seedOffers().catch(console.error);

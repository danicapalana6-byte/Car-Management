const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

mongoose.connect("mongodb://127.0.0.1:27017/carwashpro")
.then(async () => {

    const hash = await bcrypt.hash("admin123", 10);

    const user = new User({
        username: "admin",
        password: hash
    });

    await user.save();

    console.log("Admin user created!");

    mongoose.disconnect();
})
.catch(err => console.log(err));
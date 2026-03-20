const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

/* =========================
LOGIN ROUTE
========================= */

router.post("/login", async(req,res)=>{

try{

const {username,password} = req.body;

const user = await User.findOne({username});

if(!user){
return res.status(400).json({message:"User not found"});
}

const validPassword = await bcrypt.compare(password,user.password);

if(!validPassword){
return res.status(400).json({message:"Wrong password"});
}

const token = jwt.sign(
{id:user._id},
"secret",
{expiresIn:"1h"}
);

res.json({
token,
message:"Login Success"
});

}catch(err){
console.log(err);
res.status(500).json({message:"Server Error"});
}

});

module.exports = router;
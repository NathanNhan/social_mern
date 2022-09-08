const User = require("../model/User");

const router = require("express").Router();
const bcrypt = require("bcrypt");


router.post("/register" , async (req,res) => {
    try {
       const salt = await bcrypt.genSalt(10);
       const hashedPass = await bcrypt.hash(req.body.password , salt);
       const newUser = await User.create({
         username: req.body.username,
         email: req.body.email,
         password: hashedPass,
       });
       res.status(200).json(newUser);
    } catch(error) {
       res.status(500).json(error);
    }
})



router.post("/login" , async (req,res) => {
    try {
       const user = await User.findOne({email : req.body.email});
       if(!user) {
        return res.status(404).json("user not found");
       }
       //validate password
       const validatePass = await bcrypt.compare(req.body.password , user.password);
       if (!validatePass) {
        return res.status(400).json("Wrong password!");
       }
       const {password , ...others} = user._doc;
       res.status(200).json(others);
    } catch(error) {
        res.status(500).json(error);
    }
})

module.exports = router;
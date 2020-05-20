const express = require("express");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");
const path = require('path');
const ws = require('../config/ws');
var tokenn;

const User = require("../model/User");

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */

router.get('/donor/login',function(req,res){
        res.sendFile(path.resolve('frontend/public/donor-login.html'))
    });

router.get('/donor/signup',function(req,res){
    res.sendFile(path.resolve('frontend/public/donor-register.html'))
});

router.get('/donorhome',function(req,res){
    res.sendFile(path.resolve('frontend/public/donor-home.html'))
});


router.post(
  "/donor/signup",
  [
    check("username", "Please Enter a Valid Username")
      .not()
      .isEmpty(),
    check("password", "Please enter a valid password").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { username, wallet, password } = req.body;
    // if(!web3.utils.isAddress(wallet)){
    //   return res.status(400).json({
    //     errors: "Invalid wallet address"
    //   });
    // }
    try {
      let user = await User.findOne({
        username
      });
      if (user) {
        return res.status(400).json({
          msg: "User Already Exists"
        });
      }

      ws.Instance.post('/donor_signup', {
        name: "Rakshit", //Input from FrontEnd
        email: "rakshit.mit@gmail.com", //FrontEnd Input
        wallet: "0x4a3f2c1e48Ffb4A95417354921ede30C08781d23"	//Autoincrement index pick from backend
      })
      .then(function (response) {
        console.log(data);
        if (!response.data.success){
          process.exit(0);
        }

        if (data.type == 'event' && data.event_name == 'SignUp'){
          console.log('New Account created Successfully', response.data);
          let index = response.data.event_data["index"];
          user = new User({ 
                index,
                username,
                wallet,
                password
          });
        }
  
        const salt = bcrypt.genSalt(10);
        user.password = bcrypt.hash(password, salt);
  
        user.save();
      })
      .catch(function (error) {
        if (error.response.data){
          console.log(error.response.data);
          if (error.response.data.error == 'unknown contract'){
            console.error('You filled in the wrong contract address!');
          }
        } else {
          console.log(error.response);
        }
        process.exit(0);
      });

    } catch (err) {
      console.log(err.message);
      res.status(500).send("Error in Saving");
    }
  }
);

router.post(
  "/donor/login",
  [
    check("username", "Please Enter a Valid Username")
      .not()
      .isEmpty(),
    check("password", "Please enter a valid password").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { username, password } = req.body;
    try {
      let user = await User.findOne({
        username
      });
      if (!user)
        return res.status(400).json({
          message: "User Not Exist"
        });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({
          message: "Incorrect Password !"
        });

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 3600
        },
        (err, token) => {
          if (err) throw err;
          tokenn = token
          console.log(tokenn);
          res.send("OK");
          // res.redirect("http://localhost:4000/donor/home");
        }
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({
        message: "Server Error"
      });
    }
  }
);

/**
 * @method - POST
 * @description - Get LoggedIn User
 * @param - /user/me
 */

router.get("/me", auth, async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
});

module.exports = router;

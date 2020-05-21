const express = require("express");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");
const path = require('path');
const wsk = require('../config/ws');

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

      wsk.Instance.post('/donor_signup', {
        name: username, //Input from FrontEnd
        wallet: wallet	//Autoincrement index pick from backend
      })
      .then(function (response) {
        console.log(response.data);
        if (!response.data.success){
          process.exit(0);
        }
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
      wsk.ws.on('message', function incoming(data) {
           data = JSON.parse(data);
      if (data.type == 'event' && data.event_name == 'SignUp'){
        console.log('New Account created Successfully', data);
        let index = data.event_data["index"];
        user = new User({ 
              index,
              username,
              wallet,
              password
        });
        /*
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      */
      console.log(user);
      user.save();
      res.redirect("http://localhost:4000/donor/login");
    }
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

      
      if (user.password != password)
        return res.status(400).json({
          message: "Incorrect Password !"
        });
      
      res.send("OK");
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

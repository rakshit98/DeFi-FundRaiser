const express = require("express");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");
const path = require('path');
const wsk = require('../config/ws');

const Fundraiser = require("../model/Fundraiser");

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */


router.get('/fundraiser/create',function(req,res){
    res.sendFile(path.resolve('frontend/public/fundraiser-form.html'))
});


router.post(
  "/fundraiser/create",
  [
    check("name", "Please Enter a Valid Name")
      .not()
      .isEmpty(),
    check("wallet", "Please Enter a Valid Wallet Address")
      .not()
      .isEmpty(),
    check("target", "Please enter a valid target")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { name, wallet, target } = req.body;
    // if(!web3.utils.isAddress(wallet)){
    //   return res.status(400).json({
    //     errors: "Invalid wallet address"
    //   });
    // }
    try {
      let ngo = await Ngo.findOne({
        name
      });
      if (ngo) {
        return res.status(400).json({
          msg: "NGO Already Exists"
        });
      }

      wsk.Instance.post('/ngo_signup', {
        ngo_name: name, //Input from FrontEnd
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
        console.log('NGO Account created Successfully', data);
        let index = data.event_data["index"];
        ngo = new Ngo({ 
              index,
              name,
              wallet,
              password
        });
        /*
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      */
      console.log(ngo);
      ngo.save();
      res.redirect("http://localhost:4000/ngo/login");
    }
    });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Error in Saving");
    }
  }
);

router.post(
  "/ngo/login",
  [
    check("name", "Please Enter a Valid Username")
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

    const { name, password } = req.body;
    try {
      let ngo = await Ngo.findOne({
        name
      });
      if (!ngo)
        return res.status(400).json({
          message: "NGO does not Exist"
        });

      //const isMatch = await bcrypt.compare(password, ngo.password);
      if (ngo.password != password)
        return res.status(400).json({
          message: "Incorrect Password !"
        });
      res.redirect("http://localhost:4000/ngo/home");
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
 * @param - /ngo/me
 */

// router.get("/me", auth, async (req, res) => {
//   try {
//     // request.user is getting fetched from Middleware after token authentication
//     const user = await User.findById(req.user.id);
//     res.json(user);
//   } catch (e) {
//     res.send({ message: "Error in Fetching user" });
//   }
// });

module.exports = router;

const express = require("express");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");
const path = require('path');
const wsk = require('../config/ws');
const logg = require('../globals/globals');
const Fundraiser = require("../model/Fundraiser");
const NGO = require('../model/Ngo');
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
    var ngoName = logg.loggedinNgo;
    var owner;
    const { name, wallet, target } = req.body;
    // if(!web3.utils.isAddress(wallet)){
    //   return res.status(400).json({
    //     errors: "Invalid wallet address"
    //   });
    // }
    try {
      let fr = await Fundraiser.findOne({
        name
      });

      if (fr) {
        return res.status(400).json({
          msg: "Fundraiser Already Running."
        });
      }

      let find = await NGO.findOne({
        name: ngoName
      });
      if(find) {
          owner = find.index;
      }
      wsk.Instance.post('/create_fundraiser', {
        fundraiser_name: name, //Input from FrontEnd
        fundraiser_target: target,
        owner: owner,
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
      if (data.type == 'event' && data.event_name == 'Fundraiser'){
        console.log('Fund Raiser Started', data);
        let index = data.event_data["index"];
        fr = new Fundraiser({ 
              index,
              name,
              wallet,
              owner,
              target
        });
        /*
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      */
      fr.save();
      res.redirect("http://localhost:4000/ngo/home");
    }
    });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Error in Saving");
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

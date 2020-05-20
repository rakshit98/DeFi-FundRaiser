const express = require("express");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");
const path = require('path');
var tokenn;

const Ngo = require("../model/Ngo");

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */


router.get('/ngo/login',function(req,res){
    res.sendFile(path.resolve('frontend/public/ngo-login.html'))
});

router.get('/ngo/signup',function(req,res){
    res.sendFile(path.resolve('frontend/public/ngo-register.html'))
});

router.get('/ngohome',function(req,res){
    res.sendFile(path.resolve('frontend/public/ngo-home.html'))
});


router.post(
  "/ngo/signup",
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

    const { name, wallet, password } = req.body;
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
          msg: "ngo Already Exists"
        });
      }

      ngo = new Ngo({
        name,
        wallet,
        password
      });
      console.log(ngo);
      const salt = await bcrypt.genSalt(10);
      ngo.password = await bcrypt.hash(password, salt);

      await ngo.save();

      const payload = {
        ngo: {
          id: ngo.id
        }
      };

      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 10000
        },
        (err, token) => {
          if (err) throw err;
          tokenn = token
          console.log(tokenn);
          res.redirect("http://localhost:4000/ngo/login");
        }
      );
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

      const isMatch = await bcrypt.compare(password, ngo.password);
      if (!isMatch)
        return res.status(400).json({
          message: "Incorrect Password !"
        });

      const payload = {
        ngo: {
          id: ngo.id
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
          res.redirect("http://localhost:4000/ngohome");
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

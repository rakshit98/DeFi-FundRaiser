var path = require('path');
var express = require('express');
var router = express.Router();
var Donor = require('../models/donor.js');

module.exports = (app) => {

    // Create a new fundraiser
    // app.post('/fundraiser', donors.signUp);


    //Login and Register Routes
    app.get('/donorlogin',function(req,res){
        res.sendFile(path.resolve('frontend/public/donor-login.html'))
    });

    app.get('/ngologin',function(req,res){
        res.sendFile(path.resolve('frontend/public/ngo-login.html'))
    });

    app.get('/donorregister',function(req,res){
        res.sendFile(path.resolve('frontend/public/donor-register.html'))
    });

    app.get('/ngoregister',function(req,res){
        res.sendFile(path.resolve('frontend/public/ngo-register.html'))
    });

    app.get('/donorhome',function(req,res){
        res.sendFile(path.resolve('frontend/public/donor-home.html'))
    });

    app.post('/donor',function(req,res){
        if ( req.body.username &&
        req.body.password &&
        req.body.wallet) {

        var donorData = {
          username: req.body.username,
          password: req.body.password,
          wallet: req.body.wallet
        }

        Donor.create(donorData, function (error, user) {
          if (error) {
            return error;
          } else {
            req.session.userId = user._id;
            return res.redirect('/donorprofile');
          }
        });

      } else if (req.body.logusername && req.body.logpassword) {
        Donor.authenticate(req.body.logusername, req.body.logpassword, function (error, user) {
          if (error || !user) {
            var err = new Error('Wrong username or password.');
            err.status = 401;
            return err;
          } else {
            req.session.donorId = user._id;
            return res.redirect('/donorprofile');
          }
        });
      } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return err;
      }
    });

    router.get('/profile', function (req, res, next) {
      Donor.findById(req.session.donorId)
        .exec(function (error, user) {
          if (error) {
            return next(error);
          } else {
            if (user === null) {
              var err = new Error('Not authorized! Go back!');
              err.status = 400;
              return next(err);
            } else {
              return res.send('<h1>Name: </h1>' + user.username + '<h2>Wallet: </h2>' + user.wallet + '<br><a type="button" href="/logout">Logout</a>')
            }
          }
        });
    });

    // GET for logout logout
    router.get('/logout', function (req, res, next) {
      if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
          if (err) {
            return next(err);
          } else {
            return res.redirect('/');
          }
        });
      }
    });
    // // Retrieve all donors
    // app.post('/donorregister',donors.signUp);

    // Retrieve a single fundraiser with fundraiserId
    // app.get('/fundraiser/:fundraiserId', donors.findOne);

    // Update a fundraiser with fundraiserId
    // app.put('/fundraiser/:fundraiserId', donors.update);

    // Delete a fundraiser with fundraiserId
    // app.delete('/fundraiser/:fundraiserId', donors.delete);
}
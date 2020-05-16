const Donor = require('../models/donor.js');
const WebSocket = require('ws');
const config = require('../../config.js');
const mongo = require('mongodb').MongoClient
const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
var mongoUtil = require('../../config/mongoUtil.js');
var db = mongoUtil.getDb();

// passport.authenticate('local', { failureRedirect: '/login' }),
//       function(req, res) {
//         res.redirect('/');
//     }
var Collection = db.collection('donors');
// // passport.use(Donor.createStrategy());
// passport.use(new LocalStrategy(
//   function(username, password, done) {
//     Collection.findOne({ username: username }, function (err, user) {
//       if (err) { return done(err); }
//       if (!user) { return done(null, false); }
//       if (!user.verifyPassword(password)) { return done(null, false); }
//       return done(null, user);
//     });
//   }
// ));
// passport.serializeUser(Donor.serializeUser());
// passport.deserializeUser(Donor.deserializeUser());
// Create and Save a new Donor
exports.signUp = (req, res) => {
    // Validate request
    if(!req.body.content) {
        return res.status(400).send({
            message: "Target can not be empty"
        });
    }

    if(Collection.count({name:req.body.username}) > 0){
    	alert('Username already taken!');
    	res.redirect('/');
    }


    // Create a Donor
    const donor = new Donor({
        name: req.body.name || "Noname", 
        email: req.body.email,
        wallet: req.body.wallet
    });

    // Save Donor in the database
    donor.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the account."
        });
    });
};

exports.login = (req,res,next) => {
	passport.authenticate('local',
  (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.redirect('/login?info=' + info);
    }

    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }

      return res.redirect('/');
    });

  })(req, res, next);
}

// Retrieve and return all donors from the database.
exports.findAll = (req, res) => {
    Collection.find()
    .then(donors => {
        res.send(donors);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving donors."
        });
    });
};

// Find a single donor with a donorId
exports.findOne = (req, res) => {
    Note.findById(req.params.noteId)
    .then(donor => {
        if(!donor) {
            return res.status(404).send({
                message: "Donor not found with id " + req.params.donorId
            });            
        }
        res.send(donor);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Donor not found with id " + req.params.donorId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving donor with id " + req.params.donorId
        });
    });
};

// Update a donor identified by the donorId in the request
// exports.update = (req, res) => {
//     // Validate Request
//     if(!req.body.content) {
//         return res.status(400).send({
//             message: "donor content can not be empty"
//         });
//     }

//     // Find donor and update it with the request body
//     Donor.findByIdAndUpdate(req.params.fundraiserId, {
//         title: req.body.title || "Untitled Fundraiser",
//         content: req.body.content
//     }, {new: true})
//     .then(fundraiser => {
//         if(!fundraiser) {
//             return res.status(404).send({
//                 message: "Fundraiser not found with id " + req.params.fundraiserId
//             });
//         }
//         res.send(fundraiser);
//     }).catch(err => {
//         if(err.kind === 'ObjectId') {
//             return res.status(404).send({
//                 message: "Fundraiser not found with id " + req.params.fundraiserId
//             });                
//         }
//         return res.status(500).send({
//             message: "Error updating fundraiser with id " + req.params.fundraiserId
//         });
//     });
// };

// Delete a fundraiser with the specified fundraiserId in the request
exports.delete = (req, res) => {
    Donor.findByIdAndRemove(req.params.fundraiserId)
    .then(donor => {
        if(!donor) {
            return res.status(404).send({
                message: "Donor not found with id " + req.params.donorId
            });
        }
        res.send({message: "Donor deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Donor not found with id " + req.params.donorId
            });                
        }
        return res.status(500).send({
            message: "Could not delete donor with id " + req.params.donorId
        });
    });
};
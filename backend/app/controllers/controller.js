const Donor = require('../models/donor.js');
const WebSocket = require('ws');
const config = require('../../config.js');
const mongo = require('mongodb').MongoClient
const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');

passport.use(Donor.createStrategy());

passport.serializeUser(Donor.serializeUser());
passport.deserializeUser(Donor.deserializeUser());

// Create and Save a new Donor
exports.signUp = (req, res) => {
    // Validate request
    if(!req.body.content) {
        return res.status(400).send({
            message: "Target can not be empty"
        });
    }

    // Create a Donor
    const donor = new Donor({
        name: req.body.name || "Noname", 
        target: req.body.target
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
    Fundraiser.find()
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
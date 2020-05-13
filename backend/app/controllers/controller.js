const Fundraiser = require('../models/model.js');
const WebSocket = require('ws');
const config = require('../../config.js');
const mongo = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'

// Create and Save a new Fundraiser
exports.signUp = (req, res) => {
    // Validate request
    if(!req.body.content) {
        return res.status(400).send({
            message: "Target can not be empty"
        });
    }

    // Create a Fundraiser
    const fundraiser = new Fundraiser({
        name: req.body.name || "Noname", 
        target: req.body.target
    });

    // Save Fundraiser in the database
    fundraiser.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the account."
        });
    });
};

// Retrieve and return all fundraisers from the database.
exports.findAll = (req, res) => {
    Fundraiser.find()
    .then(fundraisers => {
        res.send(fundraisers);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving fundraisers."
        });
    });
};

// Find a single fundraiser with a fundraiserId
exports.findOne = (req, res) => {
    Note.findById(req.params.noteId)
    .then(fundraiser => {
        if(!fundraiser) {
            return res.status(404).send({
                message: "Fundraiser not found with id " + req.params.fundraiserId
            });            
        }
        res.send(fundraiser);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Fundraiser not found with id " + req.params.fundraiserId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving fundraiser with id " + req.params.fundraiserId
        });
    });
};

// Update a fundraiser identified by the fundraiserId in the request
// exports.update = (req, res) => {
//     // Validate Request
//     if(!req.body.content) {
//         return res.status(400).send({
//             message: "Fundraiser content can not be empty"
//         });
//     }

//     // Find fundraiser and update it with the request body
//     Fundraiser.findByIdAndUpdate(req.params.fundraiserId, {
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
    Fundraiser.findByIdAndRemove(req.params.fundraiserId)
    .then(fundraiser => {
        if(!fundraiser) {
            return res.status(404).send({
                message: "Fundraiser not found with id " + req.params.fundraiserId
            });
        }
        res.send({message: "Fundraiser deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Fundraiser not found with id " + req.params.fundraiserId
            });                
        }
        return res.status(500).send({
            message: "Could not delete fundraiser with id " + req.params.fundraiserId
        });
    });
};
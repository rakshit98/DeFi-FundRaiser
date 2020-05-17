const mongoose = require('mongoose');

const donorSchema = mongoose.Schema({
    username: String,
    password: String,
    wallet: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Donor', donorSchema, 'donors');
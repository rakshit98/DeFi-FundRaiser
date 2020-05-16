const mongoose = require('mongoose');

const donorSchema = mongoose.Schema({
    name: String,
    email: String,
    wallet: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Donor', donorSchema);
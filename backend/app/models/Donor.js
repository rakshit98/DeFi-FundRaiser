const mongoose = require('mongoose');

const DonorSchema = mongoose.Schema({
    name: String,
    email: String,
    wallet: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Donor', DonorSchema);
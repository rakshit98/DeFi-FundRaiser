const mongoose = require('mongoose');

const FundraiserSchema = mongoose.Schema({
    name: String,
    target: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Fundraiser', FundraiserSchema);
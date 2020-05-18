var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

const DonorSchema = mongoose.Schema({
    username: {
    	type:String,
    	required:true,
    	unique: true
    },
    password: {
    	type:String,
    	required: true,
    },
    wallet: {
    	type:String,
    	required: true,
    	unique: true
    }
});

DonorSchema.statics.authenticate = function (username, password, callback) {
  Donor.findOne({ username: username })
    .exec(function (err, donor) {
      if (err) {
        return callback(err)
      } else if (!donor) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, donor.password, function (err, result) {
        if (result === true) {
          return callback(null, donor);
        } else {
          return callback();
        }
      })
    });
}

//hashing a password before saving it to the database
DonorSchema.pre('save', function (next) {
  var donor = this;
  bcrypt.hash(donor.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    donor.password = hash;
    next();
  })
});

var Donor = mongoose.model('Donor', DonorSchema);
module.exports = Donor;
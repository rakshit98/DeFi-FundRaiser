const mongoose = require("mongoose");

const NgoSchema = mongoose.Schema({
  index: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  wallet: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

// export model user with UserSchema
module.exports = mongoose.model("ngo", NgoSchema);
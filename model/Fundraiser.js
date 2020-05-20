const mongoose = require("mongoose");

const FundRaiserSchema = mongoose.Schema({
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
  owner: {
    type: Number,
    required: true
  },
  target: {
      type: Number,
      required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

// export model user with UserSchema
module.exports = mongoose.model("fundraiser", FundRaiserSchema);
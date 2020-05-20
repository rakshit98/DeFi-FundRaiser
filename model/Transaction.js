const mongoose = require("mongoose");

const TransactionSchema = mongoose.Schema({
  sender: {
    type: Number,
    required: true
  },
  recipient: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

// export model user with UserSchema
module.exports = mongoose.model("transaction", TransactionSchema);
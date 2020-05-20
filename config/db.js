const mongoose = require("mongoose");

// Replace this with your MONGOURI.
const MONGOURI = "mongodb://rakshit:rakshit1@ds137857.mlab.com:37857/fundraiserdb";

const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(MONGOURI, {
      useNewUrlParser: true
    });
    console.log("Connected to DB !!");
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = InitiateMongoServer;

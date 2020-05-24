const mongoose = require("mongoose");

// Replace this with your MONGOURI.
const MONGOURI = "mongodb://rishabhguha:rishabh1@ds137857.mlab.com:37857/fundraiserdb";
// mongodb://rishabhguha:rishabh1@ds233739.mlab.com:33739/blog_app
const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(MONGOURI, {
      useNewUrlParser: true
    });
    mongoose.set('useFindAndModify', false);
    console.log("Connected to DB !!");
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = InitiateMongoServer;

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const WebSocket = require('ws');
const config = require('./backend/config.js');
const mongo = require('mongodb').MongoClient
var path = require('path');
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');
var mongoUtil = require( './backend/config/mongoUtil.js' );

mongoUtil.connectToServer( function( err, client ) {
  if (err) console.log(err);
  // start the rest of your app here
      if (!config.apiKey || !config.NGOContractAddress){
        console.error('Fill up all values in config.js');
        process.exit(0);
    }

    var wsSessionID, gotEvent;

    const NGOInstance = axios.create({
        baseURL: config.apiPrefix + config.NGOContractAddress,
        timeout: 5000,
        headers: {'X-API-KEY': config.apiKey}
    });

    const ws = new WebSocket(config.wsUrl);

    // create express app
    const app = express();

    // parse requests of content-type - application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: true }))

    // parse requests of content-type - application/json
    app.use(bodyParser.json())
    const expressSession = require('express-session')({
      secret: 'secret',
      resave: false,
      saveUninitialized: false
    });

    app.use(expressSession);
    app.use(express.static(__dirname + '/frontend/'));
    // define a simple route
    app.get('/', (req, res) => {
        res.sendFile(path.resolve('./frontend/public/landing.html'));
    });

    require('./backend/app/routes/routes.js')(app);

    app.use(passport.initialize());
    app.use(passport.session());

    // Configuring the database
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/crowdfunddb',
      { useNewUrlParser: true, useUnifiedTopology: true });

    // listen for requests
    app.listen(3000, () => {
        console.log("Server is listening on port 3000");
    });

} );


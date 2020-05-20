const express = require("express");
const bodyParser = require("body-parser");
const Userroutes = require("./routes/user");
const Ngoroutes = require("./routes/ngo");
const InitiateMongoServer = require("./config/db");
const path = require('path');
const ws = require('./config/ws');
// Initiate Mongo Server
InitiateMongoServer();

const app = express();

// PORT
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.static(__dirname + '/frontend'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * Router Middleware
 * Router - /routes/*
 * Method - *
 */
app.use('/', Userroutes);
app.use('/', Ngoroutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/frontend/public/landing.html'));
});



app.listen(PORT, (req, res) => {
  console.log(`Server Started at PORT ${PORT}`);
});

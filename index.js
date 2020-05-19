const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes/user");
const InitiateMongoServer = require("./config/db");
const path = require('path');

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
app.use('/', routes);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/frontend/public/landing.html'));
});



app.listen(PORT, (req, res) => {
  console.log(`Server Started at PORT ${PORT}`);
});

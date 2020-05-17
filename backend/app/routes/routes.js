var path = require('path');
module.exports = (app) => {
    const donors = require('../controllers/controller.js');

    // Create a new fundraiser
    // app.post('/fundraiser', donors.signUp);


    //Login and Register Routes
    app.get('/donorlogin',function(req,res){
        res.sendFile(path.resolve('frontend/public/donor-login.html'))
    });

    app.get('/ngologin',function(req,res){
        res.sendFile(path.resolve('frontend/public/ngo-login.html'))
    });

    app.get('/donorregister',function(req,res){
        res.sendFile(path.resolve('frontend/public/donor-register.html'))
    });

    app.get('/ngoregister',function(req,res){
        res.sendFile(path.resolve('frontend/public/ngo-register.html'))
    });

    app.post('/donorregister',donors.signUp);

    // app.post('/donorlogin',donors.login);
    // // Retrieve all donors
    // app.post('/donorregister',donors.signUp);

    // Retrieve a single fundraiser with fundraiserId
    // app.get('/fundraiser/:fundraiserId', donors.findOne);

    // Update a fundraiser with fundraiserId
    // app.put('/fundraiser/:fundraiserId', donors.update);

    // Delete a fundraiser with fundraiserId
    // app.delete('/fundraiser/:fundraiserId', donors.delete);
}
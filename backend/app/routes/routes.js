module.exports = (app) => {
    const fundraisers = require('../controllers/controller.js');

    // Create a new fundraiser
    // app.post('/fundraiser', fundraisers.signUp);

    // Retrieve all fundraisers
    app.get('/fundraiser', fundraisers.signUp);

    // Retrieve a single fundraiser with fundraiserId
    app.get('/fundraiser/:fundraiserId', fundraisers.findOne);

    // Update a fundraiser with fundraiserId
    app.put('/fundraiser/:fundraiserId', fundraisers.update);

    // Delete a fundraiser with fundraiserId
    app.delete('/fundraiser/:fundraiserId', fundraisers.delete);
}
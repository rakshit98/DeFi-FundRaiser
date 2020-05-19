const axios = require('axios');
const WebSocket = require('ws');
const config = require('./config.js');
const mongo = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'


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

ws.on('open', function open() {
	ws.send(JSON.stringify({
		'command': 'register',
		'key': config.apiKey
	}));
});

ws.on('message', function incoming(data) {
	data = JSON.parse(data);
	//console.log('Got WS data', data);
	if (data.command == 'register:nack'){
		console.error('Bad apiKey set!');
	}
	if (data.command == 'register:ack'){
		wsSessionID = data.sessionID;
		NGOInstance.post('/donor_to_fundraiser', {
			donor_id: 2, //Input from FrontEnd
			fundraiser_id:2, //FrontEnd Input
			amount: 49	//Autoincrement index pick from backend
		})
		.then(function (response) {
			console.log(response.data);
			if (!response.data.success){
				process.exit(0);
			}
		})
		.catch(function (error) {
			if (error.response.data){
				console.log(error.response.data);
				if (error.response.data.error == 'unknown contract'){
					console.error('You filled in the wrong contract address!');
				}
			} else {
				console.log(error.response);
			}
			process.exit(0);
		});
		/*
			Our service expects a hearbeat every 30 seconds to keep WS connections. Since this is a one time call, we don't need to remain connected.
		*/
		//setTimeout(heartbeat, 30000);
	}
	if (data.type == 'event' && data.event_name == 'Transfer'){
		console.log('Amount Transferred', data);
		
		mongo.connect(url, {
   		useNewUrlParser: true,
    	useUnifiedTopology: true
  		}, (err, client) => {
  		if (err) {
    	console.error(err)
    	return
  		}

  		console.log("Connected to Database");
  
  		const db = client.db('FundRaiser');
		var myobj = { sender : data.event_data["sender"], recipient : data.event_data["receiver"], amount : data.event_data["amount"], status : 0};  
		db.collection("Donor_Transactions").insertOne(myobj, function(err, res) {  
		if (err) throw err;  
		console.log("1 record inserted");   
		});
	});

		NGOInstance.post('/milestone', {
			fundraiser_id: 2, //Input from FrontEnd
			amount: 49	
		})
		.then(function (response) {
			console.log(response.data);
			if (!response.data.success){
				process.exit(0);
			}
		})
		.catch(function (error) {
			if (error.response.data){
				console.log(error.response.data);
				if (error.response.data.error == 'unknown contract'){
					console.error('You filled in the wrong contract address!');
				}
			} else {
				console.log(error.response);
			}
			process.exit(0);
		});
	}
		if(data.type == 'event' && data.event_name == 'Milestone'){

		var transfer_amount = 0;

		console.log("Milestone Check....");
		mongo.connect(url, {
   		useNewUrlParser: true,
    	useUnifiedTopology: true
  		}, (err, client) => {
  		if (err) {
    	console.error(err)
    	return
  		}
  		console.log("Connected to Database");
  
  		const db = client.db('FundRaiser');
  		

  		console.log("Calculating money to transfer.");
  		db.collection("Donor_Transactions").aggregate([
  			{ $match: { status : 0}},
  			{
  				$group:
  				{
  					_id : '$recipient',
  					total: { $sum: '$amount'}
  				}
  			},
  			{ $match: {_id: 2}}
  			])
  			.toArray(function(err, result) {
  				console.log(result[0].total);
  				transfer_amount = result[0].total;  
  			});
  			 
  		console.log("updating Transaction Status.");
  		db.collection("Donor_Transactions").updateMany(
  		 { "$and" :[{recipient: 2},{status: 0}]}, 
  		 { $set: 
  		 	{ status: 1 }
  		 },
  		 	{multi: true})
		});


		console.log("Transferring amount to NGO.");
		console.log("Transferred money",transfer_amount);

		NGOInstance.post('/transfer', {
			fundraiser_id: 2, //Input from FrontEnd
			amount: transfer_amount	
		})
		.then(function (response) {
			console.log(response.data);
			if (!response.data.success){
				process.exit(0);
			}
		})
		.catch(function (error) {
			if (error.response.data){
				console.log(error.response.data);
				if (error.response.data.error == 'unknown contract'){
					console.error('You filled in the wrong contract address!');
				}
			} else {
				console.log(error.response);
			}
			process.exit(0);
		});
	}	
});

ws.on('close', function close() {
	//Websocket will auto disconnect if you do not send heartbeat.
	if (gotEvent){
		console.log('WS disconnected');
	} else {
		console.error('WS disconnected before we could receive an event - this should not have happened! Reach out to hello@blockvigil.com.');
	}
});
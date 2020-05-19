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
		console.log('Authenticated with WS');
		console.log('Writing to demo contract...');
		NGOInstance.post('/ngo_signup', {
			ngo_name: "NGO1", //Input from FrontEnd
			wallet: "0x482C012d0258Ed13de5FE5A369aac204cE69Ae62" //FrontEnd Input
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
	if (data.type == 'event' && data.event_name == 'SignUp'){
		console.log('New Account created Successfully', data);

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
		var myobj = { index : data.event_data["index"],NGO_name : data.event_data["name"]};  
		db.collection("NGO_Account").insertOne(myobj, function(err, res) {  
		if (err) throw err;  
		console.log("1 record inserted");   
		});
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
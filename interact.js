const axios = require('axios');
const WebSocket = require('ws');
const config = require('./config.js');
const jssha3 = require('js-sha3');
var Web3Utils = require('web3-utils');

//Call the script from CLI like this: node tokenBot.js address1 address2
var myArgs = process.argv.slice(2);

const address1 = myArgs[0];
const address2 = myArgs[1]; 
const amount = myArgs[2];

// const salt1 = 'f1nd1ngn3m0';
// const salt2 = 'f1nd1ngd0ry';

// const concat1 = ph1 + salt1;
// const concat2 = ph2 + salt2;
// const adr2 = Web3Utils.keccak256(concat2);
// const adr1 = Web3Utils.keccak256(concat1);

const tokenInstance = axios.create({
	baseURL: config.apiPrefix + config.contractAddress,
	timeout: 5000,
	headers: {'X-API-KEY': config.apiKey}
});

//something like: tokenInstance.post('/<methodname>', inputs)

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
		console.log('sending '+amount+' Dai from '+address1+' to '+address2);
		tokenInstance.post('/transferFrom', {
			from : address1,
			to: address2,
			value: amount
		})
		.then(function (response) {
			console.log(response.data);
			if (response.data.success){
				console.log('We are done here! Exiting...');
			}
			process.exit(0);
		})
		.catch(function (error) {
			if (error.response.data){
				console.log(error.response.data);
				if (error.response.data.error == 'unknown contract'){
					console.error('You filled in the wrong contract address!');
				}
				if (error.response.data.error == 'Transaction execution will fail with supplied arguments'){
					console.error(error.response.data.error);
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
		gotEvent = true;
		console.log("Transfer event emitted successfully");
	// 	console.log('Minted tokens successfully \n', data);
	// 	console.log('sending '+amount+' token() from '+address1+' to '+address2);
	// 	tokenInstance.post('/transferFrom', {
	// 		from : address1,
	// 		to: address2,
	// 		value: amount
	// 	})
	// 	.then(function (response) {
	// 		console.log(response.data);
	// 		if (response.data.success){
	// 			console.log('We are done here! Exiting...');
	// 		}
	// 		process.exit(0);
	// 	})
	// 	.catch(function (error) {
	// 		if (error.response.data){
	// 			console.log(error.response.data);
	// 			if (error.response.data.error == 'unknown contract'){
	// 				console.error('You filled in the wrong contract address!');
	// 			}
	// 			if (error.response.data.error == 'Transaction execution will fail with supplied arguments'){
	// 				console.error(error.response.data.error);
	// 			}
	// 		} else {
	// 			console.log(error.response);
	// 		}
	// 		process.exit(0);
	// 	});

	// }
	// if (data.type == 'event' && data.event_name == 'Transfer'){
	// 	console.log("Transfer event emitted successfully");
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

function heartbeat() {
	ws.send(JSON.stringify({
		command: "heartbeat",
		sessionID: wsSessionID
	}));
	setTimeout(heartbeat, 30000);
}



// if (data.type == 'event' && data.event_name == '<eventname>')

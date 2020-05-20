const axios = require('axios');
const WebSocket = require('ws');
const config = require('./config.js');

if (!config.apiKey || !config.NGOContractAddress){
    console.error('Fill up all values in config.js');
    process.exit(0);
  }

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
    console.log('API KEY Accepted');
    console.log(ws.url);
  });

module.exports = {
  ws : ws,
  Instance: NGOInstance
}
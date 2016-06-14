#!/usr/bin/env nodejs

var W3CWebSocket = require('websocket').w3cwebsocket,
    readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt('> ');
rl.on('line', (line) => {
    console.log("SENDING: "+line);
    client.send(line);
}).on('close', () => {
    process.exit();
});

if(process.argv.length < 4) {
    console.log("harness.js [app] [session]");
    process.exit();
}
 
var client = new W3CWebSocket('ws://localhost:80/Apps/'+process.argv[2]+"/", 'droidscript-gui-protocol',
    "localhost" /* origin */, {Cookie: "session="+process.argv[3]} /* headers */
);
 
client.onerror = function() {
    console.log('Connection Error');
};
 
client.onopen = function() {
    console.log('WebSocket Client Connected');
 
    if (client.readyState === client.OPEN) {
	//client.send(JSON.stringify({fn:'setApp', parms:['LightpoleRadio']}));
        //setTimeout(sendNumber, 10000);
    }
    function sendNumber() {
	var number=42;
            client.send(number.toString());
    }
};
 
client.onclose = function() {
    console.log('droidscript-gui-protocol Client Closed');
};
 
client.onmessage = function(e) {
    if (typeof e.data === 'string') {
        console.log("Received: " + e.data + "\n");
	rl.prompt();
    }
};

function send(obj) {
	client.send(JSON.stringify(obj));
}

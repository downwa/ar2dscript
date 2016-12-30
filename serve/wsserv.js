/* ar2dscript web socket server - nodejs implementation of DroidScript, running server apps via browser
 * Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */
//(typeof define !== "function" ? function($){ $(require, exports, module); } : define)(function(require, exports, module, undefined) {

exports.wsserv = wsserv;


/*
 * Web Socket Initialization
 */
function wsserv(httpServer) {
    const WebSocketServer = require('websocket').server;
    var wsServer = new WebSocketServer({httpServer: httpServer, autoAcceptConnections: false});
    wsServer.on('request', wsHandler);
    
    return true;
}

function wsHandler(request) {
    Fiber(function() {
	var proto=chooseProtocol(request.requestedProtocols);
	if (proto === null) {
	// Make sure we only accept requests from an allowed origin 
	request.reject();
	log((new Date()) + ' Connection using ' + request.requestedProtocols + ' rejected.');
	return;
	}
	if (!originIsAllowed(request.origin)) {
	// Make sure we only accept requests from an allowed origin 
	request.reject();
	log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
	return;
	}
	if(proto == "droidscript-gui-protocol") { dsgui(request); }
    }).run();
}

// *********************************************************************************

//});

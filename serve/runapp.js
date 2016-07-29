/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

const columnParser = require('node-column-parser'); // columnParser() 
const util = require('util');
const cp = require('child_process');
const vm = require('vm');

function runApp(app, session, connection) {
    try {
		log("RUN "+app.name+"; session="+session+"; connection="+connection+"; VERSION="+VERSION);
	
		// NOTE: Only one connection per session is supported.  Send message to previous connected tab/window
		// NOTE: to grey out so it appears inactive (as it is), and ask the client to disconnect.
		if(connection) {
			if(app.connection && app.connection != connection) { _send('dim', null, app); }
			app.connection=connection; // Save new connection
		}
		
		// NOTE: Ensure that functions use the global context 'app.context'
		initApp(app, app.name, app.name+".js");
    }
    catch(e) {
		log(colorsafe.red("runApp#1("+app.name+") ERROR: "+e.stack));
		app.connection.sendUTF(JSON.stringify({mid:0, fn:'alert', args:['Server Error#1: '+e.message]}));
		throw e;
    }
}

/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

const colorsafe=require('colors/safe');
const cheerio = require('cheerio');
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
	var sandbox={_app:app, _send,_send, log:log, loadScripts:loadScripts, readScripts:readScripts,
	    console:console, fsp:fsp, process:process, fs:fs, vm:vm, util:util, cheerio:cheerio, //require:require,
	    colors:colorsafe, os:os, fsp:fsp, cp:cp,
	    setTimeout:setTimeoutFiber, setInterval:setIntervalFiber
	};
	app.context = new vm.createContext(sandbox);
    }
    catch(e) {
	log(("runApp#1("+app.name+") ERROR: "+e.stack).red);
	app.connection.sendUTF(JSON.stringify({mid:0, fn:'alert', args:['Server Error#1: '+e.message]}));
	throw e;
    }

    // NOTE: Ensure that functions use the global context 'app.context'
    try { loadScripts(".", ['./prompt.js'], app.context, true); }
    catch(e) {
	log(("runApp#2("+app.name+") ERROR: "+e.stack).red);
	app.connection.sendUTF(JSON.stringify({mid:0, fn:'alert', args:['Server Error#2: '+e.message]}));
	throw e;
    }
    try { loadScripts(ds, ["assets/app.js"], app.context, false); }
    catch(e) {
	log(("runApp#3("+app.name+") ERROR: "+e.stack).red);
	app.connection.sendUTF(JSON.stringify({mid:0, fn:'alert', args:['Server Error#3: '+e.message]}));
	throw e;
    }
    try { loadScripts(app.name, [app.name+'.js'], app.context, false); }
    catch(e) {
	log(("runApp#4("+app.name+") ERROR: "+e.stack).red);
	app.connection.sendUTF(JSON.stringify({mid:0, fn:'alert', args:['Program Error#1: '+e.message]}));
	throw e;
    }
    try {
	//log("CALL OnStart()"); 
	vm.runInContext('OnStart()',app.context,{displayErrors:true});
    }
    catch(e) {
	log(("runApp#5("+app.name+") ERROR: "+e.stack).red);
	app.connection.sendUTF(JSON.stringify({mid:0, fn:'alert', args:['Program Error#2: '+e.message]}));
	throw e;
    }
}

// function runServiceReady(app, session, connection) {
//     try {
// 	vm.runInContext('OnServiceReady()',app.context,{displayErrors:true});
//     }
//     catch(e) {
// 	log(("runApp#6("+app.name+") ERROR: "+e.stack).red);
// 	app.connection.sendUTF(JSON.stringify({mid:0, fn:'alert', args:['Program Error#3: '+e.message]}));
// 	throw e;
//     }
// }
// 

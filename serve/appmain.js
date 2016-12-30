/* ar2dscript http server - nodejs implementation of DroidScript, running server apps via browser
 * Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */
//(typeof define !== "function" ? function($){ $(require, exports, module); } : define)(function(require, exports, module, undefined) {

exports.init = init;
exports.getApp = getApp;
exports.runApp = runApp;
exports.changedApps = changedApps;
exports.listAppsApks = listAppsApks;

const colorsafe = require('colors/safe');
const version = require('./version');
const PRODUCT=version.PRODUCT;
const VERSION=version.VERSION;
const Fiber = require('fibers'); // Threading
const ffs = require('./fiberfill'); // Replacements for fs blocking functions, using Fibers
const fsp = require('path'); // path join
const os = require('os'); // tmpdir

var omtime1=0,omtime2=0;

function init(options) {
    global.options=options;
    return this;
}

function getApp(name, session) {
    // FIXME: verify existence of app in appdir, apksdir first, return null if not found
    var appPath=fsp.join(global.options.appsDir, name, name + ".js");
    try {
	if(!ffs.statFiber(appPath).isFile()) {
	    appPath=fsp.join(global.options.appsDir, name + ".spk");
	    if(!statFiber(appPath).isFile()) {
		appPath=fsp.join(global.options.apksDir, name + ".apk");
		if(!ffs.statFiber(appPath).isFile()) { return null; }
	    }
	}
	console.info("getApp: appPath="+appPath+";session="+session);
	var aid=name+"-"+session;
	app=appState(aid); //_apps[aid];
	if(app == null) {
	    app={name:name, path:appPath, VERSION:VERSION, alarms:[], sent:[], services:[], Fiber:Fiber, session:session};
	    appState(aid, app);
	}
	return app;
    }
    catch(err) {
	if(err.code !== 'ENOENT') { console.error("getApp "+err); throw err; }
	return null;
    }
}

function appState(appId, state) {    
    var appStateFile=fsp.join(os.tmpdir(), "session-" + appId + ".json")
    if(state) { // Set state
	ffs.writeFileFiber(appStateFile, JSON.stringify(state)); // FIXME: Will crash if state is circular
	return;
    }
    var app=null;
    try { app=JSON.parse(ffs.readFileFiber(appStateFile)); }
    catch(err) {
	if(err.code !== 'ENOENT') { console.error("getApp "+err); throw err; }
	return null;
    }
    if(state) { console.debug(("STATE: "+appStateFile+"="+JSON.stringify(state)).blue); }
    console.log("appState: appId=",appId,";state=",state);
    return app;
}

function changedApps() { // If either appsDir or apksDir has been modified
    var mtime1=ffs.statFiber(options.appsDir).mtime;
    var mtime2=ffs.statFiber(options.apksDir).mtime;
    var c1=(omtime1 < mtime1);
    var c2=(omtime2 < mtime2);
    omtime1=mtime1; omtime2=mtime2;
    return {c1:c1, c2:c2};
}

function listAppsApks(listApps, listApks) {
    var apps=ffs.readdirFiber(options.appsDir).filter(function (file) {
	if(file.startsWith('.')) { return false; } // Ignore hidden files
	var ret=file.endsWith(".spk");
	if(!ret) {
	    try { ret=ffs.statFiber(fsp.join(options.appsDir,file,file)+'.js').isFile(); }
	    catch(e) {}
	}
	return ret;
    });
    ffs.readdirFiber(options.apksDir).filter(function (file) { return file.endsWith(".apk"); })
	.forEach( (file) => { apps.push(file); });
    apps.sort( (a,b) => {
	var aa=a.toLowerCase();
	var bb=b.toLowerCase();
	if(aa < bb) { return -1; }
	if(aa > bb) { return 1; }
	return 0;
    });
    return apps;
}

function runApp(app, awaitReturn) {    
    app.proc = require('child_process').fork('serve/startapp.js');

    app.proc.on('message', (msg) => {
	/*app.*/Fiber(function() { // Callbacks need a new fiber
	    //console.log('PARENT got message: ', msg);
	    if(msg._appLog) {
		process.stdout.write(colorsafe.cyan(msg._appLog));
	    }
	    else if (msg.msg && msg.msg._appForward) {
		// NOTE: Differing from Services (which use prompt() to run functions either locally or in the parent app),
		// NOTE: app messages are instead forwarded directly to the browser, and replys from browser are relayed to app.
		var s=msg.msg._appForward;
		app.proc.send({_appReply: _send(s.fn, s.args, app, msg.awaitReturn)}); // Forward reply of browser to child (app)
	    }
	    else if(msg._browserReply || msg._browserReplyErr) {
		console.log('PARENT got reply:', msg);
		app.curFiber.run({err:new Error(msg._browserReplyErr), data:msg._browserReply});
	    }
	    else {
		console.log('PARENT got invalid message:', msg);
		//this.onMessage(msg.msg); 
	    }
	}.bind(this)).run();
    });
    
    var cb=null;
    if(awaitReturn) {
        app.curFiber=/*app.*/Fiber.current;
        //cb=function(err, args) { fiber.run({err:err, data:args[0]}); }
    }
    //var msg={mid:_mid++, fn:fn, args:args, cb:cb};
    app.proc.send({start: app.name, session:app.session});
    if(awaitReturn) { 
        console.log("WAITING FOR APP...");
        var ret=/*app.*/Fiber.yield();
        console.log("RETURN FROM YIELD to APP: "+JSON.stringify(ret)+"***");
        if(ret.err) { throw ret.err; }
        return ret.data;
    }
    else { console.log("NOT WAITING for anyone..."); }
    return null;
}

// 
// *********************************************************************************

//});

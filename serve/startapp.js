/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

// NOTE: This is intended to be started as a child process by runapp.js

// if(!process.send) {
//     console.log("ERROR: not started as app.");
//     process.exit(1);
// }
// 
const Fiber = require('fibers'); // Threading
const ipc=require('node-ipc');
const fsp=require('path');
const ffs=require('./fiberfill');
const os=require('os');
//const vm=require('vm');

if(process.send) {
    process.stdout.write = process.stderr.write = function(data) {
	process.send({_appLog:data});
    }
}

process.on('uncaughtException', function(err) {
    console.error((err && err.stack) ? err.stack : err);
});

function ipcSetup(appId) {
    ipc.config.id = 'ar2dscript-'+appId;
    ipc.config.retry= 1500;
//    ipc.config.silent=true;
    ipc.serve(function() {
	ipc.server.on('app.message', function(data,socket){
		var obj={appId: data.appId, fn: data.fn, args: data.args};
		Fiber(function() { handleMessage(obj, socket); }).run();
	    }
	);
    });
    ipc.server.start();
}

function handleMessage(msg, socket) {
    console.log('CHILD handleMessage:', msg);
    var appId=msg.appId;
    var pName=fsp.join(os.tmpdir(), 'APP-'+appId+'.pid');
    var pid=-1;
    try { pid=ffs.readFileFiber(pName); }
    catch(e) {
	console.log("NEW SESSION: "+e.message); 
	ffs.writeFileFiber(pName, process.pid);
    }
    if(pid == -1) { startApp(appId); }
    else { runAppFn(appId, msg.fn, msg.args); }
// 	var aid=name+"-"+session;
// 	app=appState(aid); //_apps[aid];
// 	if(app == null) {
// 	    app={name:name, path:appPath, VERSION:VERSION, alarms:[], sent:[], services:[], Fiber:Fiber, session:session};
// 	    appState(aid, app);
    console.log("Sending reply to "+(socket?"caller":"browser")+"...");
    var reply="Here's your page";
    var rpyObj={_browserReply:reply};
    if(!socket) { process.send(rpyObj); }
    else { ipc.server.emit(socket,'app.message',JSON.stringify({id: ipc.config.id, message: rpyObj})); }

}

function startApp(appId) {
    ipcSetup(appId);

    // WRITE temp file consisting of 
    // exports.OnStart=OnStart;
    // PLUS contents of application's js
    
    navigator={userAgent:"ar2dscript"}; 
    prompt=function(a,b) { console.log('a=',a,'b=',b); }; 
    // FIXME: Use ar2dscript-specific tmp folder
    try {
	require('/tmp/app.js'); // From DroiScript (extracted and cached)
	require('/tmp/test2.js').OnStart();
    }
    catch(e) {
	console.error("ERROR",e.stack);
	process.send({_browserReplyErr:e.stack});
	return;
    }
}


console.log("RUNNING APP:",process.pid);

var _serviceFiber={fiber:null};
process.on('message', (msg) => { // Message from parent
    Fiber(function() {
	if (msg.start && msg.start != '') {
	    msg.appId=msg.start+'-'+msg.session;
	    handleMessage(msg);
	}
	else if(msg.fn) {
	    console.log("CHILD RECEIVED fn:",msg);
	}
	else {
	    if(msg.onClick) {
		console.log("CHILD RECEIVED click from browser:",msg);
		var onClick=app.context._objects[msg.onClick].onClick;
		//setTimeout(function() { this(); }.bind(onClick),0);
		onClick();
	    }
	    else {
		console.log("REPLIED TO WAITING CHILD from browser:",msg); // Resumes the _send function in main.js
		console.log((new Error("Checkpoint")).stack);
		if(_serviceFiber && _serviceFiber.fiber) { _serviceFiber.fiber.run({err:null, data:msg._appReply}); }
		else { console.log("startapp: No fiber to resume"); }
    //			_serviceFiber.fiber=null;
	    }
	}
    }).run();
});

setInterval(() => {
    console.log("APP "+process.pid+" still alive at "+new Date());
},60000);

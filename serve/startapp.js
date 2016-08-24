/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

// if(!process.send) {
//     console.log("ERROR: not started as app.");
//     process.exit(1);
// }

const Fiber = require('fibers'); // Threading
const fsp=require('path');
const fs=require('fs');
const os=require('os');
const vm=require('vm');

if(process.send) {
    process.stdout.write = process.stderr.write = function(data) {
	process.send({_appLog:data});
    }
}

process.on('uncaughtException', function(err) {
    console.error((err && err.stack) ? err.stack : err);
});

console.log("RUNNING APP:",process.pid);

var _serviceFiber={fiber:null};
process.on('message', (msg) => {
	Fiber(function() {
		if (msg.start && msg.start != '') {
			//console.log('CHILD got message:', msg);
			var pName=fsp.join(os.tmpdir(), 'APP-'+msg.start.replace(/\//g,'_')+'.pid');
			fs.writeFileSync(pName, process.pid);
			var scr=fs.readFileSync("serve/main.js", {encoding:"utf-8"});
			var sandbox={require:require, console:console, inApp:msg.start,
				process:process, fs:fs, vm:vm, os:os, setTimeout:setTimeout,
				setInterval:setInterval, _serviceFiber:_serviceFiber
			};
		
			var context = new vm.createContext(sandbox);
			vm.runInContext(scr, context, {filename:"serve/main.js"});
		}
		else {
			console.log("CHILD SENDING reply:",msg)
			_serviceFiber.fiber.run({err:null, data:msg._appReply});
//			_serviceFiber.fiber=null;
		}
	}).run();
});

setInterval(() => {
    console.log("APP "+process.pid+" still alive at "+new Date());
},10000);

/*
proc={"pid":"32409","command":"com.smartphoneremote.androidscriptfree:droidscript_service","arguments":""}
Desired output:
{"user":10230,"pid":32409,"name":"com.smartphoneremote.androidscriptfree:droidscript_service"} running
{"user":10031,"pid":4123,"name":"com.google.android.googlequicksearchbox:interactor"} running
{"user":10174,"pid":22127,"name":"adarshurs.android.vlcmobileremote"} running
{"user":1000,"pid":881,"name":"system"} running
*/


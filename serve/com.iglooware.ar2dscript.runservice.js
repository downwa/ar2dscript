/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

// if(!process.send) {
//     console.log("ERROR: not started as service.");
//     process.exit(1);
// }

const Fiber = require('fibers'); // Threading
const fs=require('fs');
const os=require('os');
const vm=require('vm');

console.log('was='+process.title);
process.title='com.iglooware.ar2dscript:droidscript_service';
console.log('title='+process.title);

if(process.send) {
    process.stdout.write = process.stderr.write = function(data) {
	process.send({_serviceLog:data});
    }
}

process.on('uncaughtException', function(err) {
    console.error((err && err.stack) ? err.stack : err);
});

console.log("RUNNING SERVICE");

process.on('message', (msg) => {
    console.log('CHILD got message:', msg);
	if (msg.start != '') {
		console.log('start='+msg.start);
		var scr=fs.readFileSync("serve/main.js", {encoding:"utf-8"});
		var sandbox={require:require, console:console, inService:msg.start,
			process:process, fs:fs, vm:vm, os:os, setTimeout:setTimeout,
			setInterval:setInterval
		};
	
		var context = new vm.createContext(sandbox);
		Fiber(function() {
			vm.runInContext(scr, context, {filename:"serve/main.js"});
		}).run();
		
	}
});

if(process.send) { process.send({_serviceReady: true}); }

setInterval(() => {
    console.log("SERVICE still alive at "+new Date());
},10000);

/*
proc={"pid":"32409","command":"com.smartphoneremote.androidscriptfree:droidscript_service","arguments":""}
Desired output:
{"user":10230,"pid":32409,"name":"com.smartphoneremote.androidscriptfree:droidscript_service"} r...
{"user":10031,"pid":4123,"name":"com.google.android.googlequicksearchbox:interactor"} running
{"user":10174,"pid":22127,"name":"adarshurs.android.vlcmobileremote"} running
{"user":1000,"pid":881,"name":"system"} running
*/


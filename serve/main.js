#!/usr/bin/env nodejs

log("main starting...");

/*var WebSocketServer = require('websocket').server;
var serialize = require('node-serialize');
var process = require('process');
var crypto = require('crypto');
*/
var watchr = require('watchr');
/*var Fiber = require('fibers');
var yauzl = require("yauzl");
var http = require('http');
var path = require("path");
var util = require("util");
var fsp = require('path');
var fs = require('fs');
var os = require('os');
var vm = require('vm');
*/
var options={
    debug: true,
    sdcard:"/sdcard"
};


////////////////////////////////////////////////////////////////////////////////////////////////
/************************************** INITIALIZATION ****************************************/
////////////////////////////////////////////////////////////////////////////////////////////////
log("Watching for changes...");
watchr.watch({paths: ['serve', 'resources'],
    listeners: {error: onWatchResult, watching: onWatchResult, change: onFileChanged, next: onWatchResult}});

// watchr.watch({paths: ['/root/ar2dscript/serve'], 
//     listeners: {
// 	error: (err,watcherInstance,isWatching) => { console.log('err: '+err); }, 
// 	watching: (err,watcherInstance,isWatching) => { console.log('watching'); } } });


////////////////////////////////////////////////////////////////////////////////////////////////
/************************************** IMPLEMENTATION ****************************************/
////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////
//////////// WATCH CHANGES /////////////
////////////////////////////////////////

function onFileChanged(changeType,filePath,fileCurrentStat,filePreviousStat) {
    //log('a change event occured:',arguments); // 0=event[update], 1=name, 2=new stat, 3=old stat
    if(filePath == 'main.js') { log("main changed."); process.exit(); }
    var changedApp=path.basename(path.dirname(filePath));
    log('changedApp: '+changedApp+"; filePath="+filePath);
}

function onWatchResult(err,watcherInstance,isWatching){
    if(!watcherInstance && !isWatching) { log('Watching failed: '+ err); }
    else if(!isWatching) { return log("Error watching everything: "+ err); }
    else {
	if (err) { log("Error watching: " + watcherInstance.path + ": "+err); }
	else     { log("Ready to watch: " + watcherInstance.path); }
    }
}


///////////////////// LOGGING ////////////////////////////

function log(msg,debugLevel,showStack) {
    if(debugLevel != null && options && !options.debug) { return; }
    var stk=new Error().stack;
    if(showStack) { msg+="\n\n"+stk; }
    if(debugLevel) {
	var src=stk.split('\n')[2].split('/');
	src=src[src.length-1].replace(/.js/,'').replace(/\)/,'');
	msg += +' (In '+src+')';
    }
    var d = dateToYMDHMS(new Date());
    console.log(d+' '+msg);
}

function dateToYMD(date) {
  try {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
  }
  catch(e) { log("dateToYMD: "+e.stack); }
  return              '' + y  + '-' + 
    (m  <= 9 ? '0' +  m : m)  + '-' +
    (d  <= 9 ? '0' +  d : d);
}
function dateToHMS(date) {
  try {
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();
  }
  catch(e) { log("dateToHMS: "+e.stack); }
  return formatHMS(hh,mm,ss);
}
function formatHMS(hh,mm,ss) {
    return (hh <= 9 ? '0' + hh : hh) + ':' +
         (mm <= 9 ? '0' + mm : mm) + ':' +
         (ss <= 9 ? '0' + ss : ss);
}
function dateToYMDHMS(date) {
    return dateToYMD(date) + ' ' + dateToHMS(date);
}

////////////////////////////////////////////////////////////////////////////////
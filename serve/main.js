#!/usr/bin/env nodejs

var options={
    port:80,
    debug:true,
    sdcard:"/sdcard",
    appsDir:null,
    apksDir:null,
    autoboots: []
};

var colors = require('colors');
var watchr = require('watchr');
var fsp = require('path');
var fs = require('fs');
var vm = require('vm');

////////////////////////////////////////////////////////////////////////////////////////////////
/************************************** INITIALIZATION ****************************************/
////////////////////////////////////////////////////////////////////////////////////////////////
loadConfig();

log("Watching for changes...");
watchr.watch({paths: ['serve', 'resources'],
    listeners: {error: onWatchResult, watching: onWatchResult, change: onFileChanged, next: onWatchResult}});

var ds=process.env.DS;
if(!ds) { ds=process.cwd(); }

log("Main: DS="+ds);

if(fs.statSync(ds).isDirectory()) {
    var apks=fs.readdirSync(ds, null, true).filter( (file) => {
	return file.indexOf("DroidScript_") == 0 && file.endsWith(".apk");
    }); // Sorted, finds latest version of apk (if any)
    var apk=(apks.length > 0) ? apks[apks.length-1] : null;
    if(!apk) { throw Error("Missing DroidScript_*.apk in "+ds); }
    ds=fsp.join(ds,apk);
    log("Using DS="+ds);
}

globalize(['log','require','options','parseCookies','sendCookies','statFiber','accessFiber','readFileFiber','readdirFiber','__dirname','loadScripts','ds','globalize']);

// global.log=log;
// global.require=require;
// global.options=options;
// global.parseCookies=parseCookies;
// global.sendCookies=sendCookies;
// global.statFiber=statFiber;
// global.accessFiber=accessFiber;
// global.readFileFiber=readFileFiber;
// global.readdirFiber=readdirFiber;
// global.__dirname=__dirname;
// global.loadScripts=loadScripts;

loadScripts(".", ["serve.js"], null, true);

//loadScripts(ds, ["assets/app.js"]);

/*var WebSocketServer = require('websocket').server;
var serialize = require('node-serialize');
var process = require('process');
var crypto = require('crypto');
*/
/*var Fiber = require('fibers');
var yauzl = require("yauzl");
var http = require('http');
var path = require("path");
var util = require("util");
var os = require('os');
*/


////////////////////////////////////////////////////////////////////////////////////////////////
/************************************** IMPLEMENTATION ****************************************/
////////////////////////////////////////////////////////////////////////////////////////////////

function globalize(objs) {
    for(var xa=0; xa<objs.length; xa++) {
	var obj=objs[xa];
	global[obj]=eval(obj);
    }
}

function loadConfig() {
    try {
	options=JSON.parse(fs.readFileSync('serve/config.json'));
	if(!options.appsDir) options.appsDir=fsp.join(options.sdcard, "DroidScript");
	if(!options.apksDir) options.apksDir=fsp.join(options.appsDir,"APKs");	
	if(options && options.debug) { log("CONFIG: "+JSON.stringify(options).green); } // console.dir
    }
    catch(err) {
	if(err.code !== 'ENOENT') {
	    log("loadConfig "+err);
	    throw err;
	}
    }
}

////////////////////////////////////////
//////////// WATCH CHANGES /////////////
////////////////////////////////////////

function onFileChanged(changeType,filePath,fileCurrentStat,filePreviousStat) {
    //log('a change event occured:',arguments); // 0=event[update], 1=name, 2=new stat, 3=old stat
    if(filePath.startsWith('serve')) { log("server changed."); process.exit(); }
    var changedApp=fsp.basename(fsp.dirname(filePath));
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

/***************************************************************************************************/
//////////////////////////////////////// Utility Functions //////////////////////////////////////////
/***************************************************************************************************/


function loadScripts(appName, scriptNames, context, isSystem) {
    var scrInfos=readScripts(appName, scriptNames, isSystem);
    for(var xa=0; xa<scrInfos.length; xa++) {
	var scrInfo=scrInfos[xa];
	if(scrInfo.script === null) {
	    throw new Error("Missing "+scrInfo.scriptName);
	}
// 	var script=new vm.Script(scrInfo.script, {filename:scrInfo.scriptName});
// 	if(context) { script.runInContext(context); }
// 	else { script.runInThisContext(); }
	if(context) { vm.runInContext(scrInfo.script, context, {filename:scrInfo.scriptName}); }
	else { vm.runInThisContext(scrInfo.script, {filename:scrInfo.scriptName}); }
    }
}

// Read scripts from .apk, .spk, or Apps folder
function readScripts(appName, scriptNames, isSystem) {
    //log("readScripts: fiber="+Fiber.current);
    var rets=[]; // Returns array of length equal to scriptNames length.
    var apk=appName.endsWith(".apk") ? (appName[0] !== '/' ? fsp.join(options.apksDir, appName) : appName) : null;
    var spk=appName.endsWith(".spk") ? fsp.join(options.appsDir, appName) : null;
    if(apk || spk) {
	aspk=apk ? apk : spk;
	try {
	    var scrs=readZipAsText(aspk, scriptNames);
	    for(var xa=0; xa<scriptNames.length; xa++) {
		rets.push({script:scrs[xa], scriptName: aspk+":"+scriptNames[xa]});
	    }
	}
	catch(e) {
	    log("Error locating "+aspk+": "+scriptName+"; "+e.stack);
	}
    }
    else {
	var dir=isSystem ? fsp.join(process.cwd(), "serve") : fsp.join(options.appsDir, appName);
	for(var xa=0; xa<scriptNames.length; xa++) {
	    var scriptName= scriptNames[xa];
	    if(scriptName[0] != fsp.sep) { scriptName=fsp.join(dir, scriptName); }
	    log("readScripts: appName="+appName+";scriptName="+scriptName+"***");
	    rets.push({script:fs.readFileSync(scriptName), scriptName: scriptName});
	}
    }
    return rets;
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
    console.log(d.inverse+' '+msg);
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

/***************************************************************************************************/

function setTimeoutFiber(cb, ms) {
    setTimeout(function() { Fiber(cb).run(); }, ms);
}

function setIntervalFiber(cb, ms) {
    setInterval(function() { Fiber(cb).run(); }, ms);
}

///////////////////////////////////////////////////////////////////////////////////////////
/******** Replacements for fs.*Sync functions, using Fibers for better efficiency ********/
///////////////////////////////////////////////////////////////////////////////////////////

function readdirFiber(path, alphaSort) {
    var fiber = Fiber.current;
    fs.readdir(path, (err, files) => { fiber.run({err:err,files:files}); });
    var ret=Fiber.yield(); // Pause for exec
    //if(ret.err) { Fiber(function() { throw ret.err; }).run(); }
    if(alphaSort) { ret.files.sort(); }
    return ret.files;
}

function statFiber(path) {
    var fiber = Fiber.current;
    fs.stat(path, (err, stats) => { fiber.run({err:err,stats:stats}); });
    var ret=Fiber.yield(); // Pause for exec
    if(ret.err) { throw ret.err; }
    return ret.stats;
}

function readFileFiber(file, options) {
    var fiber = Fiber.current;
    fs.readFile(file, options, (err, data) => { fiber.run({err:err, data:data}); });
    var ret=Fiber.yield(); // Pause for exec
    if(ret.err) { throw ret.err; }
    return ret.data;
}

function writeFileFiber(file, data, options) {
    var fiber = Fiber.current;
    fs.writeFile(file, data, options, (err) => { fiber.run({err:err}); });
    var ret=Fiber.yield(); // Pause for exec
    if(ret.err) { throw ret.err; }
}

function accessFiber(path, mode) {
    var fiber = Fiber.current;
    fs.access(path, (err) => { fiber.run({err:err}); });
    var ret=Fiber.yield(); // Pause for exec
    if(ret.err) { throw ret.err; }
}

/***************************************************************************************************/
/////////////////////////////////////////////////////////////////////////////////////////////////////

function className(cls) { 
   var funcNameRegex = /function (.{1,})\(/;
   var results = (funcNameRegex).exec((cls).constructor.toString());
   return (results && results.length > 1) ? results[1].trim() : "";
}

function sleep(ms) {
    log("Sleeping "+ms+"...");
    var fiber = Fiber.current;
    setTimeout(function() {
	log("End sleep "+ms+".");
	fiber.run();
    }, ms);
    Fiber.yield();
}

function readZipAsText(zipFile, files) {
    //log("readZipAsText: fiber="+Fiber.current);
    var rets=[];
    // Return cached zips
    var anyMiss=false;
    var tmp=os.tmpdir();
    for(var xa=0; xa<files.length; xa++) {
	var cachePath=fsp.join(tmp, zipFile.replace(/\//g,"_")+"#"+files[xa].replace(/\//g,"_"));
	try { rets[xa]=readFileFiber(cachePath); }
	catch(e) { rets[xa]=null; anyMiss=true; }
    }
    if(!anyMiss) { return rets; }
    
    log("readZipAsText: Caching "+zipFile);
    var fiber = Fiber.current;
    //log("readZipAsText: "+zipFile);
    yauzl.open(zipFile, {lazyEntries: true}, function(err, zipfile) {
	if (err) throw err;
	zipfile.readEntry();
	zipfile.on("entry", function(entry) {
	    //log("  ENTRY: "+entry.fileName);
	    var anyFound=false;
	    for(var xa=0; xa<files.length; xa++) {
		if(rets[xa] === null && entry.fileName === files[xa]) {
		    anyFound=true;
		    zipfile.openReadStream(entry, /*(err, readStream) => { fiber.run({err:err,stats:stats}); });
    var ret=Fiber.yield(); // Pause for exec
*/					   
					   
					   
					   function(err, readStream) {
			if (err) throw err;
			var string='';
			readStream.on('data', function(part) { string += part; });
			readStream.on('end', function() {
			    rets[this]=string;
			    var cachePath=fsp.join(tmp, zipFile.replace(/\//g,"_")+"#"+files[this].replace(/\//g,"_"));
			    Fiber(function() { writeFileFiber(cachePath, string); }).run(); // file, data, options
			    zipfile.readEntry();
			}.bind(this));
		    }.bind(xa));
		}
	    }
	    if(!anyFound) { zipfile.readEntry(); }
	});
	zipfile.on("end", function() { fiber.run(); });
    });
    Fiber.yield();
    //console.log("readZipAsText("+zipFile+") rets[0]="+rets[0]+"***");
    log("readZipAsText: Cached "+zipFile+" ("+rets.length+" entries)");
    return rets;
}

/////////////// COOKIES //////////////////

function parseCookies(cookie) {
    if(!cookie) { return {}; }
    return cookie.split(';').reduce(
        function(prev, curr) {
            var m = / *([^=]+)=(.*)/.exec(curr);
            var key = m[1];
            var value = decodeURIComponent(m[2]);
            prev[key] = value;
            return prev;
        },
        { }
    );
}

function sendCookies(cookies) {
    var list = [ ];
    for (var key in cookies) {
        list.push(key + '=' + encodeURIComponent(cookies[key]) + '; expires=0; path=/;');
    }
    return list; //.join('; ');
}

function stringifyCookies(cookies) {
    var list = [ ];
    for (var key in cookies) {
        list.push(key + '="' + encodeURIComponent(cookies[key]) + '; expires=0; path=/;"');
    }
    return list.join('; ');
}


////////////////////////////////////////////////////////////////////////////////
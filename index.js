/* ar2dscript - nodejs implementation of DroidScript, running server apps via browser
 * Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

const cluster = require('cluster');
const colorsafe = require('colors/safe');
const consoleTEN = require('console-ten');
const version = require('./serve/version');
const PRODUCT=version.PRODUCT;
const VERSION=version.VERSION;

var options={
    port:801,
    debug:true,
    sdcard:"/sdcard",
    appsDir:null,
    apksDir:null,
    autoboots: []
};

function loadConfig(inMaster) {
    try {
	const fs = require('fs'); // statSync, readdirSync, readFileSync, readdir, stat, readFile, writeFile, access, createWriteStream
	options=JSON.parse(fs.readFileSync('serve/config.json'));
	initLogging();
	const fsp = require('path'); // path join
	if(!options.appsDir) options.appsDir=fsp.join(options.sdcard, "DroidScript");
	if(!options.apksDir) options.apksDir=fsp.join(options.appsDir,"APKs");	
	if(options) { console.debug((inMaster ? "MCFG: " : "CFG: ")+colorsafe.green(JSON.stringify(options))); }
    }
    catch(err) {
	if(err.code !== 'ENOENT') {
	    console.error("loadConfig "+err);
	    throw err;
	}
    }
}

function initLogging() {
    // If not calling this, provide default: console.debug = function(){};
    var dbg=consoleTEN.LEVELS.WARNING;
    if(options.debug) switch(options.debug) {
	case 'error':   dbg=consoleTEN.LEVELS.ERROR;   break;
	case 'warning': dbg=consoleTEN.LEVELS.WARNING; break;
	case 'log':     dbg=consoleTEN.LEVELS.LOG;     break;
	case 'info':    dbg=consoleTEN.LEVELS.INFO;    break;
	case 'debug':   dbg=consoleTEN.LEVELS.DEBUG;   break;
	default: dbg=consoleTEN.LEVELS.ALL; break;
    }
    consoleTEN.init(console, dbg, function(levelName){
	function dateToYMD(date) {
	    try {
		var d = date.getDate();
		var m = date.getMonth() + 1;
		var y = date.getFullYear();
	    }
	    catch(e) { console.error("dateToYMD: "+e.stack); }
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
	    catch(e) { console.error("dateToHMS: "+e.stack); }
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
	
	var color="grey";
	switch(levelName) { // white,black unused
	    case 'ERROR':   color="red";     break; // console.error
	    case 'WARNING': color="yellow";  break;	// console.warn
	    case 'LOG':     color="green";   break;	// console.log
	    case 'INFO':    color="blue";    break;	// console.info
	    case 'DEBUG':   color="magenta"; break;	// console.debug
	    case 'ALL': 
	    default: color="cyan";
	}
	var stk=new Error().stack;
	var src=stk.split('\n')[3].split('/');
	src=src[src.length-1].replace(/.js/,'').replace(/\)/,'');
	stk=('['+src+']                ').substr(0,20);
	var d = dateToYMDHMS(new Date());

	return colorsafe.inverse(colorsafe[color](d))+ " " + stk + " ";
    });
}

// ********************** Initialize Cluster **************************
if (cluster.isMaster) {
    function onFileChanged(changeType,filePath,fileCurrentStat,filePreviousStat) {
	if(filePath == "index.js") {
	    console.warn("Master server changed."); process.exit();
	}
	else if(filePath.startsWith('serve')) {
	    if(filePath === "serve/config.json") { loadConfig(true); }
	    console.warn("Stopping changed nodes...");
	    Object.keys(cluster.workers).forEach((id) => {
		var worker=cluster.workers[id];
		worker.send('shutdown');
		worker.disconnect();
		worker.timeout = setTimeout(() => { console.warn("Killing",id); worker.kill('SIGKILL'); }, 2000);		
	    });
	}
// 	var changedApp=fsp.basename(fsp.dirname(filePath));
// 	console.warn('changedApp: '+changedApp+"; filePath="+filePath);
    }

    function onWatchResult(err,watcherInstance,isWatching){
	if(!watcherInstance && !isWatching) { console.warn('Watching failed: '+ err); }
	else if(!isWatching) { console.error("Error watching everything: "+ err); }
	else {
	    if (err) { console.error("Error watching: " + watcherInstance.path + ": "+err); }
	    else     { console.info("Ready to watch: " + watcherInstance.path); }
	}
    }
    
    function onDisconnect() { // Bind to worker
	if(this.timeout) { clearTimeout(this.timeout); this.timeout=null; }
	else { console.warn("onDisconnect with no timeout set"); }
    }
    
    function initWorker(worker) {
	worker.on('message', messageHandler);
	worker.on('disconnect', onDisconnect.bind(worker));
    }
    
    console.info(PRODUCT,"v"+VERSION,"Watching for changes...");
    require('watchr').watch({paths: ['serve', 'index.js'],
	listeners: {error: onWatchResult, watching: onWatchResult, change: onFileChanged, next: onWatchResult}});
    loadConfig(true);
    
    // Keep track of http requests
    var numReqs = 0;
//     setInterval(() => {
// 	console.log('numReqs =', numReqs);
//     }, 1000);

    // Count requests
    function messageHandler(msg) {
	if (msg.cmd && msg.cmd == 'notifyRequest') { numReqs++; }
    }

    // Start workers and listen for messages containing notifyRequest
    const numCPUs = require('os').cpus().length;
    console.log('Starting',numCPUs,'worker'+(numCPUs==1?'':'s')+'.');
    for (var i = 0; i < numCPUs; i++) { initWorker(cluster.fork()); }

    cluster.on('exit', (worker, code, signal) => {
	console.warn('Worker %d died (%s). restarting...', worker.process.pid, signal || code);
	initWorker(cluster.fork());
    });
    
}
else {
    loadConfig(false);
    require('./serve/httpserv.js').httpserv(options);
}
var VERSION="2016.06.22.1";

log("__________________________________________________________________________");
log("ar2dscript starting...");

var WebSocketServer = require('websocket').server;
//var serialize = require('node-serialize'); // Objects including functions
var process = require('process'); // cwd
var crypto = require('crypto'); // sha256 (sessions)
var Fiber = require('fibers'); // Threading
var yauzl = require("yauzl"); // Unzip
var http = require('http'); // Server
//var util = require("util"); // inspect
var fsp = require('path'); // path join
var fs = require('fs'); // createReadStream
var os = require('os'); // tmpdir

/*var options={
    port:80,
    debug:true,
    sdcard:"/sdcard",
    appsDir:null,
    apksDir:null,
    apps: []
};
*/

////////////////////////////////////////////////////////////////////////////////////////////////
/************************************** INITIALIZATION ****************************************/
////////////////////////////////////////////////////////////////////////////////////////////////
//loadConfig();
//updateAppsList();
//saveConfig();
startAutoBoots();
var server = http.createServer(httpHandler);
server.listen(options.port, function() { log('Server is listening on port '+options.port); });
var wsServer = new WebSocketServer({httpServer: server, autoAcceptConnections: false});
wsServer.on('request', wsHandler);

globalize(['log','require','options','parseCookies','sendCookies','statFiber','accessFiber',
	  'readFileFiber','readdirFiber','__dirname','loadScripts','ds','globalize','VERSION']);
loadScripts(".", ["runapp.js"], null, true);



////////////////////////////////////////////////////////////////////////////////////////////////
/************************************** IMPLEMENTATION ****************************************/
////////////////////////////////////////////////////////////////////////////////////////////////

// function saveConfig() {
//     fs.writeFile('serve.json', JSON.stringify(options), (err) => {
// 	if(err) { log("saveConfig "+err); return }
//     });
// }


//////////// APPS /////////////

// /** Find any newly installed apps.  Return array of adds, deletes **/
// function updateAppsList() {
//     options.appsDir=fsp.join(options.sdcard,"DroidScript");
//     var apps=fs.readdirSync(options.appsDir).filter(function (file) {
// 	if(file.startsWith('.')) { return false; } // Ignore hidden files
// 	var ret=file.endsWith(".spk");
// 	if(!ret) {
// 	    try { ret=fs.statSync(fsp.join(options.appsDir,file,file)+'.js').isFile(); }
// 	    catch(e) {}
// 	}
// 	return ret;
//     });
//     options.apksDir=fsp.join(options.appsDir,"APKs");
//     fs.readdirSync(options.apksDir).filter(function (file) { return file.endsWith(".apk"); })
// 	.forEach( (file) => { apps.push(file); });
//     var dels=[];
//     if(!options.apps) { options.apps=[]; }
//     for(var xa=0; xa<options.apps.length; xa++) {
// 	var found=false;
// 	for(var xb=0; xb<apps.length; xb++) {
// 	    if(options.apps[xa].name == apps[xb]) { found=true; break; }
// 	}
// 	if(!found) { // Item in options not found in folders, this was removed
// 	    log("Removed app: "+options.apps[xa].name);
// 	    dels.push(options.apps[xa].name);
// 	    options.apps.splice(xa,1);
// 	    xa--;
// 	}
//     }
//     var adds=[];    
//     for(var xa=0; xa<apps.length; xa++) {
// 	var found=false;
// 	for(var xb=0; xb<options.apps.length; xb++) {
// 	    if(apps[xa] == options.apps[xb].name) { found=true; break; }
// 	}
// 	if(!found) { // Item in folders not found in options, this is a new folder
// 	    log("Found app: "+apps[xa]);
// 	    adds.push(apps[xa]);
// 	    options.apps.push({
// 		name:apps[xa],
// 		connections:[]
// 	    });
// 	}
//     }
//     options.apps.sort( (a,b) => {
// 	var aa=a.name.toLowerCase();
// 	var bb=b.name.toLowerCase();
// 	if(aa < bb) { return -1; }
// 	if(aa > bb) { return 1; }
// 	return 0;
//     });
//     return [adds,dels];
// }

function startAutoBoots() {
    // FIXME: Only start apps that called app.SetAutoBoot(true)
    var ab=options.autoboots;
    for(var xa=0; xa<ab.length; xa++) {
	log("AutoBoot: "+ab[xa]);
	//FIXME:
	//var a=getApp(ab[xa]);
    	//Fiber(function() { runApp(a); }).run();    
    }
}

function getApp(name, session) {
    // FIXME: verify existence of app in appdir, apksdir first, return null if not found
    var appPath=fsp.join(options.appsDir, name, name + ".js");
    if(!statFiber(appPath).isFile()) {
	appPath=fsp.join(options.appsDir, name + ".spk");
	if(!statFiber(appPath).isFile()) {
	    appPath=fsp.join(options.apksDir, name + ".apk");
	    if(!statFiber(appPath).isFile()) { return null; }
	}
    }
    log("getApp: appPath="+appPath);
    
    try {
	var appState=fsp.join(os.tmpdir(), "session-" + name + "-" + session + ".json")
	var app=JSON.parse(readFileFiber(appState));
	if(app && options.debug) { log(("STATE: "+appState+"="+JSON.stringify(app)).blue); } // console.dir
	return app;
    }
    catch(err) {
	if(err.code !== 'ENOENT') {
	    log("getApp "+err);
	    throw err;
	}
	return {name:name};
    }
}

// function getApp(name, session) {
//     for(var xa=0; xa<options.apps.length; xa++) {
// 	var a=options.apps[xa];
//         //console.log("getApp: xa="+xa+"; a="+JSON.stringify(a)+";conn="+JSON.stringify(a.connections)+"***");
// 	if(name === a.name) { return a; }
//     }
//     return null; // No matching app
// }
// 
// function qFlush(sa) {
//     while(sa.connection && sa.sq && sa.sq.length > 0) {
//         var msg=sa.sq.shift();
//         sa.rq.push(msg);
// 	log("SND " + msg.msgId+" "+msg.fn+JSON.stringify(msg.arguments));
//         sa.connection.sendUTF(JSON.stringify(msg));
//     }
// }
// 
// function appConsole(appName) {
//     return {
// 	memory:  {},
// 	assert:  console.assert,
// 	dir:     console.dir,
// 	error:   console.error,
// 	info:    console.info,
// 	log:     function(data) {
// 	    log("  APP "+appName+": "+data);
// 	},
// 	time:    console.time,
// 	timeEnd: console.timeEnd,
// 	trace:   console.trace,
// 	warn:    console.warn,
//     // Unimplemented
// 	debug:   console.error,
// 	dirxml:  console.dir,
// 	count:   log,
// 	markTimeline: function(msg) {
// 	    log("  APP "+appName+" MARK: "+msg);
// 	},
// 	group:   log,
// 	groupCollapsed: log,
// 	groupEnd: log
//     };
// }
// 
// var navigator={
//     userAgent:"Android Emulation (ar2dscript)"
// };
// 
// // Run app with given session ID
// function runApp(app, session, connection) {
//     //log("runApp: fiber="+Fiber.current);
//     if(!app.connections) { app.connections={}; }
//     if(!session) { session=0; }
//     var sa=app.connections[session]; // app for this session
//     if(!sa) { app.connections[session]=sa={}; }
//     
//     // FIXME: Closing connection causes bad user experience (alert) with multiple tabs open to same site.
//     // FIXME: But if we keep it open, we should use it to send a message to the other tab, greying out
//     // FIXME: that tab so it appears inactive (as it is), and/or asking the client to disconnect
//     // FIXME: voluntarily, with no annoying popup message.
//     if(sa.connection && sa.connection != connection) {  // Only one connection per session supported
// 	//sa.connection.close(); 
// 	//sa.connection.send();
// 	var objStr=JSON.stringify({fname:'dim', fn:'', obj:'', arguments:[]});
//         log("SND "+objStr);
//         sa.connection.sendUTF(objStr);
//     }
//     
//     if(connection) { sa.connection=connection; }
//     sa.fns=[];
//     sa.send = function(obj) {
// 	// Send once connection, queuing awaiting reply.  Call cb when reply arrives.
// 	//sa.sq.push({msgId:sa.msgId++, cb:cb, payload:obj});
// 	// NOTE: This only keeps one message max in queue.  Clients should check msgId
// 	// and if they are behind, ask for full update of screen state
//         obj.msgId=sa.msgId++;
// 	if(obj.cb === null) { obj.cb='N'; }
// 	sa.sq=[obj]; //{msgId:sa.msgId++, cb:cb, payload:obj}];
// 	qFlush(sa);
//     }
// //     if(sa.initialized) { // If re-running after initialized, send a context update
// //         sa.send({fn:'_context', arguments:sa.context._objects, cb:null});
// //         return; 
// //     }
//     log("*** Starting "+app.name+" for "+session+"; fns="+JSON.stringify(sa.fns));
//     //var fPath="Apps/"+app.name+"/"+app.name+".js";
//     var sandbox={require:require, console:new appConsole(app.name), 
// 	setTimeout: setTimeoutFiber, _app: sa,
// 	setInterval: setIntervalFiber,
// 	readdirFiber: readdirFiber,
// 	readScripts: readScripts,
// 	navigator: navigator
//     };
//     sa.VERSION=VERSION;
//     sa.context = new vm.createContext(sandbox);	
//     sa.sq=[]; // Send queue
//     sa.rq=[]; // Reply queue (messages sent but not yet replied)    
//     sa.name=app.name;
//     sa.options=options;
//     sa.msgId=0;
//     sa.sleep = sleep;
//     //sa.connections={};
//     //sa.setTimeout=setTimeout;
//     sa.Fiber=Fiber;
//     sa.dirname=__dirname;
//     sa._objects=[];
// 
//     try { sa.ds=new vm.Script(fs.readFileSync('ar2dscript.js')); }
//     catch(e) {
// 	log(e.stack);
// 	throw e;
//     }
//     var base=sa.name.replace(/.spk/gi, '');
//     var scrInfos=readScripts(app.name, [base+"/"+base+".js"]);
//     log("fn="+scrInfos[0].scriptName+"***");
//     sa.script=new vm.Script(scrInfos[0].script, {filename:scrInfos[0].scriptName});
//     //sa.script=new vm.Script(fs.readFileSync(fPath),{filename:fPath});
//     try {
// 	sa.ds.runInContext(sa.context,{filename:'ar2dscript.js'});
// 	sa.script.runInContext(sa.context,{filename:'ar2dscript.js'});
//         //log("Calling OnStart()");
// 	vm.runInContext('OnStart()',sa.context,{displayErrors:true});
//     }
//     catch(e) {
// 	if(className(e) != "ReferenceError" || e.message != 'OnStart is not defined') {
// 	    sa.error=e; log(e.stack);
// 	}
//     }
//     sa.initialized=true;
//     return sa;
// }
// 
// // Read scripts from .apk, .spk, or Apps folder
// function readScripts(appName, scriptNames) {
//     //log("readScripts: fiber="+Fiber.current);
//     var rets=[]; // Returns array of length equal to scriptNames length.
//     var apk=appName.endsWith(".apk") ? (appName[0] !== '/' ? fsp.join(options.apksDir, appName) : appName) : null;
//     var spk=appName.endsWith(".spk") ? fsp.join(options.appsDir, appName) : null;
//     if(apk || spk) {
// 	aspk=apk ? apk : spk;
// 	try {
// 	    var scrs=readZipAsText(aspk, scriptNames);
// 	    for(var xa=0; xa<scriptNames.length; xa++) {
// 		rets.push({script:scrs[xa], scriptName: aspk+":"+scriptNames[xa]});
// 	    }
// 	}
// 	catch(e) {
// 	    log("Error locating "+aspk+": "+scriptName+"; "+e.stack);
// 	}
//     }
//     else {
// 	for(var xa=0; xa<scriptNames.length; xa++) {
// 	    var scriptName= scriptNames[xa];
// 	    if(scriptName[0] != fsp.sep) { scriptName=fsp.join(options.appsDir, scriptName); }
// 	    log("readScripts: appName="+appName+";scriptName="+scriptName+"***");
// 	    rets.push({script:fs.readFileSync(scriptName), scriptName: scriptName});
// 	}
//     }
//     return rets;
// }
// 
// function stopApp(app, session) {
//     //if(!app.connections) { app.connections={}; }
//     var sa=app.connections[session]; // app for this session
//     sa.connection=null;
//     if(sa.script == null) { return; }
//     log("*** Stopping "+app.name);
//     try { vm.runInContext('OnPause()',sa.context,{displayErrors:true}); }
//     catch(e) {
// 	if(className(e) != "ReferenceError" || e.message != 'OnPause is not defined') {
// 	    sa.error=e; log(e.stack);
// 	}
//     }
//     sa.initialized=false;
// }
// 
//////////// WEB SERVER /////////////


function normalizePath(fPath) {
    fPath=fPath.split("../").join("/").split("/").join(fsp.sep);
    //console.log("normalizePath: "+fPath);
    if(fPath.indexOf('Apps/') != 0) {
	return fsp.join(process.cwd(), "WebRoot", fPath); // Retrieve system resources
    }
    // Retrieve app resources
    var fp=fPath.substr(5);
    var xa=fp.indexOf('/');
    if(xa > -1) {
	var appName=fp.substr(0,xa);
	fp=fp.substr(xa);
	if(fp == "/Img/favicon.png") { 
	    try { 
		var filePath=fsp.join(options.sdcard, "DroidScript", appName, "Img", appName+".png");
		accessFiber(filePath, fs.R_OK); 
		return filePath;
	    }
	    catch(e) {
		return fsp.join(process.cwd(),"WebRoot","Sys","Img","Droid1.png"); // If no favicon use default one
	    }
	}
	//console.log("fp="+fp);
	if(fp.indexOf('/Img/') == 0) {
	    return fsp.join(options.sdcard, "DroidScript", appName, fp.replace(/\//,fsp.sep));
	}
    }
    else if(fp.endsWith(".spk")) {
	return fsp.join(options.appsDir, fp.replace(/\//,fsp.sep));
    }
    else if(fp.endsWith(".apk")) {
	return fsp.join(options.apksDir, fp.replace(/\//,fsp.sep));
    }
    return fPath;
}

function respond(at,response, cookies, code, contentType, contentLen, content, redirect) {
    if(!code) { code=200; }
    if(!contentType) { contentType="text/html"; }
    if(content) { contentLen=content.length; }
    //log("SET-COOKIE: "+sendCookies(cookies));
    var headers={
        'Set-Cookie': sendCookies(cookies),
        'Content-Type': contentType
    };    
    if(contentLen) { headers['Content-Length']=contentLen; }
    if(redirect)   { headers['Location']=redirect; }
    response.writeHead(code, headers);
    //log("HEADERS#"+at+" sent: contentLen="+contentLen+";content="+content+"***");
    if(content) { response.write(content); response.end(); }
}
 
function newSession() {
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
}


function backgroundGradient(appName, session, objId) {
    var app=getApp(appName, session);
    var sa=app.connections[session];
    if(!sa) { 
	log("ERR backgroundGradient: No session for app "+appName);
	return ""; 
    }
    var layNum=0;
    log("SVG appName="+appName+"; sa="+sa+"; objId="+objId);
    var lay=sa.context._objects[objId];
    if(!lay) { log("ERR backgroundGradient: No layout with objId "+objId); return ""; }
    if(!lay.backGradient) { log("ERR backgroundGradient: Object "+objId+" is not a layout: "+JSON.stringify(lay)); return ""; }
    var bg=lay.backGradient;
    var wh={width:lay.width ? lay.width : 640, height:lay.height ? lay.height : 480};
    var content="<svg width=\""+wh.width+"\" height=\""+wh.height+"\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:svg=\"http://www.w3.org/2000/svg\">"+
        "<!-- Created with SVG-edit - http://svg-edit.googlecode.com/ -->"+
        "<defs>"+
        "<linearGradient id=\"svg_6\" x1=\""+bg.x1+"\" y1=\""+bg.y1+"\" x2=\""+bg.x2+"\" y2=\""+bg.y2+"\" spreadMethod=\"pad\">"+
        "<stop offset=\"0\"   stop-color=\""+bg.color1+"\" />"+
        "<stop offset=\"0.5\" stop-color=\""+bg.color2+"\" stop-opacity=\"1.0\" />"+
        "<stop offset=\"1\"   stop-color=\""+bg.color3+"\" stop-opacity=\"1.0\" />"+
        "</linearGradient></defs><g><title>Layer 1</title>"+
        "<rect id=\"svg_1\" height=\""+wh.height+"\" width=\""+wh.width+"\" y=\"0\" x=\"0\" fill=\"url(#svg_6)\" />"+
        "</g></svg>";
    log("SVG "+JSON.stringify(bg)+": "+content);
    return content;
}

var omtime1=0,omtime2=0;
function changedApps() {
    var mtime1=statFiber(options.appsDir).mtime;
    var mtime2=statFiber(options.apksDir).mtime;
    var c1=(omtime1 < mtime1);
    var c2=(omtime2 < mtime2);
    omtime1=mtime1; omtime2=mtime2;
    return {c1:c1, c2:c2};
}

function listAppsApks(listApps, listApks) {
    var apps=readdirFiber(options.appsDir).filter(function (file) {
	if(file.startsWith('.')) { return false; } // Ignore hidden files
	var ret=file.endsWith(".spk");
	if(!ret) {
	    try { ret=statFiber(fsp.join(options.appsDir,file,file)+'.js').isFile(); }
	    catch(e) {}
	}
	return ret;
    });
    readdirFiber(options.apksDir).filter(function (file) { return file.endsWith(".apk"); })
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

function httpHandler(request, response) {
    Fiber(function() {
	log(("cookie: "+request.headers.cookie).red);
	var cookies = parseCookies(request.headers.cookie);
	log('REQ ' + request.url); //+"; cookies="+JSON.stringify(cookies));
	if(!cookies.session) { cookies.session=newSession(); }
	//log('session=' + cookies.session);
	var filePath=null;
	if(request.url === "/") {
	    var content="<html><head><title>Applications</title></head><body><h1>Applications</h1><ul>";
	    var mod=changedApps();
	    if(mod.c1 || mod.c2) {
		apps=listAppsApks(mod.c1, mod.c2);
	    }
		
	    for(var xa=0; xa<apps.length; xa++) {
		var a=apps[xa];
		content += '<li><a href="/Apps/'+a+'">'+a+'</a></li>';
	    }
	    content += "</ul></body></html>";
	    respond(1,response, cookies, null, null, null, content);
	    return;
	}
	else if(request.url.indexOf('/Apps/') == 0) {
	    var appName=request.url.substr(6);
	    var xa=appName.indexOf('/');
	    if(xa > -1 && xa < appName.length-1) {
		appName=appName.substr(0,xa);
		var file=request.url.substr(1).split('?')[0];
		filePath = normalizePath(file);
		//console.log("filePath="+filePath);
		var xb=filePath.indexOf("/Img/backgrad_");
		if(xb > -1 && filePath.endsWith(".svg")) {
		    var objId=parseInt(filePath.substr(xb+14));
		    var content=backgroundGradient(appName, cookies.session, objId);
		    if(content != "") {
			respond(2,response, cookies, null, "image/svg+xml", null, content);
			return;
		    }
		}
	    }
	    else {
		if(xa == appName.length-1) { appName=appName.substr(0,xa); }
		else {
		    var url=request.url+'/';
		    respond(3,response, cookies, 301, null, null,"<html><head><title>Moved Permanently</title></head><body>"+
			"<h1>Moved Permanently: "+url+"</h1></body></html>", url);
		    return;
		}
    //             //log("appName="+appName);
		if(getApp(appName, cookies.session)) { filePath = normalizePath('client.html'); }
		else {
		    respond(4,response, cookies, null, null, null, "<html><head><title>(No Applications)</title></head>"+
			"<body><h1>(No Applications)</h1></body></html>");
		    return;
		}
	    }
	}
	else if(filePath == null) {
	    var file=request.url.substr(1).split('?')[0];
	    filePath = normalizePath(file);
	}
	
	// Serve regular files.
	try { accessFiber(filePath, fs.R_OK); }
	catch(e) {
	    respond(5,response, cookies, 404, null, null,"<html><head><title>Not Found</title></head><body>"+
		"<h1>Not Found: "+filePath+"</h1></body></html>");
	    log('ERR Not found: '+filePath+"; e="+e);
	    return;
	}
	var stat = statFiber(filePath);
	response.on('error', function(err) { response.end(); });
	var ctype=getContentType(filePath);
	respond(6,response, cookies, 200, ctype, stat.size);
	fs.createReadStream(filePath).pipe(response); // End automatically
    }).run();
}

function getContentType(filePath) {
    var xa=filePath.lastIndexOf('.');
    var ctype="";
    var ext=(xa > -1) ? filePath.substr(xa+1).toLowerCase() : "";
    switch (ext) {
        case "js"   : ctype="application/javascript";        break;
        case "css"  : ctype="text/css";                      break;
        case "png"  : ctype="image/png";                     break;
        case "gif"  : ctype="image/gif";                     break;
        case "jpg"  : ctype="image/jpg";                     break;
        case "svg"  : ctype="image/svg+xml";                 break;
        case "ttf"  : ctype="font/ttf";                      break;
        case "otf"  : ctype="font/opentype";		     break;
        case "eot"  : ctype="application/vnd.ms-fontobject"; break;
        case "woff" : ctype="application/font-woff";         break;
        case "woff2": ctype="application/font-woff2";        break;
        case "txt"  : ctype="text/plain";                    break;
        default     : ctype="text/html";                     break;
    }
    return ctype;
}

//////////////////////////////////////
//////////// WEB SOCKETS /////////////
//////////////////////////////////////

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

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed. 
  return true;
}

function chooseProtocol(protos) {
    for(var xa=0; xa<protos.length; xa++) {
	if(protos[xa] == 'droidscript-gui-protocol') { return protos[xa]; }
    }
    return null;
}

function reject(request, reason) {
    request.reject();
    log('Connection for ' + request.resourceURL.pathname + ' rejected: '+reason);
}

function dsgui(request) {
    //log("request.resourceURL.pathname="+request.resourceURL.pathname);
    var found=false;
    var connection=null;
    var session=null; // NOTE: Cookies have DIFFERENT FORMAT: {"name":"session","value":"2399dfab"}
    for(var xa=0; xa<request.cookies.length; xa++) {
	var c=request.cookies[xa];
	if(c.name == "session") { session=c.value; break; }
    }
    if(!session) {
	reject(request, "No session");
	return;
    }
    var appName=fsp.basename(request.resourceURL.pathname);
    log("appName="+appName+";session="+session);
    var app=getApp(appName, session);
    if(!app) {
	reject(request, "Missing app: "+appName);
	return;
    }
    connection = request.accept('droidscript-gui-protocol', request.origin);
    log('CON '+request.origin+" for "+appName+"; session="+session+"; fiber="+Fiber.current);
    try { Fiber(function() { runApp(app, session, connection); }).run(); }
    catch(e) { log("runApp("+appName+") ERROR: "+e.stack); }
    //qFlush(a);
    
    //loadScripts(".", ["serve.js"], null, true);
   
    connection.on('message', handleWsMessage.bind(connection));
    connection.on('close', function(reasonCode, description) {
        log('DIS ' + connection.remoteAddress);
    });
}

/** 'this' should be bound to connection before calling **/
function handleWsMessage(message) {
    if (message.type === 'utf8') {
	var obj=null;
	try { obj=JSON.parse(message.utf8Data); }
	catch(e) { log("JSON Error: "+e+"; data="+message.utf8Data); return; }
        log('RCV ' + obj.msgId + ' '+JSON.stringify(obj.arguments)); //message.utf8Data);
        handleCallback.call(this,obj);
    }
    else if (message.type === 'binary') {
	log('Received Binary Message of ' + message.binaryData.length + ' bytes');
	//this.sendBytes(message.binaryData);
    }
}

function getAppForConn(thisConn) {
    // Which app owns this connection?
    for(var xa=0; xa<options.apps.length; xa++) {
        var app=options.apps[xa];
        if(!app.connections) { continue; }
        //log("CLICK:app="+util.inspect(app, {showHidden: false, depth: 3}));
        for(var session in app.connections) {
            var conn=app.connections[session];
            if(conn.connection === thisConn) { return {app:app, conn:conn}; }
	}
    }
    return null;
}

function handleCallback(obj) {
    //log('Received Message: ' + JSON.stringify(obj));
    var appConn=getAppForConn(this);
    var app=appConn.app;
    var conn=appConn.conn;
    if(obj.dump) {
	log("DMP "+JSON.stringify(conn.context._objects));
	log("DMP "+JSON.stringify(conn.context._objects[obj.id]));
	return;
    }
    if(obj.msgId == null) {
	var objId=obj.arguments[0];
	var onTouch=conn.context._objects[objId].onTouch;
	Fiber(function() {
	    try { onTouch(); }
	    catch(e) { log(e.stack); }
	}).run();
	return;
    }
    else {
	// msgId, cb, payload
	for(var xb=0; xb<conn.rq.length; xb++) {
	    var rcv=conn.rq[xb];
	    //log("oid="+obj.msgId+";rid="+rcv.msgId);
	    if(obj.msgId == rcv.msgId) {
		//log("rcv.msgId="+rcv.msgId+";rcv.cb="+rcv.cb);
		if(!rcv.cb || rcv.cb === 'N') { continue; } // Ignore if there is no callback
		conn.rq.splice(xb,1);
		//log("CLICK:cb="+util.inspect(rcv.cb, {showHidden: false, depth: 2}));
		//log("CLICK:rcv="+util.inspect(rcv, {showHidden: false, depth: 2}));
		Fiber(function() {
		    try { rcv.cb(null, obj.arguments); }
		    catch(e) { log("handleCallback ERROR (obj="+JSON.stringify(obj)+"; "+e.stack); }
		}).run();
		return;
	    }
	}
    }
    log('Received Unknown Message: ' + JSON.stringify(obj));
}

/*	
//  FIXME: Errors can be treated in one of three ways: 
//  FIXME:   1) Log on server only.  2) Also log in browser console.  3) Also show in DIV or alert().
*/

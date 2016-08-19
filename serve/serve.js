/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

log("__________________________________________________________________________");
log("ar2dscript starting...");

var WebSocketServer = require('websocket').server;
//var serialize = require('node-serialize'); // Objects including functions
var process = require('process'); // cwd
var crypto = require('crypto'); // sha256 (sessions)
var Fiber = require('fibers'); // Threading
//var yauzl = require("yauzl"); // Unzip



var http = require('http'); // Server
//var util = require("util"); // inspect
var fsp = require('path'); // path join
var fs = require('fs'); // createReadStream
var os = require('os'); // tmpdir

var connApps=[]; // app for each connection
//var _conns=[]; // connection for each app (by name)
var _apps=[]; // Apps (by name)
////////////////////////////////////////////////////////////////////////////////////////////////
/************************************** INITIALIZATION ****************************************/
////////////////////////////////////////////////////////////////////////////////////////////////
//loadConfig();
//updateAppsList();
//saveConfig();
startAutoBoots();
var server = http.createServer(httpHandler);
server.listen(options.port, function() { log("Server is listening on "+getIPAddresses().join(";")+" port "+options.port); });
var wsServer = new WebSocketServer({httpServer: server, autoAcceptConnections: false});
wsServer.on('request', wsHandler);

globalize(['log','require','options','parseCookies','sendCookies','statFiber','accessFiber',
	  'readFileFiber','readdirFiber','__dirname','loadScripts','ds','globalize',
	  'cacheFromZip','VERSION','inService','_serviceFiber']);
loadScripts(".", ["runapp.js"], null, true);



////////////////////////////////////////////////////////////////////////////////////////////////
/************************************** IMPLEMENTATION ****************************************/
////////////////////////////////////////////////////////////////////////////////////////////////

function getIPAddresses() {
    var ifaces = os.networkInterfaces();
    var addrs=[];
    Object.keys(ifaces).forEach(function (ifname) {
	ifaces[ifname].forEach(function (iface) {
	    // skip internal (i.e. 127.0.0.1) and non-ipv4 addresses
	    if ('IPv4' !== iface.family || iface.internal !== false) { return; }
	    addrs.push(iface.address);
	});
    });
    return addrs;
}

// function saveConfig() {
//     fs.writeFile('serve.json', JSON.stringify(options), (err) => {
// 	if(err) { log("saveConfig "+err); return }
//     });
// }


//////////// APPS /////////////

function startAutoBoots() {
    // FIXME: Only start apps that called app.SetAutoBoot(true)
    var ab=options.autoboots;
    for(var xa=0; xa<ab.length; xa++) {
		log("AutoBoot: "+ab[xa]);
		Fiber(function() {
			var a=getApp(ab[xa]);
			runApp(a);
		}).run();    
    }
}

function getApp(name, session) {
    // FIXME: verify existence of app in appdir, apksdir first, return null if not found
    var appPath=fsp.join(options.appsDir, name, name + ".js");
    try {
	if(!statFiber(appPath).isFile()) {
	    appPath=fsp.join(options.appsDir, name + ".spk");
	    if(!statFiber(appPath).isFile()) {
		appPath=fsp.join(options.apksDir, name + ".apk");
		if(!statFiber(appPath).isFile()) { return null; }
	    }
	}
	log("getApp: appPath="+appPath+";session="+session);
	// NOTE: Below is a possible approach for retrieving serialized app state
	//var appState=fsp.join(os.tmpdir(), "session-" + name + "-" + session + ".json")
	//var app=JSON.parse(readFileFiber(appState));
	//if(app && options.debug) { log(("STATE: "+appState+"="+JSON.stringify(app)).blue); } // console.dir
	var aid=name+"-"+session;
	var app=_apps[aid];
	if(!app) { app=_apps[aid]={name:name, path:appPath, VERSION:VERSION,
		alarms:[], sent:[], services:[], Fiber:Fiber, session:session};
 	    //console.log(colorsafe.green("NEW session for "+name+": session="+app.session)); }
	//else {
 	    //console.log(colorsafe.green("EXISTING SESSION RESUMED for "+name+": session="+app.session));
	}
	return app;
    }
    catch(err) {
	if(err.code !== 'ENOENT') {
	    log("getApp "+err);
	    throw err;
	}
	return null;
	//log("getApp: ENOENT: empty");
	//return {name:name};
    }
}

//////////// WEB SERVER /////////////

function normalizePath(fPath) {
    fPath=fPath.split("../").join("/").split("/").join(fsp.sep);
    if(fPath.indexOf('Apps/') != 0) { // Does not start with Apps
	return fsp.join(process.cwd(), "WebRoot", fPath); // Retrieve system resources
    }
    // Retrieve app resources
    var fp=fPath.substr(5); // fPath e.g. Apps/getIP/Img/favicon.png, fp e.g getIP/Img/favicon.png
    var xa=fp.indexOf('/');
    if(xa > -1) {
	var appName=fp.substr(0,xa); // e.g. getIP
	fp=fp.substr(xa);
	if(fp == "/Img/favicon.png") { 
	    try { 
		var filePath=fsp.join(options.sdcard, "DroidScript", appName, "Img", appName+".png");
		accessFiber(filePath, fs.R_OK); 
		return filePath;
	    }
	    catch(e) {
		var filePath=cacheFromZip(ds, ["assets/Img/Droid1.png"])[0];
		//console.log("CACHED filePath="+filePath);
		return filePath;
		//return fsp.join(ds+":assets","Img","Droid1.png"); // If no favicon use default one in DS apk
		//return fsp.join(process.cwd(),"WebRoot","Sys","Img","Droid1.png"); // If no favicon use default one
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
function changedApps() { // If either appsDir or apksDir has been modified
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
	try {
	    log(colorsafe.green("cookie: "+request.headers.cookie));
	    var cookies = parseCookies(request.headers.cookie);
	    log('REQ ' + request.url); //+"; cookies="+JSON.stringify(cookies));
	    var url=decodeURI(request.url);
	    if(!cookies.session) { cookies.session=newSession(); }
	    //log('session=' + cookies.session);
	    var filePath=null;
	    if(url === "/") {
		var idxName="_index";
		if(getApp(idxName, cookies.session)) {
// 		    url+="Apps/"+idxName+"/";
		    respond(3,response, cookies, 301, null, null,"<html><head><title>Moved Permanently</title></head><body>"+
			    "<h1>Moved Permanently: "+url+"</h1></body></html>", url);
		    return;
		}
		var content="<html><head><title>Applications</title></head><body><h1>Applications</h1><ul>";
		var mod=changedApps();
		if(mod.c1 || mod.c2) { // Update the list of apps/apks if either is changed
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
	    else if(url.indexOf('/Apps/') == 0) {
		var appName=url.substr(6);
		var xa=appName.indexOf('/');
		if(xa > -1 && xa < appName.length-1) {
		    appName=appName.substr(0,xa);
		    var file=url.substr(1).split('?')[0];
		    filePath = normalizePath(file);
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
			url+='/';
			respond(3,response, cookies, 301, null, null,"<html><head><title>Moved Permanently</title></head><body>"+
			    "<h1>Moved Permanently: "+url+"</h1></body></html>", url);
			return;
		    }
		    if(appName == "") {
			respond(4,response, cookies, 404, null, null, "<html><head><title>(No application specified)</title></head>"+
			    '<body><a href="/" style="background:white; color:black; display:;" id="indexLink">&lt;Index</a>'+
			    "<h1>(No application specified)</h1></body></html>");
			log(colorsafe.red('No application specified'));
			return;
		    }
		    if(getApp(appName, cookies.session)) { filePath = normalizePath('client.html'); }
		    else {
			respond(5,response, cookies, 404, null, null, "<html><head><title>(Application not found: "+appName+")</title></head>"+
			    '<body><a href="/" style="background:white; color:black; display:;" id="indexLink">&lt;Index</a>'+
			    "<h1>(Application not found: "+appName+")</h1></body></html>");
			log(colorsafe.red('Application not found: '+appName));
			return;
		    }
		}
	    }
	    else if(filePath == null) {
		var file=url.substr(1).split('?')[0];
		filePath = normalizePath(file);
	    }
	    
	    // Serve regular files.
	    try { accessFiber(filePath, fs.R_OK); }
	    catch(e) {
		respond(6,response, cookies, 404, null, null, "<html><head><title>Not found: "+filePath+"</title></head>"+
		    '<body><a href="/" style="background:white; color:black; display:;" id="indexLink">&lt;Index</a>'+
		    "<h1>Not found: "+filePath+"</h1></body></html>");
		log(colorsafe.red('ERR Not found: '+filePath+"; e="+e));
		return;
	    }
	    var stat = statFiber(filePath);
	    response.on('error', function(err) { response.end(); });
	    var ctype=getContentType(filePath);
	    respond(7,response, cookies, 200, ctype, stat.size);
	    fs.createReadStream(filePath).pipe(response); // End automatically
	}
	catch(e) {
	    respond(8,response, cookies, 500, null, null,"<html><head><title>Server Error</title></head><body>"+
		"<h1>Server Error: "+(filePath?filePath:e.message)+"</h1></body></html>");
	    log(colorsafe.red('ERR CRASH '+filePath+"; e="+e.stack));
	    return;
	}
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
    var appName=fsp.basename(decodeURI(request.resourceURL.pathname));
    log("appName="+appName+";session="+session);
    var app=getApp(appName, session);
    if(!app) {
	reject(request, "Missing app: "+appName);
	return;
    }
    connection = request.accept('droidscript-gui-protocol', request.origin);
    log('CON '+request.origin+" for "+appName+"; session="+session+"; fiber="+Fiber.current+"; connApps.length="+Object.keys(connApps).length);
    Fiber(function() { 
	try {
	    connApps[connection]=app;
	    if(!app.started) {
		app.started=true;
		runApp(app, session, connection);
	    }
	    else {
		log(colorsafe.green('XSN '+appName+'; Existing session='+session));
		app.connection=connection; // Save new connection
	    }
	    
	}
	catch(e) {}
// 	for(var xa=0; xa<app.services.length; xa++) {
// 	    try { runServiceReady(app, session, connection); }
// 	    catch(e) {}
// 	}
    }).run();
    //qFlush(a);
    
    //loadScripts(".", ["serve.js"], null, true);
   
    connection.on('message', handleWsMessage.bind(connection));
    connection.on('close', function(reasonCode, description) {
        log('DIS ' + connection.remoteAddress);
    });
}

/** NOTE: 'this' should be bound to connection before calling **/
function handleWsMessage(message) {
    if (message.type === 'utf8') {
	var obj=null;
	try { obj=JSON.parse(message.utf8Data); }
	catch(e) { log("JSON Error: "+e+"; data="+message.utf8Data); return; }
        handleCallback.call(this,obj);
    }
    else if (message.type === 'binary') {
	log('Received Binary Message of ' + message.binaryData.length + ' bytes');
	//this.sendBytes(message.binaryData);
    }
}

//* NOTE: 'this' should be bound to connection before calling **/
function handleCallback(obj) {
    log('Received Message: ' + JSON.stringify(obj));
    var app=connApps[this];
    if(obj.dump) {
	log("DMP "+JSON.stringify(app.context._objects));
	log("DMP "+JSON.stringify(app.context._objects[obj.id]));
	return;
    }
    if(obj.mid === null) {
        //log('RCV ' + obj.mid + ' '+JSON.stringify(obj.args)); //message.utf8Data);
	var id=obj.args[0].id;
	if(id) {
	    var onClick=app.context._objects[id].onClick;
	    Fiber(function() {
		try { onClick(); }
		catch(e) { log(colorsafe.red(e.stack)); }
	    }).run();
	}
	return;
    }
    else if(app.sent) {
	//log('sent='+util.inspect(app.sent)+';mid('+obj.mid+')==sent.mid('+app.sent.mid+')***');
	for(var xa=0; xa<app.sent.length; xa++) {
	    if(obj.mid === app.sent[xa].mid) {
		var sent=app.sent[xa];
		var fname=sent.fn;
		var cb=sent.cb;
		app.sent.splice(xa,1);
		log("app.sent("+app.session+").length="+app.sent.length);
		if(cb) {
		    //log('RCV ' + obj.mid + ' '+fname+'='+JSON.stringify(obj.args)); //message.utf8Data);
		    Fiber(function() {
			try { cb(null, obj.args); }
			catch(e) { log("handleCallback ERROR (obj="+JSON.stringify(obj)+"; "+e.stack); }
		    }).run();
		}
		return;
	    }
	}
    }
    log('Received Unknown Message: ' + JSON.stringify(obj)+"; app.sent="+util.inspect(app.sent)+';mid('+obj.mid+')==sent.mid('+app.sent.mid+')***;session='+app.session);
}

/*	
//  FIXME: Errors can be treated in one of three ways: 
//  FIXME:   1) Log on server only.  2) Also log in browser console.  3) Also show in DIV or alert().
*/

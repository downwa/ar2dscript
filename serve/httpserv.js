/* ar2dscript http server - nodejs implementation of DroidScript, running server apps via browser
 * Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */
(typeof define !== "function" ? function($){ $(require, exports, module); } : define)(function(require, exports, module, undefined) {

exports.httpserv = httpserv;

const colorsafe = require('colors/safe');
const crypto = require('crypto'); // sha256 (sessions)
const Fiber = require('fibers'); // Threading
const ffs = require('./fiberfill'); // Replacements for fs blocking functions, using Fibers
const fsp = require('path'); // path join
var fs = require('fs'); // createReadStream

/*
 * Test function
 */
function httpserv(options) {
    process.on('message', handleMessage);
    var server = require('http').createServer(httpHandler);
    server.listen(options.port, function() { console.info("httpserv is listening on "+getIPAddresses().join(";")+" port "+options.port); });
    require('./wsserv').wsserv(server);
    const appmain = require('./appmain.js').init(options);
    getApp = appmain.getApp;
    changedApps = appmain.changedApps;
    listAppsApks = appmain.listAppsApks;
}

function handleMessage(msg) {
    if (msg === 'shutdown') { // initiate graceful close of any connections to server
	process.exit();
    }
    console.log('handleMessage',msg);
}

function getIPAddresses() {
    var ifaces = require('os').networkInterfaces();
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

function newSession() {
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
}

function handleIndexApp(response, cookies) {
    var idxName="_index";
    if(getApp(idxName, cookies.session)) {
	var url="/Apps/"+idxName+"/";
	return respond(3,response, cookies, 301, null, null,"<html><head><title>Moved Permanently</title></head><body>"+
		"<h1>Moved Permanently: "+url+"</h1></body></html>", url);
    }
    return false;
}

function handleIndex(response, cookies) {
    if(handleIndexApp(response, cookies)) { return true; }
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
    return respond(1,response, cookies, null, null, null, content);
}

// Produce SVG background gradient dynamically, or serve other App files
function handleAppFile(appName, response, cookies) {
    appName=appName.substr(0,xa);
    var file=url.substr(1).split('?')[0];
    var filePath = normalizePath(file);
    var xb=filePath.indexOf("/Img/backgrad_");
    if(xb > -1 && filePath.endsWith(".svg")) {
	var objId=parseInt(filePath.substr(xb+14));
	var content=backgroundGradient(appName, cookies.session, objId);
	if(content != "") {
	    return respond(2,response, cookies, null, "image/svg+xml", null, content);
	}
    }
    return serveRegularFile(filePath, response, cookies);
}

function serveRegularFile(filePath, response, cookies) {
    try { ffs.accessFiber(filePath, fs.R_OK); }
    catch(e) {
	respond(6,response, cookies, 404, null, null, "<html><head><title>Not found: "+filePath+"</title></head>"+
	    '<body><a href="/" style="background:white; color:black; display:;" id="indexLink">&lt;Index</a>'+
	    "<h1>Not found: "+filePath+"</h1></body></html>");
	console.error(colorsafe.red('ERR Not found: '+filePath+"; e="+e.stack));
	return false;
    }
    var stat = ffs.statFiber(filePath);
    response.on('error', function(err) { response.end(); });
    var ctype=getContentType(filePath);
    respond(7,response, cookies, 200, ctype, stat.size);
    fs.createReadStream(filePath).pipe(response); // End automatically
    return true;
}

function handleApps(appName, response, cookies) {
    var fail="";
    if(appName == "") { fail="No application specified"; }
    else if(!getApp(appName, cookies.session)) { fail="Application not found: "+appName; }
    if(fail !== "") {
	respond(4,response, cookies, 404, null, null, "<html><head><title>("+fail+")</title></head>"+
	    '<body><a href="/" style="background:white; color:black; display:;" id="indexLink">&lt;Index</a>'+
	    "<h1>("+fail+")</h1></body></html>");
	console.error(colorsafe.red(fail));
	return false;
    }
     return serveRegularFile(normalizePath('index.html'), response, cookies);
}

function httpHandler(request, response) {
    Fiber(function() {
	try {
	    var cookies = parseCookies(request.headers.cookie);
	    console.log(colorsafe.green('REQ ' + request.url+"; cookies="+JSON.stringify(cookies)));
	    var url=decodeURI(request.url);
	    if(!cookies.session) { cookies.session=newSession(); }

	    // ********* HTTP SERVICE ********** //
	    if(url === "/") { return handleIndex(response, cookies); }
	    else if(url.indexOf('/Apps/') == 0) { // Handle Apps and subfiles of Apps
		var appName=url.substr(6);
		var xa=appName.indexOf('/');
		if(xa > -1 && xa < appName.length-1) { // If SLASH within appName (subfile of App)
		    return handleAppFile(appName, response, cookies);
		}
		else {
		    if(xa !== appName.length-1) { // If SLASH is not at end of appName
			url+='/';
			return respond(3,response, cookies, 301, null, null,"<html><head><title>Moved Permanently</title></head><body>"+
			    "<h1>Moved Permanently: "+url+"</h1></body></html>", url);
		    }
		    return handleApps(appName.substr(0,xa), response, cookies);
		}
	    }
	    var file=url.substr(1).split('?')[0];
	    return serveRegularFile(normalizePath(file), response, cookies);
	}
	catch(e) {
	    respond(8,response, cookies, 500, null, null,"<html><head><title>Server Error</title></head><body>"+
		"<h1>Server Error in "+url+": "+e.message+"</h1></body></html>");
	    console.error('ERR CRASH '+url+"; e="+e.stack);
	    return false;
	}
    }).run();
}

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
		ffs.accessFiber(filePath, fs.R_OK); 
		return filePath;
	    }
	    catch(e) {
		var filePath=require('./zipper.js').cacheFromZip(ds, ["assets/Img/Droid1.png"])[0];
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
    if(content) { response.write(content); response.end(); return true; }
    return false;
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
    return list;
}

// *********************************************************************************

});

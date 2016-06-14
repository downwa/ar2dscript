/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

var otherSession=false;
var _objects=[];

function main() {
    var wsurl=window.location.host;

    //var W3CWebSocket = require('websocket').w3cwebsocket;
    
    var wsurl='ws://'+window.location.hostname+window.location.pathname;
    var title=window.location.pathname.substr(1);
    var xa=title.lastIndexOf('/');
    if(xa > -1) { title=title.substr(xa+1); }
    document.title=title;
    console.log('CON '+wsurl); //+'; cookie='+getCookie("session"));
    var proto='droidscript-gui-protocol';
    client = null;
    
    try { client=new WebSocket(wsurl, proto); }
    catch(e) { return null; }

    client.onerror = function() {
        console.log('Connection Error');
    };
    
    client.onopen = function() {
        //console.log('WebSocket Client Connected');
	if (client.readyState === client.OPEN) {
	    var wloc=window.location.href;
	    var xa=wloc.indexOf('#');
	    if(xa > -1) { wloc=wloc.substring(0,xa); }
	    if(wloc != window.location.href) { window.location.href=wloc; }
	    window.title='Connected.';
	}
    };
    
    client.onclose = function() {
        console.log('droidscript-gui-protocol Client Closed');
        //var wloc=window.location.href;
        //var xa=wloc.indexOf('#');
        //if(xa > -1) { wloc=wloc.substring(0,xa); }
        //window.location.href=wloc+'# Reconnect in 5 seconds...';
        //window.title='Reconnect in 5 seconds...';
	if(!otherSession) {
	    if(confirm('Connection to server lost.  Reconnect?')) { main(); }
	}
    };
    
    client.onmessage = function(e) {
        //console.log('message received');
        if (typeof e.data === 'string') {
	    //alert('data='+e.data);
            var d=JSON.parse(e.data);
            console.log("RCV " + d.msgId+ " " + d.fn+JSON.stringify(d.arguments));
	    if(d.f != '') { 
		try { eval("window['"+d.fn+"']="+d.f); }
		catch(e) { throw new Error(e.message+": instantiating "+d.f); }
	    }
	    var fun=null;
	    try { fun=window[d.fn]; }
	    catch(e) { throw new Error(e.message+": locating function "+d.fn); }
	    if(fun) {
		var args=normalizeArgs(d.arguments);
		try {
		    var obj=null; // FIXME
		    console.log("      "+d.fn+" "+JSON.stringify(args));
		    var ret=fun.apply(obj, args);
		    if(d.cb !== 'N') { send({msgId:d.msgId, arguments:[ret]}); }
		}
		catch(e) { throw new Error(e.message+": executing "+d.fn+": "+fun.toString(), e.fileName, e.lineNumber); }
	    }
	    else { throw new Error('Missing function: '+d.fn); }
    //         alert('received: '+d.fn);
    //         setTimeout(function() {
    //                 console.log("Sending OK response to alert");
    //                 send({fn:'alertClick', arguments:['ok']});
    //         }, 15000);
        }
    };
}

////////////////////////////

var dimAmt=0.0;
function dim() {
	var body=document.getElementsByTagName('body')[0];
	dimAmt+=0.025;
	body.style.background="rgba(0, 0, 0, "+dimAmt+")"
	if(dimAmt <= 0.5) { setTimeout('dim()',25); }
	else { 
	    body.innerHTML+='<br /><br /><center style="background:white; color: red;">(Disconnected by other session)</center>'; 
	    otherSession=true;
	    client.close();
	}
}

// Replace expanded arguments with argument references (by objId)
function normalizeArgs(args) {
    for(var xa=0; xa<args.length; xa++) {
        if(!args[xa]) { continue; }
        var id=args[xa].id;
	var obj=args[xa];
        if(obj && id && id != "" && Object.keys(obj).length == 1) { // Only expands if not already expanded
            obj=_objects[id];
            if(!obj) { console.log("MISSING object #"+id); }
            args[xa]=obj;
        }
    }
    return args;
}

function d(id) {
    var o=_objects[id];
    console.log(JSON.stringify(o));
    return o;
}

function send(obj) {
        client.send(JSON.stringify(obj));
}

////////////////////////////


main();
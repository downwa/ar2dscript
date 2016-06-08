/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

var otherSession=false;

function main() {
    var wsurl=window.location.host;

    //var W3CWebSocket = require('websocket').w3cwebsocket;
    
    var wsurl='ws://'+window.location.hostname+window.location.pathname;
    var title=window.location.pathname.substr(1);
    var xa=title.lastIndexOf('/');
    if(xa > -1) { title=title.substr(xa+1); }
    document.title=title;
    console.log('Connecting Websocket: url='+wsurl); //+'; cookie='+getCookie("session"));
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
            var d=JSON.parse(e.data);
            console.log("RCV " + d.fn+JSON.stringify(d.arguments));
	    if(d.f != '') { 
		try { eval("window['"+d.fn+"']="+d.f); }
		catch(e) { throw new Error('ERR: f='+d.f+"; e="+e.message); }
	    }
	    var fun=null;
	    try { fun=window[d.fn]; }
	    catch(e) { throw new Error("ERR: fn="+d.fn+"; e="+e.message); }
	    if(fun) {
		try {
		    var args=d.arguments;
		    var obj=null; // FIXME
		    //console.log("fun="+fun.toString());
		    fun.apply(obj, args);
		}
		catch(e) { throw new Error("ERR: fun="+fun.toString()+"; e="+e.message); }
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

function send(obj) {
        client.send(JSON.stringify(obj));
}

////////////////////////////


main();
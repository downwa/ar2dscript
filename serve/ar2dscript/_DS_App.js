/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript App emulation **/

//console.log(util.inspect(this));

/////////////////////////////////////////////////////////////////////////////////

function CreateText(text,width,height,options) {
    console.log("CreateText: this.id="+this.id);
    _load("_DS_Txt");
    return new _DS_Txt(text,width,height,options).id;
}

function CreateLayout(type, options) {
    console.log("CreateLayout: this.id="+this.id);
    _load("_DS_Lay");
    return new _DS_Lay(type, options).id;
}

function AddLayout(layout) {
    layout=_objects[layout];
    console.log("AddLayout: this.id="+this.id+";layout.id="+layout.id);
    layout.parent={id:this.id};
    this.layouts.push({id:layout.id});
    var body=$('body');
    body.append($('#'+layout.id+''))
    _rmtAdd(body.id, layout.id);
}

//     - id TO ADD TO (of top level BODY tag in this case), 
//     - id OF OBJECT TO ADD (layout in this case)
//     
//     and sends that id, and current snippet of HTML from htmlObj for that object, 
//     to the browser
function _rmtAdd(tgtId, objId) {
    var html=$('#'+objId+'').html();
    _send('add', [tgtId, html]);
}

function _sendX(msg) {
    console.log("_app IS "+_app+"***");
    _app.connection.sendUTF(JSON.stringify(msg));
}

function GetModel() {
    return "Remix compatible ar2dscript v"+navigator._VERSION;
}

/***********************************************************************8
var cheerio = require('cheerio');

var $ = cheerio.load(
    "<html><head><title>Test</title><div id='headhide' style='display:none'></div></head><body><h1>Hello</h1><ul id='try'><li>first</li><li>2nd</li></ul></body></html>");     
$('html').html(
    "<html><head><title>Test</title><div id='headhide' style='display:none'></div></head><body><h1>Hello</h1><ul id='try'><li>first</li><li>2nd</li></ul></body></html>");

var e=$.parseHTML("<div style='width:100vw' id='testme'></div>");    
$('#headhide').append(e);
    
$('#headhide').append($('#testme'))

$.root().html()

$('body').append($('#testme'))
$('#testme').css('width','95vw')
     
*/
    
function _createNode(elem, idNum) {
    var id="obj_"+idNum;
    $('#headhide').append($.parseHTML("<"+elem+" id="+id+"></"+elem+">"));
    return $('#'+id);
}

function _parseLayoutOptions(options) {
    // OPTIONS: Left”, “Right”, “Bottom” and “VCenter”, by default objects will be aligned “Top,Center”
    // FillXY - Layout should fill its parent (if the only layout, it will fill the screen.
    //          Without FillXY, size to minimums, not maximums).
    // Horizontal, Vertical
    var opts={hAlign:"center", vAlign: "top", fillx:false, filly:false, direction:"vertical"};
    if(!options) { options=''; }
    var opt=options.toLowerCase();
    // Horizontal alignment
    if(opt.indexOf('left') > -1) { opts.hAlign="left"; }
    if(opt.indexOf('right') > -1) { opts.hAlign="right"; }
    if(opt.indexOf('center') > -1) { opts.hAlign="center"; }
    // Vertical alignment
    if(opt.indexOf('top') > -1) { opts.vAlign="top"; }
    if(opt.indexOf('bottom') > -1) { opts.vAlign="bottom"; }
    if(opt.indexOf('vcenter') > -1) { opts.vAlign="center"; }
    // Horizontal and vertical fill
    if(opt.indexOf('fillxy') > -1) { opts.fillx=true; opts.filly=true; }
    if(opt.indexOf('fillx') > -1) { opts.fillx=true; }
    if(opt.indexOf('filly') > -1) { opts.filly=true; }
    // Direction
    if(opt.indexOf('vertical') > -1) { opts.direction="vertical"; }
    if(opt.indexOf('horizontal') > -1) { opts.direction="horizontal"; }
    
    return opts;
}

function SetOrientation(orient, callback) {
    // orient = Portrait, Landscape, or Default
    __rmt(function(orient, callback) {
	// Only supported in full-screen mode
	if("requestFullScreen" in document.documentElement && "orientation" in screen) {
	    document.documentElement.requestFullScreen();
	    screen.orientation.lock(orient.toLowerCase()).then(callback, function(err) {
		console.log("SetOrientation not available on this device: "+err);
	    });
	}
	else { console.log("SetOrientation: requestFullScreen or orientation not supported."); }
    }, this, arguments);
}

function GetOrientation() {
    // returns Portrait, Landscape, or Default
    return global._ret(function(orient,callback) {
	var orient="Default";
	if("orientation" in screen) {
	    var ty=screen.orientation.type;
	    if(ty.indexOf('portrait') == 0) { orient="Portrait"; }
	    else if(ty.indexOf('landscape') == 0) { orient="Landscape"; }
	    else if(ty.indexOf('natural') == 0) { orient="Default"; }
	}
	else { console.log("GetOrientation: orientation not supported."); }
	return orient;
    }, this, arguments);
}

function ShowProgress(msg, options) {
    __rmt(function(msg, options) {
	if(!options || options.toLowerCase().indexOf('nodim') == -1) {
	    var lay=getFirstLayout();
	    lay.div.style.opacity=0.2;
	}
	if(!msg) { msg=''; }
	var progress=document.getElementById('_progressSpinner_');
	if(!progress) {
	    var body=document.getElementsByTagName('body')[0];
	    body.innerHTML+='<div class="hover" id="_progressSpinner_" style="display:none">'+
		    '<!-- Spinner created on http://loading.io/ -->'+
		    '<?xml version="1.0" encoding="utf-8"?><svg width="48px" height="48px" xmlns="http://www.w3.org/2000/svg" '+
		    'viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="uil-ring-alt"><rect x="0" y="0" width="100" '+
		    'height="100" fill="none" class="bk"></rect><circle cx="50" cy="50" r="40" stroke="#2f3030" fill="none" '+
		    'stroke-width="10" stroke-linecap="round"></circle><circle cx="50" cy="50" r="40" stroke="#737778" '+
		    'fill="none" stroke-width="6" stroke-linecap="round"><animate attributeName="stroke-dashoffset" dur="2s" '+
		    'repeatCount="indefinite" from="0" to="502"></animate><animate attributeName="stroke-dasharray" dur="2s" '+
		    'repeatCount="indefinite" values="150.6 100.4;1 250;150.6 100.4"></animate></circle></svg>'+
		    '<span id="_progressSpinnerText_" style="display:table-cell; vertical-align:middle;"></span>'+
		'</div>';
	    progress=document.getElementById('_progressSpinner_');
	}
	document.getElementById('_progressSpinnerText_').innerHTML=msg;
	progress.style.display='flex'; 
    }, this, arguments);
}

function HideProgress() {
    __rmt(function() {
	var lay=getFirstLayout();
	lay.div.style.opacity=1.0;
	var progress=document.getElementById('_progressSpinner_');
	if(progress) { progress.style.display='none'; }
    }, this, arguments);
}

function PreventScreenLock(prevent) {
   __rmt(function(prevent) {
	if("wakeLock" in navigator) {
	    if(prevent) { navigator.wakeLock.request("display"); }
	    else { navigator.wakeLock.release("display"); }
	}
	else { console.log("PreventScreenLock: wakeLock not supported."); }
   }, this, arguments);
}

function SetScreenMode(mode) {
    // mode=Full,Game,Normal,Default
   __rmt(function(mode) {
       mode=mode.toLowerCase();
       if(mode==="full" || mode==="game") {
	    if("requestFullScreen" in document.documentElement) {
		document.documentElement.requestFullScreen();
	    }
	    else {
		console.log("SetScreenMode: requestFullScreen not supported."); 
		alert("This application is best viewed fullscreen.");
	    }
       }
       else {
	    if("exitFullScreen" in document.documentElement) {
		document.documentElement.exitFullScreen();
	    }
	    else { console.log("SetScreenMode: exitFullScreen not supported."); }
       }
   }, this, arguments);
}


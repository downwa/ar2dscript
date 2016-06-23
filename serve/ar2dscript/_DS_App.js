/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript App emulation **/

global._nextObjId_=1; // Must start at >0

/*module.exports = (_app) => {
    global._app=_app;
    var _remote=require('./_rmt.js')(_app);
    global.__rmt = _remote.__rmt;
    global.__ret = _remote.__ret;
    global._obj = _remote._obj;
    return {
//////////////////////////////////////////////////////////
	SetOrientation: SetOrientation,
	GetOrientation: GetOrientation,
	ShowProgress:ShowProgress,
	HideProgress: HideProgress,
	PreventScreenLock: PreventScreenLock,
	SetScreenMode: SetScreenMode,
	GetModel: GetModel,
	CreateLayout: CreateLayout,
	CreateText: CreateText
//////////////////////////////////////////////////////////
    };
};
*/
/////////////////////////////////////////////////////////////////////////////////

function CreateText(text,width,height,options) {
    this.text=text;
    this.width=width;
    this.height=height;
    this.options=options;
    this.backColor='#000000';
    this.textColor='#808080'; 
    this.id=_newId(this);
    __rmt(function(text,width,height,options) {
	var htmlObj=document.createElement('DIV');
	htmlObj.id='obj_'+this.id;
	htmlObj.innerHTML=text;
	this.htmlObj=htmlObj;
    }, this, arguments);
    return this.id;
}

function CreateLayout(type, options) {
    // type=Linear,Frame,Absolute
    // options=(Linear) Vertical|Horizontal,FillXY
    this.type=type;
    this.background="";
    this.backGradient={color1:'#000000',color2:'#000000',color3:'#000000', 
                x1:0,y1:0, x2:1,y2:1};
    this.children=[];
    this.padding=[0,0,0,0];
    this.options=options;
    this.id=_newId(this);
    this.opts=parseLayoutOptions(options);
    var elem='DIV'; // FIXME 
    var htmlObj=$.parseHTML("<"+elem+"></"+elem+">");
    htmlObj.attribs['id']='obj_'+this.id;
    if(opts.vAlign == "center") { htmlObj.attribs['class']='center'; }
    // FIXME: Below reference to s does not update parent object 
    //var s=htmlObj.attribs['style'];
    // If in the document tree, could use:
    // var o=$('#tester');    // Get object with id tester
    // o.css('width','95vw'); // Set value
    // NOTE: Try doing this by adding the element to the document tree even before it has been added by the calling program.
    // NOTE: Just make sure to keep it in a hidden div that is not the one designated to be the main one, e.g.
    // <div id='main'>  main program layouts added here </div>
    // <div id='hidden'> hidden layouts here until they are added to main </div>
    
    if(opts.fillx) { s.width='95vw'; }
    if(opts.filly) { s.height='95vh'; } // Slightly less to avoid scroll bars
    s.background='black';
    s.color='grey';
    this.htmlObj=htmlObj;
    return this.id;
}

function parseLayoutOptions(options) {
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

function _newId(obj) {
    console.log("_newId obj="+JSON.stringify(obj));
    var id=global._nextObjId_++; // Allocate a new id
    _objects[id]=obj;
    return id;
}

function GetModel() {
    return "Remix compatible ar2dscript v"+navigator._VERSION;
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


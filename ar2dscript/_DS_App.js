/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript App emulation **/

function SetOrientation( orient,callback ) {
    // orient = Portrait, Landscape, or Default
    global._rmt(function(orient,callback) {
	// Only supported in full-screen mode
	if("requestFullScreen" in document.documentElement && "orientation" in screen) {
	    document.documentElement.requestFullScreen();
	    screen.orientation.lock(orient.toLowerCase()).then(callback, function(err) {
		console.log("SetOrientation not available on this device: "+err);
	    });
	}
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
	return orient;
    }, this, arguments);
}

function ShowProgress(msg, options) {
    global._rmt(function(msg, options) {
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
function App_HideProgress() {
    var lay=getFirstLayout();
    lay.div.style.opacity=1.0;
    var progress=document.getElementById('progress');
    progress.style.display='none';
}


function progress() {

}

module.exports = (_app) => {
    var _remote=require('./_rmt.js')(_app);
    global._rmt = _remote._rmt;
    global._ret = _remote._ret;
    return {
//////////////////////////////
	SetOrientation: SetOrientation,
	GetOrientation: GetOrientation
//////////////////////////////
    };
};

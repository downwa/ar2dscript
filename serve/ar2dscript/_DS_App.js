/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript App emulation **/
//console.log(util.inspect(this));

/////////////////////////////////////////////////////////////////////////////////

function _DS_App_CreateText(text,width,height,options) {
    _load("_DS_Txt");
    return new _DS_Txt(text,width,height,options).id;
}

function _DS_App_CreateLayout(type, options) {
    _load("_DS_Lay");
    return new _DS_Lay(type, options).id;
}

function _DS_App_CreateScroller(width, height, options) {
    _load("_DS_Scr");
    return new _DS_Scr(width, height, options).id;
}

function _DS_App_AddLayout(layout) {
    layout=_objects[layout];
    //console.log("AddLayout: this.id="+this.id+";layout.id="+layout.id);
    layout.parent={id:this.id, cls:"App", visible:true};
    _DS_Lay_SetSize.call(layout); // Already set size, just update units
    this.children.push({id:layout.id});
    layout.visible=true;
    _set.call(this, {children:this.children});
}

function _DS_App_GetModel() {
    return "Remix compatible ar2dscript v"+navigator._VERSION;
}

function _DS_App_CreateService(packageName, classname, options, callback) {
    //console.log("CreateLayout: this.id="+this.id);
    _load("_DS_Svc");
    return new _DS_Svc(packageName, classname, options, callback).id;
}

function _DS_App_GetPackageName() {
    return "com.iglooware.ar2dscript";
}

function _DS_App_GetRunningServices() {
	var ret=exec('ps aux');
	if(ret.err) {
		if(ret.err.error) { throw ret.err.error; }
		if(ret.err.stderr != '') { throw new Error('ERROR: '+ret.err.stderr); }
	}
	var data=columnParser(ret.data);
	ret=[];
	for(var xa=0; xa<data.length; xa++) {
		// USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
		var r=data[xa];
		ret.push({user:r['USER'], pid:r['PID'], name:r['COMMAND'].split(' ')[0]});
	}
	return ret;
}

function _DS_App_SetAutoBoot(tfService) {
	var options=JSON.parse(fs.readFileSync('serve/config.json'));
	var ab=options.autoboots;
	if (tfService) {
		var add=true;
		for(var xa=0; xa<ab.length; xa++) {
			if (ab[xa] == _app.name) { add=false; }
		}
		if (add) { options.autoboots.push(_app.name); }
	}
	else {
		for(var xa=ab.length-1; xa>=0; xa--) {
			if (ab[xa] == _app.name) { options.autoboots.splice(xa,1); }
		}
	}
	//console.log("NEW OPTIONS: ",options);
	fs.writeFileSync('serve/config.json',JSON.stringify(options));
}

function _DS_App_SendMessage(msg) {
	if(process.send) { process.send({msg: msg}); }
}

function _DS_App_SetAlarm(type,id,callback,time,interval,options) {
	// type=Set,Repeat,Cancel
	// id=number
	// callback when alarm fires
	// time when alarm should fire
	// interval milliseconds betweeen repeat (if type is Repeat)
	type=type.toLowerCase();
	options=(options ? options.toLowerCase() : "");
	switch(type) {
		case "set": {
			var alarm={alarm:setTimeout(eval(callback), time-(new Date()), id), type:type, id:id, time:time, options:options};
			_app.alarms[id]=alarm;
			break;
		}
		case "repeat": {
			var alarm={alarm:setInterval(eval(callback), time-(new Date()), id), type:type, id:id, time:time, options:options};
			_app.alarms[id]=alarm;
			break;
		}
		case "cancel": {
			var alarm=_app.alarms.splice(id,1);
			switch(alarm.type) {
				case "set":    { clearTimeout(alarm.alarm); break; }
				case "repeat": { clearInterval(alarm.alarm); break; }
			}
		}
	}
}

function _DS_App_CreateDialog(title, options) {
    _load("_DS_Dlg");
    return new _DS_Dlg(title, options).id;
}

function _DS_App_CreateButton(text, width, height, options) {
    _load("_DS_Btn");
    return new _DS_Btn(text, width, height, options).id;
}

function _DS_App_Exit() {
    _send('exit', [], _app, false); // false = do not awaitReturn
}

////////////
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


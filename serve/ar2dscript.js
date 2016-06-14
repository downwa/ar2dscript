/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/***************************************************************************************************
 * Bridge between ar2dscript server/client and DroidScript app implementation
 ***************************************************************************************************/

var fs = require('fs')
  , os = require('os')
  , vm = require('vm')
  , fsp = require('path')
  , process = require('process')
  , _remote = require('./ar2dscript/_rmt.js')(_app)
  , exec = require('child_process').exec;

// NOTE: For some reason, setTimeout cannot be implemented here or it hangs (must be in parent)

/***************************************************************************************************/
////////////////////////////////////// DroidScript App bridge ///////////////////////////////////////
/***************************************************************************************************/

// FIXME: prompt, alert, confirm, any other JavaScript UI calls need to be sent to client

function _DroidScript_Bridge() {
    prompt=function(promptMsg, dftVal) {
	//console.log("promptMsg="+promptMsg+";dftVal="+dftVal);
	var h1=promptMsg[0] == '#';
	var h2=(parseInt(promptMsg) || promptMsg[0] == '0');
	if(h1 || (h2 && dftVal.match(/^[A-Z][a-z]*\.[A-Z][A-Za-z]*\(/))) { // e.g. App.CreateLayout(
/*
id=;args=["_Init"]
id=;args=["App.SetOrientation(","Portrait","null"]
id=;args=["App.PreventScreenLock(true"]
id=;args=["App.SetScreenMode(","Full"]
id=;args=["App.CreateLayout(Absolute",""]
id=;args=["App.CreateLayout(Absolute","undefined"]
*/	    
	    var id=promptMsg[0]=='#' ? promptMsg.substr(1) : promptMsg;
	    var args=dftVal.split('\f');
	    //console.log("id="+id+";args="+JSON.stringify(args));
	    var a0=args[0];
	    var xa=a0.indexOf('(');
	    var fn=null;
	    var cls="_Main_";
	    if(xa > -1) {
		fn=a0.substr(0, xa);
		if(xa < a0.length-1) { args[0]=a0.substr(xa+1); }
		else { args.shift(); }
	    }
	    else { fn=a0; args.shift(); }
	    xa=fn.indexOf('.');
	    var clsBase="_Main_";
	    if(xa > -1) { clsBase=fn.substr(0,xa); cls="_DS_"+clsBase; fn=fn.substr(xa+1); }
	    var module=null;
	    if(eval("typeof "+cls) === 'undefined') {
		try { eval(cls+"=require('./ar2dscript/"+cls+".js')"); }
		catch(e) { throw new Error("ERROR loading "+cls+"."+fn+": "+e.message); return; }
	    }
	    module=eval(cls)(_app);
	    for(xa=0; xa<args.length; xa++) {
		if(typeof args[xa] === 'string') {
		    if(args[xa] === "null" || args[xa] === "undefined") { args[xa]=null; }
		}
	    }
	    if(!module[fn]) {
		throw new Error("UNDEFINED "+fn+JSON.stringify(args)+"; id="+id+"; cls="+cls);
		return;
	    }
	    try { 
		//console.log("CALL "+fn);
		var obj=_app._objects[id];
		if(!obj) { obj={cls:clsBase,id:id}; }
		console.log("BRD "+clsBase+"."+fn+" "+JSON.stringify(args));
		var ret=module[fn].apply(obj, args); // Passes new object to called function
		//console.log("RET OBJ="+JSON.stringify(obj));
		return ret;
	    }
	    catch(e) {
		throw new Error("ERROR executing: "+fn+JSON.stringify(args)+"; id="+id+"; cls="+cls+"; e="+e.stack);
	    }
	}
	else { return _prompt(promptMsg, dftVal); }
    };
    
    alert=function(msg) { _alert(msg); };

    document={
	getElementsByTagName: function(tagName) {
	    return [{
		appendChild: function(script) {
		    // FIXME: Load script here
		    console.log("LOAD SCRIPT: "+script.src+'; script text='+script.text);
		}
	    }];
	},
	createElement: function(tagName) {
	    return {};
	}
    };

    var base=_app.name.replace(/.apk/gi, ''); //.replace(/.spk/gi, '');
    if(_app.name.endsWith(".spk")) {
	//_loadScripts("DroidScript", ["app.js"]);
	_loadDroidScript();
	_loadScripts(_app.name, [base+'/'+base+".js"]);
    }
    else if(_app.name.endsWith(".apk")) {
	_loadScripts(_app.name, ["assets/app.js", "assets/user/"+base+".js"]);
    }
    else {
	_loadDroidScript();
	_loadScripts(_app.name, [fsp.join(_app.options.appsDir, base, base+".js")]);
    }
}

function _alert(msg) {
    _remote.__ret(function(msg) { alert(msg); }, this, arguments);
}

function _prompt(promptMsg, dftVal) {
    return _remote.__ret(function(promptMsg,dftVal) {
	return prompt(promptMsg, dftVal);
    }, this, arguments);
}

function _loadDroidScript() {
    var apks=readdirFiber(".", null, true).filter( (file) => {
	return file.indexOf("DroidScript_") == 0 && file.endsWith(".apk");
    }); // Sorted, finds latest version of apk (if any)
    var apk=(apks.length > 0) ? apks[apks.length-1] : null;
    if(!apk && appName == "DroidScript") { throw Error("Missing DroidScript_*.apk in "+process.cwd()); }
    else { console.log("Using "+apk+" in "+process.cwd()); }
    _loadScripts(fsp.join(_app.dirname, apk), ["assets/app.js"]);
}

/***************************************************************************************************/
/////////////////////////////////////////////////////////////////////////////////////////////////////


/***************************************************************************************************/
//////////////////////////////////////// Utility Functions //////////////////////////////////////////
/***************************************************************************************************/

function _loadScripts(appName, scriptNames) {
    var scrInfos=readScripts(appName, scriptNames);
    for(var xa=0; xa<scrInfos.length; xa++) {
	var scrInfo=scrInfos[xa];
	if(scrInfo.script === null) {
	    throw new Error("Missing "+scrInfo.scriptName);
	}
	var script=new vm.Script(scrInfo.script, {filename:scrInfo.scriptName});
	script.runInContext(_app.context);
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
_DroidScript_Bridge();

/////////////////////////////////////////////////////////////////////////////////////////////////////

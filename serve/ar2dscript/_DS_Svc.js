/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Svc emulation **/

/////////////////////////////////////////////////////////////////////////////////
function _DS_Svc(packageName, classname, options, callback) {
    // packageName e.g. "this"
    // classname e.g. "this"
    this.packageName=packageName;
    this.classname=classname;
    this.onServiceReady=eval(callback);
    this.options=options;
    _newId(this,"Svc");
	
    var sName=getServicePath();
	if (runningSvc(sName)) {
		return;
	}
    this.sProc = cp.fork('serve/com.iglooware.ar2dscript.runservice.js');

    this.sProc.on('message', (msg) => {
		_app.Fiber(function() { // Callbacks need a new fiber
			//console.log('PARENT got message:', msg);
			if(msg._serviceReady) { this.onServiceReady(); }
			else if(msg._serviceLog) {
				process.stdout.write(colorsafe.gray(msg._serviceLog));
			}
			else if (msg.msg && msg.msg._serviceForward) {
				var s=msg.msg._serviceForward;
				this.sProc.send({_serviceReply:prompt(s.promptMsg, s.dftVal)}); // Send reply to child (service)
				//console.log("Service _send:"+s.fn+JSON.stringify(s.args));
				//_send(s.fn, s.args, _app);
			}
			else { this.onMessage(msg.msg); }
		}.bind(this)).run();
    });

    this.sProc.send({start: sName});

    _app.services.push(this);
}

function pidofService(sName) {
	var pName=fsp.join(os.tmpdir(), 'SERVICE-'+sName.replace(/\//g,'_')+'.pid');
	console.log("pName="+pName);
	try { return readFileFiber(pName); }
	catch(e) { console.log("pidofService: "+e.message); return ""; }
}

function runningSvc(sName) {
    var sPid=pidofService(sName);
    console.log("Is running? "+sPid);
    var ret=exec('ps aux');
    if(ret.err) {
	if(ret.err.error) { throw ret.err.error; }
	if(ret.err.stderr != '') { throw new Error('ERROR: '+ret.err.stderr); }
}
    var data=columnParser(ret.data);
    for(var xa=0; xa<data.length; xa++) {
	// USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
	var r=data[xa];
	if (r['PID'] == sPid) { console.log("RUNNING"); return true; }
	//else { console.log("PID="+r['PID']+';sPid='+sPid); }
    }
    return false;
}

function _DS_Svc_SendMsg(msg) {
    if(this.sProc) { this.sProc.send({msg: msg}); }
}

function _DS_Svc_Stop() {
    if(this.sProc) {
	this.sProc.kill();
	setTimeout(function() { this.sProc.kill('SIGKILL'); /*this.sProc=null;*/ }.bind(this), 2000);
    }
}

function _DS_Svc_SetOnMessage(callback) {
    this.onMessage=eval(callback);
}

function getServicePath() {
     var tmp=os.tmpdir();
    if(_app.path.endsWith(".spk")) {
	return fsp.join(tmp, _app.path.replace(/\//g,"_")+"#"+_app.name+"_Service.js");
    }
    else if(_app.path.endsWith(".apk")) {
	return fsp.join(tmp, _app.path.replace(/\//g,"_")+"#assets_user_Service.js");
    }
     return fsp.join(fsp.dirname(_app.path), "Service.js");
}
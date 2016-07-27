/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Lay emulation **/

/////////////////////////////////////////////////////////////////////////////////
function _DS_Svc(packageName, classname, options, callback) {
    // packageName e.g. "this"
    // classname e.g. "this"
    this.packageName=packageName;
    this.classname=classname;
    this.onServiceReady=eval(callback);
    this.options=options;
    _newId(this);
    

    var sName=getServicePath();
    const sProc = cp.fork('serve/runservice.js');

    sProc.on('message', (msg) => {
		_app.Fiber(function() { // Callbacks need a new fiber
			//console.log('PARENT got message:', msg);
			if(msg._serviceReady) { this.onServiceReady(); }
			else if(msg._serviceLog) {
				process.stdout.write(colors.gray(msg._serviceLog));
			}
			else { this.onMessage(msg); }
		}.bind(this)).run();
    });

    sProc.send({start: sName});

    _app.services.push(this);
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
/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

const _debugRPC=true;

var _objects=[];
_objects[1]={id:1, cls:'App', children:[], visible:true}; // Application object
var _nextObjId_=2; // Must start at >0

var navigator={
    _VERSION:_VERSION,
    userAgent:"Android Emulation for Linux"
};


function prompt(promptMsg, dftVal) {
    if(!promptMsg) { console.log("prompt=null,dftVal=",dftVal); return; }
    var h1=promptMsg[0] == '#';
    var h2=(parseInt(promptMsg) || promptMsg[0] == '0');
    // MOST SPECIFIC MATCH: dftVal.match(/^[A-Z][a-z]*\.[A-Z][A-Za-z]*\(/))); // BUT '(' was not in ScrollTo or ScrollBy
    var actualPrompt=(!h1 && !(h2 && dftVal.match(/^[A-Z][a-z]*\.[A-Z][A-Za-z]*/)));
    //console.log("inService="+inService+";actualPrompt="+actualPrompt+";runLocal="+runLocal(dftVal)+";h1="+h1+";h2="+h2+";match="+dftVal.match(/^[A-Z][a-z]*\.[A-Z][A-Za-z]*\(/)+";promptMsg="+promptMsg+";dftVal="+dftVal);
    if((inService || inApp) && (actualPrompt || !runLocal(dftVal, inApp))) {
	    if(process.send) { return rmtPrompt(promptMsg, dftVal); }
	    else { throw new Error("Disconnected service"); }
    }
    if(actualPrompt) { // e.g. App.CreateLayout(
	    //console.log("promptMsg="+util.inspect(promptMsg)+";dftVal="+dftVal);
	    return _prompt(promptMsg, dftVal); 	
    }
    var id=promptMsg[0]=='#' ? promptMsg.substr(1) : promptMsg;
    if(id == '') { id=1; }
    var args=dftVal.split('\f');
    //console.log("id="+id+";args="+JSON.stringify(args));
    var a0=args[0];
    var xa=a0.indexOf('(');
    var fn=null;
    const _main="_Main_";
    var cls=_main;
    if(xa > -1) {
	fn=a0.substr(0, xa);
	if(xa < a0.length-1) { args[0]=a0.substr(xa+1); }
	else { args.shift(); }
    }
    else { fn=a0; args.shift(); }
    var ofn=fn;
    xa=fn.indexOf('.');
    var clsBase=_main;
    if(xa > -1) { clsBase=fn.substr(0,xa); cls="_DS_"+clsBase; fn=fn.substr(xa+1); }
    _load(cls);
    for(xa=0; xa<args.length; xa++) {
	if(typeof args[xa] === 'string') {
	    if(args[xa] === "null" || args[xa] === "undefined") { args[xa]=null; }
	    if(args[xa] === "false" || args[xa] === "true") { args[xa]=eval(args[xa]); }
	}
    }
    fn=cls+"_"+fn;
    var f=eval(fn);
    var obj=_objects[id];
    if(!obj) { obj={cls:clsBase,id:id}; }
    if(ofn != "_Init") { log(colorsafe.blue(ofn+" "+JSON.stringify(args))); }
    var ret=f.apply(obj, args); // Passes new object to called function
    if(ret) {
	var r=(typeof ret === 'number') ? '#'+ret : JSON.stringify(ret);
	    const maxLen=80;
	    if(r.length > maxLen) { r=r.substr(0,maxLen)+"..."; }
	log(colorsafe.blue("-> "+r)); 
    }
    return ret;
}

function rmtPrompt(promptMsg, dftVal) {
	if (!_app.Fiber.current) {
		throw new Error("No fiber in service:"+promptMsg+",dftVal="+dftVal);
	}
	_serviceFiber.fiber=_app.Fiber.current;
	var msg={promptMsg:promptMsg, dftVal:dftVal};
	console.log("rmtPrompt: ",msg);
	process.send({msg: {_serviceForward: msg}}); // Child (service) send to parent
	var ret=_app.Fiber.yield(); // Await reply from parent
	if(ret.err) { throw ret.err; }
	return ret.data;
}

function _prompt(promptMsg, dftVal) {
    return _send('prompt', [promptMsg, dftVal], _app, true); // true=awaitReturn
}

function alert(msg) {
    _send('alert', [msg], _app, true); // true=awaitReturn
}

// FOR SERVICES: Returns true if this function (e.g. SetAlarm) must run in the service,
// not in the app that spawned it
// FOR APPS: Returns true unless this function must run in the parent that spawned it.
function runLocal(dftVal, inApp) {
    var args=dftVal.split('\f');
    var a0=args[0].split('(')[0];
    //console.log("runLocal: a0="+a0);
    if(!inApp) switch(a0) {
	case "App.SetAlarm": {
	    var options=(args.length >= 7 && args[6]) ? args[6].toLowerCase() : "";
	    if(options.indexOf("app") > -1) { return false; } // Handle in App, not Service
	    return true;
	}
	case "App.SendMessage": return true;
	default: return false;
    }
    else switch(a0) {
	//case "App.AddLayout": return false;
	default: return true;
	//case "Btn.SetOnClick": return true;
	//default: return false; //true;
    }
    return false;
}

function exec(cmd) {
	return _exec(cmd, _app);
}

function _load(cls, context) {
    if(!context) { context=_app.context; }
    if(eval("typeof "+cls) === 'undefined') {
	//console.log("cls="+cls+";context="+context);
	loadScripts(".", ['./ar2dscript/'+cls+'.js'], context, true); // true=awaitReturn
    }
}

function _newId(obj, cls) {
    obj.id=_nextObjId_++; // Allocate a new id
    obj.cls=cls;
    obj.visible=false;
    obj.attrs={};
    obj.css={background:'#000000', color:'#808080'}; //, 'font-family':'Verdana,sans-serif'}; // Default font set in body.css
    obj.children=[];
    obj.parent=null;
    _objects[obj.id]=obj;
    return obj.id;
}

function _set(attrs) { // NOTE: attrs may contain only a partial set of attributes of "this" (or some other object)
    var visibleSet=false;
    if(attrs.visible || (attrs.child && attrs.child.visible)) { visibleSet=true; }
    //console.log("attrs=",attrs,";visibleSet="+visibleSet);
//     if(this.visible && attrs.children && !attrs.id) { // Updated children: Send them all
// 	if(attrs.child) { _sendDescendants(attrs.child); }
// 	//_sendDescendants(attrs);
// 	_send('upd', [attrs], _app, _debugRPC); // send attrs (adding id attribute)
//     }
    if(_allVisible(this)) { // If this and all parents are visible:
	//console.log("visibleSet="+visibleSet);
	if(visibleSet) { // And we JUST were set visible
	    _sendDescendants(this); // Send all visible children
// 	    var obj=_partialCopy(this);
// 	    try { _send('crt', [obj], _app, _debugRPC); }
// 	    catch(e) { console.log(colorsafe.red("ERROR: "+e.stack+"; this="+util.inspect(obj))); }
	}
	else { attrs.id=this.id; _send('upd', [attrs], _app, _debugRPC); } // send attrs (adding id attribute)
    } 
    else if(attrs.visible===false) {
	attrs.id=this.id; _send('upd', [attrs], _app, _debugRPC); // send attrs (adding id attribute)
    }
}

function _sendDescendants(obj) {
    if(!obj) { return; }
    //console.log("SENDING CHILD: "+obj.id);
    var chs=obj.children;
    for(var xa=0; xa<chs.length; xa++) {
	//console.log("obj["+_objects[xa].id+"]="+_objects[xa].id]);
	_sendDescendants(_objects[chs[xa].id]);
    }
    var child=_partialCopy(obj);
    if(child.visible) {
	try { _send('crt', [child], _app, true); }
	catch(e) { console.log(colorsafe.red("ERROR: "+e.stack+"; this="+util.inspect(child))); }
    }
}


// function _sendDescendants(obj) {
//     console.log("SENDING CHILD: "+obj.id);
//     var chs=obj.children;
//     for(var xa=0; xa<chs.length; xa++) {
// 	var child=_partialCopy(_objects[chs[xa].id]);
// 	_sendDescendants(child);
// 	if(child.visible) {
//  	    try { _send('crt', [child], _app, true); }
//  	    catch(e) { console.log(colorsafe.red("ERROR: "+e.stack+"; this="+util.inspect(child))); }
// 	}
//     }
// }

function _partialCopy(obj) {
    if(obj.extra) { console.log("EXTRA: ",obj.extra); }
    return {cls:obj.cls, id:obj.id, visible:obj.visible, attrs:obj.attrs, css:obj.css, children:obj.children, parent:obj.parent, extra:obj.extra};
}

function _allVisible(obj) {
    var av=true;
    for(var xa=0; xa<10; xa++) { // Limit levels to traverse
	if(!obj || !obj.visible) { av=false; break; }
	if(obj.cls == "App" || obj.cls == "Dlg") { break; }
	if(!obj.parent) { throw Error("NO PARENT YET: cls="+obj.cls+"; visible="+obj.visible); }
	obj=_objects[obj.parent.id];
    }
    //console.log("allVisible="+av+" cls="+obj.cls+" id="+obj.id);
    return av;
}

// Return decimal RGB+Alpha representation from hex Alpha+RGB
function _RGBA(hexARGB) {
    if(!hexARGB) { return 'black'; }
    if(hexARGB[0] !== '#' || hexARGB.length < 9) { return hexARGB; }
    var A=(parseInt(hexARGB.substring(1,3),16)/255).toFixed(2);
    return 'rgba('+parseInt(hexARGB.substring(3,5),16)+','+
	parseInt(hexARGB.substring(5,7),16)+','+
	parseInt(hexARGB.substring(7,9),16)+','+A+')';
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
    opts.hAlign=_plo(opt,'center');
    opts.hAlign=_plo(opt,'right',opts.hAlign);
    opts.hAlign=_plo(opt,'left',opts.hAlign);

    // Vertical alignment
    opts.vAlign=_plo(opt,'top');
    opts.vAlign=_plo(opt,'vcenter',opts.vAlign,'center');
    opts.vAlign=_plo(opt,'bottom',opts.vAlign);

    // Horizontal and vertical fill
    opts.fillx=opts.filly=_plo(opt,'fillxy',false,true);
    opts.fillx=_plo(opt,'fillx',opts.fillx,true);
    opts.filly=_plo(opt,'filly',opts.filly,true);

    // Direction
    opts.direction=_plo(opt,'vertical','horizontal');
    opts.direction=_plo(opt,'horizontal');

    return opts;
}

function _plo(opt,val,dftVal,setVal) {
    if(typeof dftVal === 'undefined' || dftVal === null) { dftVal=val; }
    if(typeof setVal === 'undefined' || setVal === null) { setVal=val; }
    if(opt.indexOf(","+val+",") > -1 || opt.indexOf(val+",") == 0 || opt.indexOf(","+val) == opt.length-val.length-1 || opt == val) { return setVal; }
    return dftVal;
}

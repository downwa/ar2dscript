var cheerio = require('cheerio');
var vm = require('vm');
var util = require('util');

function runApp(app, session, connection) {
    log("RUN "+app.name+"; session="+session+"; connection="+connection+"; VERSION="+VERSION);
    
    
    Fiber(function() {
	function pr() {
	        console.log("APPTEST3");
	        console.log("APPTEST3: a="+a);
	}
	
	
	var sandbox={console:console, process:process, navigator:navigator, prompt:function() {
	        console.log("APPTEST5");
	        console.log("APPTEST5: a="+a);
	}, a:42};
	var ctx = new vm.createContext(sandbox);
	//loadScripts(".", ["test.js"], ctx, true);
	//loadScripts(".", ["apptest.js"], ctx, true);
	
 	vm.runInContext("console.log('TEST'); console.log('TEST: a='+a);prompt();", ctx, {filename:"TEST"});
    }).run();



    
    
    
    // NOTE: Only one connection per session is supported.  Send message to previous connected tab/window
    // NOTE: to grey out so it appears inactive (as it is), and ask the client to disconnect.
    if(connection) {
	//var oldConn=_conns[app.name];
	//if(oldConn != connection) { _send('dim', null, false, oldConn); }
	if(app.connection && app.connection != connection) { _send('dim', null, false, app.connection); }
        app.connection=connection; // Save new connection
        //_conns[app.name]=connection;
    }
    var sandbox={_objects:_objects, _nextObjId_:_nextObjId_, _app:g_app, _sendq:null, navigator:navigator, prompt:prompt, a:42};
    app.context = new vm.createContext(sandbox);
    console.log("CONTEXT: "+util.inspect(app.context)+"\n***");
    loadScripts(ds, ["assets/app.js"], app.context, false)
    loadScripts(app.name, [app.name+'.js'], app.context, false)
    log("Calling OnStart()");
    vm.runInContext('OnStart()',app.context,{displayErrors:true});

}

var g_app={test:'me'};

var _mid=0;
var _objects=[];
_objects[1]={id:1, cls:'App', layouts:[]} // Application object
var _nextObjId_=2; // Must start at >0

var navigator={
    _VERSION: VERSION,
    userAgent: "Android Emulation for Linux"
};

function _newId(obj) {
    obj.id=_nextObjId_++; // Allocate a new id
    _objects[obj.id]=obj;
    return obj.id;
}

function _load(cls) {
    if(eval("typeof "+cls) === 'undefined') {
	loadScripts(".", ['./ar2dscript/'+cls+'.js'], null, true);
    }
}

function _send(fn, args, awaitReturn, connection) {
    var cb=null;
    if(awaitReturn) {
        var fiber=_app.Fiber.current;
        cb=function(err, data) { fiber.run({err:err, data:data}); }
    }
    var msg={mid:_mid++, fn:fn, args:args, cb:cb};
    if(!connection && _app) { connection=_app.connection; }
    if(connection) { 
	log("SND "+msg.mid+" "+fn);
	//console.log("MSG: "+util.inspect(msg));
	if(_app) { _app.sent=msg; }
	connection.sendUTF(JSON.stringify(msg)); }
    else { _sendq=msg; log("QUE "+msg.mid+" "+fn); }
    if(awaitReturn) { 
        var ret=_app.Fiber.yield();
        //console.log("RETURN FROM YIELD: "+JSON.stringify(ret));
        if(ret.err) { throw err; }
        return ret.data;
    }
}

// function _initApp() {
//     var stk=new Error().stack.split('\n');
//     var an=null;
//     for(var xa=0; xa<stk.length; xa++) {
//         s=stk[xa];
// 	//console.log("s="+s);
//         if(s.indexOf('/ar2dscript/serve/') > -1) { continue; }
//         if(s.indexOf('/DroidScript_') > -1 && s.indexOf('.apk:assets/app.js') > -1) { continue; }
//         if(s.indexOf('at OnStart (') > -1) {
//             //console.log("stk="+s);
//             an=s.replace(/.js:.*/,"").replace(/.*\//,"");
//             var xb=an.indexOf('.apk');
//             if(xb > -1) {
//                 an=an.substr(0,xb);
//                 xb=an.lastIndexOf('_');
//                 if(xb > -1) { an=an.substr(0,xb); }
//             }
//             //console.log("an="+an);
//             break;
//         }
//     }
//     if(!an) { return; }
//     _app=_apps[an];
//     if(!_app) { throw new Error("Initialization failed: app not found in cache"); }
//     _appName=an;
//     
//     // Initialize application DOM
//     $ = cheerio.load("<html><head><title>"+_app.name+"</title><div id='headhide' style='display:none'></div></head><body id='body'></body></html>");
//     // $.root().toArray()[0].children[0].children.length
//     // var save=$('body').clone();
//     // $.text()
//     // $.html()
//     // $('#one').each(function(index, elem) { console.log(this.html()); });
//     // $('head').html("<title>Test</title>")
//     // $('body').attr('style','width:100vw')
//     // $('body').attr()
//     // $('body').attr('style')
// 
//     var body=$('body');
//     console.log("TEST app="+_app.name+";body.id="+body.attr('id')+";htm="+body.html());
// }

//     - id TO ADD TO (of top level BODY tag in this case), 
//     - id OF OBJECT TO ADD (layout in this case)
//     
//     and sends that id, and current snippet of HTML from htmlObj for that object, 
//     to the browser
function _rmtAdd(obj, html) {
    var tgtId=obj.htmlObj.attr('id');
    _send('add', [tgtId, html]);
}

function _rmtSet(obj, html) {
    var tgtId=obj.htmlObj.attr('id');
    _send('set', [tgtId, html]);
}

function _rmtDel(obj) {
    var tgtId=obj.htmlObj.attr('id');    
    _send('del', [tgtId]);
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
    console.log("_createNode: "+id+";root="+$.root().html()+";htm="+$.html('#'+id)+"***");
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

function prompt(promptMsg, dftVal) {
    console.log("APPTEST2");
    console.log("APPTEST2: a="+a);
//if(!_app) { _initApp(); }
    //console.log("promptMsg="+promptMsg+";dftVal="+dftVal+";stack="+new Error().stack);
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
	xa=fn.indexOf('.');
	var clsBase=_main;
	if(xa > -1) { clsBase=fn.substr(0,xa); cls="_DS_"+clsBase; fn=fn.substr(xa+1); }
//console.log("promptMsg="+promptMsg+";dftVal="+dftVal+";fn="+fn);
	//var module=null;
	_load(cls);
	//module=eval(cls)(_app);
	for(xa=0; xa<args.length; xa++) {
	    if(typeof args[xa] === 'string') {
		if(args[xa] === "null" || args[xa] === "undefined") { args[xa]=null; }
	    }
	}
	fn=cls+"_"+fn;
	var f=eval(fn);
// 	try { 
	    //console.log("CALL "+fn);
	    var obj=/*global.*/_objects[id];
	    //ck(id);
	    if(!obj) { obj={cls:clsBase,id:id}; }
	    console.log("CALL "+clsBase+"."+fn+" "+JSON.stringify(args));
	    var ret=f.apply(obj, args); // Passes new object to called function
	    //console.log("RET OBJ="+JSON.stringify(obj));
	    return ret;
// 	}
// 	catch(e) {
// 	    throw new Error("ERROR executing: "+fn+JSON.stringify(args)+"; id="+id+"; cls="+cls+"; e="+e.stack);
// 	}
    }
    else { 
	console.log("promptMsg="+util.inspect(promptMsg)+";dftVal="+dftVal);
	return _prompt(promptMsg, dftVal); 	
    }
}

var cheerio = require('cheerio');
var vm = require('vm');
var util = require('util');

function runApp(app, session, connection) {
    log("RUN "+app.name+"; session="+session+"; connection="+connection+"; VERSION="+VERSION);
    
    // NOTE: Only one connection per session is supported.  Send message to previous connected tab/window
    // NOTE: to grey out so it appears inactive (as it is), and ask the client to disconnect.
    if(connection) {
	if(app.connection && app.connection != connection) {
	    //app.connection.close(); 
	    var objStr=JSON.stringify({fname:'dim', fn:'', obj:'', arguments:[]});
	    log("SND "+objStr);
	    app.connection.sendUTF(objStr);
	    
	    app.connection=connection; // Save new connection
	}
    }
    
    // Initialize application DOM
    $ = cheerio.load("<html><head><title>"+app.name+"</title><div id='headhide' style='display:none'></div></head><body></body></html>");
    // $.root().toArray()[0].children[0].children.length
    // var save=$('body').clone();
    // $.text()
    // $.html()
    // $('#one').each(function(index, elem) { console.log(this.html()); });
    // $('head').html("<title>Test</title>")
    // $('body').attr('style','width:100vw')
    // $('body').attr()
    // $('body').attr('style')

 
    
    
    
//     var sandbox={require:require, console:new appConsole(app.name), 
// 	setTimeout: setTimeoutFiber, _app: sa,
// 	setInterval: setIntervalFiber,
// 	readdirFiber: readdirFiber,
// 	readScripts: readScripts,
// 	navigator: navigator
//     };
//     sa.sleep = sleep;
//     sa.VERSION=VERSION;
//     //sa.connections={};
//     //sa.setTimeout=setTimeout;
//     sa.Fiber=Fiber;
//     sa.dirname=__dirname;
//     sa._objects=[];
    var sandbox={_objects:_objects, _nextObjId_:_nextObjId_, navigator:navigator, prompt:prompt};
    app.context = new vm.createContext(sandbox);	
    loadScripts(ds, ["assets/app.js"], app.context, false)
    loadScripts(app.name, [app.name+'.js'], app.context, false)
    log("Calling OnStart()");
    vm.runInContext('OnStart()',app.context,{displayErrors:true});

//     vm.runInContext(
//     try { sa.ds=new vm.Script(fs.readFileSync('ar2dscript.js')); }
//     catch(e) {
// 	log(e.stack);
// 	throw e;
//     }
//     var base=sa.name.replace(/.spk/gi, '');
//     var scrInfos=readScripts(app.name, [base+"/"+base+".js"]);
//     log("fn="+scrInfos[0].scriptName+"***");
//     sa.script=new vm.Script(scrInfos[0].script, {filename:scrInfos[0].scriptName});
//     //sa.script=new vm.Script(fs.readFileSync(fPath),{filename:fPath});
//     try {
// 	sa.ds.runInContext(sa.context,{filename:'ar2dscript.js'});
// 	sa.script.runInContext(sa.context,{filename:'ar2dscript.js'});
//         //log("Calling OnStart()");
// 	vm.runInContext('OnStart()',sa.context,{displayErrors:true});
//     }
//     catch(e) {
// 	if(className(e) != "ReferenceError" || e.message != 'OnStart is not defined') {
// 	    sa.error=e; log(e.stack);
// 	}
//     }
    
    
    
}

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
//    console.log("_newId obj id="+obj.id); //JSON.stringify(obj));
    return obj.id;
}

// function ck(id,pfx) {
//     var obj=_objects[id];
//     if(obj) { console.log(pfx+" CHECK obj id="+id+";obj.id="+obj.id); }
//     else {  console.log(pfx+" CHECK obj id="+id+";obj NULL"); }
//     for(var xa=1; xa<5; xa++) {
// 	obj=_objects[xa];
// 	if(!obj) { continue; }
// 	console.log(pfx+"   CHK obj id="+xa+";obj.id="+obj.id);
//     }
// }

function _load(cls) {
    if(eval("typeof "+cls) === 'undefined') {
	loadScripts(".", ['./ar2dscript/'+cls+'.js'], null, true);
// 	    try { eval(cls+"=require('./ar2dscript/"+cls+".js')"); }
// 	    catch(e) { throw new Error("ERROR loading "+cls+"."+fn+": "+e.message); return; }
    }
}

function prompt(promptMsg, dftVal) {
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
	if(id == '') { id=1; }
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
//console.log("promptMsg="+promptMsg+";dftVal="+dftVal+";fn="+fn);
	//var module=null;
	_load(cls);
	//module=eval(cls)(_app);
	for(xa=0; xa<args.length; xa++) {
	    if(typeof args[xa] === 'string') {
		if(args[xa] === "null" || args[xa] === "undefined") { args[xa]=null; }
	    }
	}
	var f=eval(fn);
	if(!f) {
	    throw new Error("UNDEFINED "+fn+JSON.stringify(args)+"; id="+id+"; cls="+cls);
	    return;
	}
	try { 
	    //console.log("CALL "+fn);
	    var obj=/*global.*/_objects[id];
	    //ck(id);
	    if(!obj) { obj={cls:clsBase,id:id}; }
	    console.log("CALL "+clsBase+"."+fn+" "+JSON.stringify(args));
	    var ret=f.apply(obj, args); // Passes new object to called function
	    //console.log("RET OBJ="+JSON.stringify(obj));
	    return ret;
	}
	catch(e) {
	    throw new Error("ERROR executing: "+fn+JSON.stringify(args)+"; id="+id+"; cls="+cls+"; e="+e.stack);
	}
    }
    else { 
	console.log("promptMsg="+util.inspect(promptMsg)+";dftVal="+dftVal);
	return _prompt(promptMsg, dftVal); 	
    }
}

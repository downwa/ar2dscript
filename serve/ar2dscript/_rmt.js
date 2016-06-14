/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

global._args=[];

var util=require('util');
// Call remote function on client, sending function body to client if not already done,
// waiting for and returning value from client (if skipReturn is not true)
function __ret(rmtFn, obj, inArgs, skipReturn) {
    if(inArgs === null) { throw new Error("__ret: inArgs not set"); }
//     console.log("typeof inArgs="+(typeof inArgs)+"; inspect="+util.inspect(inArgs));
    var sendArgs=Array.prototype.slice.call(inArgs); //.shift(); // Shallow copy and discard "this"
//     for(var xa=0; xa<sendArgs.length; xa++) {
// 	var obj=sendArgs[xa];
// 	if(obj.id && Object.keys(obj).length > 1) { obj={id:obj.id}; }
//     }
    var fname=(new Error()).stack.split('\n')[2+(skipReturn?1:0)].split('at ')[1];
    fname=fname.split(' (')[0].replace(' ','_').replace('.','_').replace("Object_",obj.cls+"_");
    var fn='';
    if(!global._app.fns[fname]) { fn=rmtFn.toString(); global._app.fns[fname]=true; } // Send function body if not yet done
    var cb=null;
    if(!skipReturn) {
	var fiber=global._app.Fiber.current;
	cb=function(err, data) { 
	    fiber.run({err:err, data:data}); 
	}
    }
    global._app.send({fn:fname, f:fn, obj:{id: obj.id}, arguments:sendArgs, cb:cb});
    if(!skipReturn) {
	var ret=global._app.Fiber.yield();
	if(ret.err) { throw err; }
	return ret.data;
    }
}
// Call remote function on client, not waiting for any return value
// FIXME: Implement option to wait for return e.g. exceptions (for debugging)
function __rmt(rmtFn, obj, inArgs) { 
    if(inArgs === null) { throw new Error("__rmt: inArgs not set"); }
    if(arguments.length < 3) { throw new Error("arguments.length="+arguments.length+"; args="+util.inspect(arguments)); }
    __ret(rmtFn, obj, inArgs, true);
}

var util = require("util");
function _obj(mod, inArgs) {
    // Retrieve name of calling function
    var at='    at ';
    var fname=(new Error()).stack.split('\n').filter( (el) => { 
	if(el.startsWith(at) && !el.startsWith(at+"_")) return el;
    })[0].split(at)[1].split(' ')[0].replace('.','_').replace('Object_','');;

    var args=global._args[fname]; // Check cache
    if(!args) {
	var astr = mod.exports(global._app)[fname].toString();
	args = astr.match (/^\s*function\s+(?:\w*\s*)?\((.*?)\)/);
	args = args ? (args[1] ? args[1].trim ().split (/\s*,\s*/) : []) : null;
	global._args[fname]=args;
    }
    
    // Build object to store arguments of calling function
    var obj={};
    for(var xa=0; xa<args.length; xa++) {
	var aname=args[xa];
	obj[aname] = inArgs[xa]; 
	
    }
    return obj;
}

module.exports = (_app) => { 
    global._app = _app;
    return {
	__ret: __ret,
	__rmt: __rmt,
	_obj: _obj
    };
}

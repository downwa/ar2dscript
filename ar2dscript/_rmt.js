/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

// Call remote function on client, sending function body to client if not already done,
// waiting for and returning value from client (if skipReturn is not true)
function _ret(rmtFn, obj, inArgs, skipReturn) {
    var sendArgs=Array.prototype.slice.call(inArgs); //.shift(); // Shallow copy and discard "this"
    var fname=(new Error()).stack.split('\n')[2+(skipReturn?1:0)].split('at ')[1];
    fname=fname.split(' (')[0].replace(' ','_').replace('.','_').replace("Object_",obj.cls+"_");
    var fn='';
    if(!global._app.fns[fname]) { fn=rmtFn.toString(); global._app.fns[fname]=true; } // Send function body if not yet done
    var cb=null;
    if(!skipReturn) {
	cb=function(err, data) { 
	    global._app.Fiber.current.run({err:err, data:data}); 
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
function _rmt(rmtFn, obj, inArgs) { _ret(rmtFn, obj, inArgs, true); }

module.exports = (_app) => { 
    global._app = _app;
    return {
	_ret: _ret,
	_rmt: _rmt
    };
}

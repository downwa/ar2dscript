/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Obj emulation **/

module.exports = (_app) => {
    global._app=_app;
    var _remote=require('./_rmt.js')(_app);
    global.__rmt = _remote.__rmt;
    global.__ret = _remote.__ret;
    global._obj = _remote._obj;
    return {
//////////////////////////////////////////////////////////
	SetSize: SetSize
//////////////////////////////////////////////////////////
    };
};

/////////////////////////////////////////////////////////////////////////////////

function SetSize(width, height) {
    var obj=global._obj(module, arguments);
    console.log("SetSize: "+JSON.stringify(obj));
}
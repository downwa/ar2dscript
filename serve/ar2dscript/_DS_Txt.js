/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Txt emulation **/

module.exports = (_app) => {
    global._app=_app;
    var _remote=require('./_rmt.js')(_app);
    global.__rmt = _remote.__rmt;
    global.__ret = _remote.__ret;
    global._obj = _remote._obj;
    return {
//////////////////////////////////////////////////////////
	SetTextSize: SetTextSize
//////////////////////////////////////////////////////////
    };
};

/////////////////////////////////////////////////////////////////////////////////

function SetTextSize(size,mode) {
    __rmt(function(size,mode) {
	if(parseInt(size) == size) { size += 'pt'; }
	this.htmlObj.style.fontSize=size;
    }, this, arguments);
}

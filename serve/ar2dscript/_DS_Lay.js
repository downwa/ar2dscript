/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Lay emulation **/

module.exports = (_app) => {
    global._app=_app;
    var _remote=require('./_rmt.js')(_app);
    global.__rmt = _remote.__rmt;
    global.__ret = _remote.__ret;
    global._obj = _remote._obj;
    return {
//////////////////////////////////////////////////////////
	AddChild: AddChild
//////////////////////////////////////////////////////////
    };
};

/////////////////////////////////////////////////////////////////////////////////

function AddChild(child, order) {
    child=_app._objects[child];
    console.log("Lay.AddChild this="+JSON.stringify(this)+"; child="+JSON.stringify(child));
    _SetParent(child, {id:this.id});
    // 0 = back, end of list=front (drawn last)
    if(order < 0) { order=-order; }
    if(!order || order > this.children.length) { order=this.children.length; }
    this.children.splice(order, 0, {id:child.id});
    var args=[{id:child.id}, order];
    // FIXME: child.id is null
    //console.log("\n#2 Lay.AddChild this="+JSON.stringify(this)+"; args="+JSON.stringify(args)+"; child.id="+child.id);
    __rmt(function(child, order) {
	if(!this) { throw new Error("NULL this"); }
	if(!child) { throw new Error("NULL child"); }
	if(order < 0) { order=-order; }
	if(!order || order > this.children.length) { order=this.children.length; }
	this.children.splice(order, 0, child);
	if(this.opts) {
	    console.log("\nOPTIONS: "+JSON.stringify(this.opts)+";id="+child.id);
	    var op=this.opts;
	    if(op.hAlign == 'center') {
	    }
	    if(op.vAlign == 'center') {
	    }
	    if(op.direction == 'vertical') {
		//console.log("class frameTC on "+child.id);
		//child.div.style.display='table';
		child.odiv=wrapObject(child, child.div);
	    }
	}
	var div=(child.odiv ? child.odiv : child.div);
	this.div.appendChild(div);
    }, this, args);
}

function _SetParent(obj, parent) {
    obj.parent={id:parent.id};
    __rmt(function(obj, parent) {
	alert('obj='+JSON.stringify(obj)+'; parent='+JSON.stringify(parent));
	obj.parent={id:parent.id};
    }, obj, [{id:obj.id}, {id:parent.id}]);
    
}

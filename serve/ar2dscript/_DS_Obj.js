/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Obj emulation **/

/////////////////////////////////////////////////////////////////////////////////

function _DS_Obj() {
	this.title=title;
	this.options=options;
	this.timer=null;
	
	this.backColor='#000000';
	this.textColor='#808080'; 
	var h=_createNode('DIV', _newId(this))
	h.css('background',this.backColor);
	h.css('color',this.textColor);
	this.htmlObj=h;
	this.visible=false;
}

function _DS_Obj_SetPadding(left,top,right,bottom,mode) {
	this.htmlObj.css('padding-left',  this.paddingLeft=(100*left));
	this.htmlObj.css('padding-top',   this.paddingTop=(100*top));
	this.htmlObj.css('padding-right', this.paddingRight=(100*right));
	this.htmlObj.css('padding-bottom',this.paddingBottom=(100*bottom));
	if(this.visible) _rmtSet(this, this.htmlObj.html());
}
function SetSize(width, height) {
    var obj=global._obj(module, arguments);
    console.log("SetSize: "+JSON.stringify(obj));
}
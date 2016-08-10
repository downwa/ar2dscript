/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Obj emulation **/

/////////////////////////////////////////////////////////////////////////////////

function _DS_Obj() {
    this.title=title;
    this.options=options;
    this.timer=null;

    var h=_createNode('DIV', _newId(this))
    h.css('background',this.backColor='#000000');
    h.css('color',this.textColor='#808080');
    this.htmlObj=h;
    this.visible=false;
}

function _DS_Obj_SetBackGradient(options, c1, c2, c3) {
    options=options.toLowerCase();
    var colors='';
    if(options.indexOf("linear") > -1) { colors="linear-gradient"; }
    else if(options.indexOf("radial") > -1) { colors="radial-gradient"; }
    if(c1) { colors += '('+RGBA(c1); }
    if(c2) { colors += ','+RGBA(c2); }
    if(c3) { colors += ','+RGBA(c3); }
    colors += ')';
    console.log("c1="+c1+",c2="+c2+",c3="+c3+",options="+options+',colors='+colors);
    this.htmlObj.css('background',this.backColor=colors);
    if(this.visible) { _rmtSet(this, this.htmlObj.html()); }
}

function RGBA(hexARGB) {
    var A=(parseInt(hexARGB.substring(1,3),16)/255).toFixed(2);
    return 'rgba('+parseInt(hexARGB.substring(3,5),16)+','+
	parseInt(hexARGB.substring(5,7),16)+','+
	parseInt(hexARGB.substring(7,9),16)+','+A+')';
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
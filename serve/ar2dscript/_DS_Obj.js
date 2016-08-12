/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Obj emulation **/

/////////////////////////////////////////////////////////////////////////////////

function _DS_Obj() {
    _newId(this);
    this.options=options;
    this.title=title;
    this.timer=null;
}

function _DS_Obj_SetBackGradient(options, c1, c2, c3) {
    options=options.toLowerCase();
    var colors='';
    if(options.indexOf("linear") > -1) { colors="linear-gradient"; }
    else if(options.indexOf("radial") > -1) { colors="radial-gradient"; }
    if(c1) { colors += '('+_RGBA(c1); }
    if(c2) { colors += ','+_RGBA(c2); }
    if(c3) { colors += ','+_RGBA(c3); }
    colors += ')';
    //console.log("c1="+c1+",c2="+c2+",c3="+c3+",options="+options+',colors='+colors);
    this.css.background=colors;
}

function _DS_Obj_SetBackground(color) {
    _set.call(this, {css:{'background':this.css.background=_RGBA(color)}});
}

function _DS_Obj_SetTextSize(size,mode) {
    _set.call(this, {css:{'font-size':this.css['font-size']=size+'pt'}});
}

function _DS_Obj_SetText(text) {
    _set.call(this, {attrs:{text:this.attrs.text=text}});
}

function _DS_Obj_SetTextColor(color) {
    _set.call(this, {css:{color:this.css.color=_RGBA(color)}});
}


function _DS_Obj_SetPadding(left,top,right,bottom,mode) {
    _set.call(this, {css:{
	'padding-left':   this.css['padding-left']=(100*left)+'vw',
	'padding-top':    this.css['padding-top']=(100*top)+'vh',
	'padding-right':  this.css['padding-right']=(100*right)+'vw',
	'padding-bottom': this.css['padding-bottom']=(100*bottom)+'vh'
    }});
}

// function SetSize(width, height) {
//     var obj=global._obj(module, arguments);
//     console.log("SetSize: "+JSON.stringify(obj));
// }
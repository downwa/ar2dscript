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

function _DS_Obj_SetSize(width, height) {
    if(width) { this.width=width; }
    if(height) { this.height=height; }
//     if (this.parent) {
// 	var cls=this.parent.cls;
// 	if(cls == 'App' || cls=='Scr') { this.hUnit="vw"; this.vUnit="vh"; }
//     }
//     else { this.hUnit=this.vUnit="%"; }
//    if(this.parent && this.parent.cls === "Lay") { this.hUnit=this.vUnit="%"; }
//     if(this.cls === "Lay") { this.hUnit=this.vUnit="%"; }
//     else { this.hUnit="vw"; this.vUnit="vh"; }
    // If this is a Scroller or parent is App
//     if ((this.parent && this.parent.cls == "xApp") || this.cls == "Scrx") { this.hUnit="vw"; this.vUnit="vh"; }
//     else { this.hUnit=this.vUnit="%"; }
    this.hUnit="vw"; this.vUnit="vh";
    if(this.width) { this.css.width=(this.width*100)+this.hUnit; }
    if(this.height) { this.css.height=(this.height*100)+this.vUnit; }
    if(width && height) {
	_set.call(this, {css:{width:this.css.width, height:this.css.height}});
    }
    else if(width) { _set.call(this, {css:{width:this.css.width}}); }
    else if(height) { _set.call(this, {css:{height:this.css.height}}); }
}

function _DS_Obj_AddChild(child, order) {
    child=_objects[child];
    child.parent={id:this.id};
    child.visible=true;
    // NOTE: redundant since we send children? //
    //_set.call(child, {visible:true});

    // 0 = back, end of list=front (drawn last)
    if(order < 0) { order=-order; }
    if(!order || order > this.children.length) { order=this.children.length; }
    this.children.splice(order, 0, {id:child.id});
    if(this.opts) {
	//console.log(" OPTIONS: "+util.inspect(this.opts)+";id="+child.id);
	var op=this.opts;
	if(op.hAlign == 'center') {
	}
	if(op.vAlign == 'center') {
	}
	if(op.direction == 'vertical') {
	    //console.log("class frameTC on "+child.id);
	    //child.div.style.display='table';
	    //child.odiv=wrapObject(child, child.div);
	}
    }
    _set.call(this, {children:this.children, child:child});
}

function _DS_Obj_RemoveChild(child) {
    child=_objects[child];
    child.parent={};
    child.visible=false;
    // NOTE: redundant since we send children? //
    //_set.call(child, {visible:false});
    var idx=-1;
    for(var xa=0; xa<this.children.length; xa++) {
		// , {id:child.id}
		if(this.children[xa].id === child.id) { idx=xa; break; }
    }
    this.children.splice(idx, 1);
    _set.call(this, {children:this.children});
}



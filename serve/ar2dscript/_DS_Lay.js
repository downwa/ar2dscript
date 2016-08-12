/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Lay emulation **/

/////////////////////////////////////////////////////////////////////////////////
function _DS_Lay(type, options) {
     _newId(this,"Lay");
    // type=Linear,Frame,Absolute
    // options=(Linear) Vertical|Horizontal,FillXY
    this.type=type;
    this.css={'display':'table-cell'};
    var opts=_parseLayoutOptions(this.options=options);
    
    if(opts.vAlign == "center") { this.css['vertical-align']='middle'; }
    else if(opts.vAlign == "bottom") { this.css['vertical-align']='bottom'; }
    else { this.css['vertical-align']='top'; }
    
    if(opts.hAlign == "center") { this.css['text-align']='center'; }
    else if(opts.hAlign == "right") { this.css['text-align']='right'; }
    else { this.css['text-align']='left'; }
    
    if(opts.fillx) { this.width=95; }
    if(opts.filly) { this.height=95; } // Slightly less to avoid scroll bars
    _DS_Lay_SetSize.call(this); // Already set
    //this.css.background='linear-gradient(black, rgba(64, 64, 64, 1))';
    this.css.background='rgba(0, 0, 0, 0)';
    this.css.color='grey';
    this.opts=opts;
}

function _DS_Lay_SetSize(width, height) {
    if(width) { this.width=width; }
    if(height) { this.height=height; }
    if (this.parent && this.parent.cls === "App") { this.hUnit="vw"; this.vUnit="vh"; }
    else { this.hUnit=this.vUnit="%"; }
    if(this.width) { this.css.width=this.width+this.hUnit; }
    if(this.height) { this.css.height=this.height+this.vUnit; }
    if(width && height) {
	_set.call(this, {css:{width:this.css.width, height:this.css.height}});
    }
    else if(width) { _set.call(this, {css:{width:this.css.width}}); }
    else if(height) { _set.call(this, {css:{height:this.css.height}}); }
}

function _DS_Lay_AddChild(child, order) {
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
    _set.call(this, {children:this.children});
}

function _DS_Lay_RemoveChild(child) {
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

/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Scr emulation **/

/////////////////////////////////////////////////////////////////////////////////
function _DS_Scr(width, height, options) {
     _newId(this,"Scr");
    // type=Linear,Frame,Absolute
    // options=(Linear) Vertical|Horizontal,FillXY
    this.type="linear";
    this.css={'display':'table-cell'};
    var opts=_parseLayoutOptions(this.options=options);
    
    if(opts.vAlign == "center") { this.css['vertical-align']='middle'; }
    else if(opts.vAlign == "bottom") { this.css['vertical-align']='bottom'; }
    else { this.css['vertical-align']='top'; }
    
    if(opts.hAlign == "center") { this.css['text-align']='center'; }
    else if(opts.hAlign == "right") { this.css['text-align']='right'; }
    else { this.css['text-align']='left'; }
    
    this.width=width; this.height=height;
    
  //  if(opts.fillx) { this.width=95; }
//    if(opts.filly) { this.height=95; } // Slightly less to avoid scroll bars
    
    
    this.height=height=7;    
    
    _DS_Scr_SetSize.call(this); // Already set
    this.css.background='rgba(0, 0, 0, 0)';
    this.css.color='grey';
    this.css.margin='auto'; // Center
    this.css.overflow='auto'; // Turn on scroll bars
    this.css['white-space']='nowrap'; // Force lines to full width
    this.opts=opts;
}

/**
 * 		// display:flex is needed in a wrapper div to force inner div to size minimum (otherwise, it will size maximum).  
 * 		// float:left/right could also do this but not with centering
                <div style="display:flex"><!-- Wrapper for scroller -->
                // margin: top right bottom left (use auto on left=right justify, auto on right=left justify, auto on both=center
                // overflow: auto (or scroll) turns on scroll bars overflow-x or overflow-y for only one scroll bar
                // white-space:nowrap forces lines to full width for scroller
                        <div id="5" style="margin: 0 0 0 auto; overflow: auto; white-space:nowrap; vertical-align: bottom; text-align: center; color: grey; height:10vh; background:green;"><!-- Scroller -->
                        
                        
                                <div id="6" style="vertical-align: top; text-align: left; width: 95%; height: 95%; color: grey; "><!-- layScroll -->
                                        <div id="7" style="background: rgba(0, 0, 0, 0);">Line #1 really long line to trigger horizontal scrolling</div>


 **/

function _DS_Scr_SetSize(width, height) {
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

function _DS_Scr_AddChild(child, order) {
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

function _DS_Scr_RemoveChild(child) {
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

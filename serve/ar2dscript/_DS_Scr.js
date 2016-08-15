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
    this.extra={scrollx:0, scrolly:0};
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
    
    
    //this.height=height=7;    
    
    _DS_Scr_SetSize.call(this); // Already set
    this.css.background='rgba(0, 0, 0, 0)';
    this.css.color='grey';
    this.css.margin='auto'; // Center
    this.css.overflow='auto'; // Turn on scroll bars
    this.css['white-space']='nowrap'; // Force lines to full width
    this.opts=opts;
}

/**
    // display:flex is needed in a wrapper div to force inner div to size minimum (otherwise, it will size maximum).  
    // float:left/right could also do this but not with centering
    <div style="display:flex"><!-- Wrapper for scroller -->
    // margin: top right bottom left (use auto on left=right justify, auto on right=left justify, auto on both=center
    // overflow: auto (or scroll) turns on scroll bars overflow-x or overflow-y for only one scroll bar
    // white-space:nowrap forces lines to full width for scroller
	    <div id="5" style="margin: 0 0 0 auto; overflow: auto; white-space:nowrap; vertical-align: bottom; text-align: center; color: grey; height:10vh; background:green;"><!-- Scroller -->
		    <div id="6" style="vertical-align: top; text-align: left; width: 95%; height: 95%; color: grey; "><!-- layScroll -->
			    <div id="7" style="background: rgba(0, 0, 0, 0);">Line #1 really long line to trigger horizontal scrolling</div>
**/

function _DS_Scr_SetSize(width, height) {
    _load("_DS_Obj");
    _DS_Obj_SetSize.call(this, width, height);
}

function _DS_Scr_AddChild(child, order) {
    _load("_DS_Obj");
    _DS_Obj_AddChild.call(this, child, order);
}

function _DS_Scr_RemoveChild(child) {
    _load("_DS_Obj");
    _DS_Obj_RemoveChild.call(this, child);
}

function _DS_Scr_ScrollTo(sx, sy) {
    _set.call(this, {extra:{scrollx:this.extra.scrollx=sx, scrolly:this.extra.scrolly=sy}});
    //_send('ScrollTo', [this.id,sx,sy], _app, _debugRPC); // true=awaitReturn
}
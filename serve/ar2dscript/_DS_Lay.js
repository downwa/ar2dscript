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
    

    if(opts.fillx || opts.filly) {
	console.log(colorsafe.red("options="+options+"; cls="+this.cls+"; opts="+JSON.stringify(opts)));
    }
    
    if(opts.fillx) { this.width=0.94; }
    if(opts.filly) { this.height=0.96; } // Slightly less to avoid scroll bars
    _DS_Lay_SetSize.call(this); // Already set
    //this.css.background='linear-gradient(black, rgba(64, 64, 64, 1))';
    this.css.background='rgba(0, 0, 0, 0)';
    this.css.color='grey';
    this.opts=opts;
}

function _DS_Lay_SetSize(width, height) {
    _load("_DS_Obj");
    _DS_Obj_SetSize.call(this, width, height);
}


function _DS_Lay_AddChild(child, order) {
    _load("_DS_Obj");
    _DS_Obj_AddChild.call(this, child, order);
}

function _DS_Lay_RemoveChild(child) {
    _load("_DS_Obj");
    _DS_Obj_RemoveChild.call(this, child);
}

/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Lay emulation **/

/////////////////////////////////////////////////////////////////////////////////
function _DS_Lay(type, options) {
    // type=Linear,Frame,Absolute
    // options=(Linear) Vertical|Horizontal,FillXY
    this.type=type;
    this.background="";
    this.backGradient={color1:'#000000',color2:'#000000',color3:'#000000', 
                x1:0,y1:0, x2:1,y2:1};
    this.children=[];
    this.padding=[0,0,0,0];
    this.options=options;
    var opts=_parseLayoutOptions(options);
    var h=_createNode('DIV', _newId(this,"Lay"))
    this.htmlObj=h;
    h.css('display','table-cell');
    
    if(opts.vAlign == "center") { h.css('vertical-align','middle'); }
    else if(opts.vAlign == "bottom") { h.css('vertical-align','bottom'); }
    else { h.css('vertical-align','top'); }
    
    if(opts.hAlign == "center") { h.css('text-align','center'); }
    else if(opts.hAlign == "right") { h.css('text-align','right'); }
    else { h.css('text-align','left'); }
    
    if(opts.fillx) { this.width=95; }
    if(opts.filly) { this.height=95; } // Slightly less to avoid scroll bars
	_DS_Lay_SetSize.call(this); // Already set
    //h.css('background','black');
	//h.css('background','linear-gradient(black, #444)');
	h.css('background','#0000');
    h.css('color','grey');
    $('#headhide').append(h); // Not in body, hide in head
    var lid='#'+this.htmlObj.attr('id');
    //console.log("LAYOUT id="+lid+";"+$.html(lid)+"***");
    this.opts=opts;
	this.visible=false;
}

function _DS_Lay_SetSize(width, height) {
	if(width) { this.width=width; }
	if(height) { this.height=height; }
	if (this.parent && this.parent.cls === "App") { this.hUnit="vw"; this.vUnit="vh"; }
	else { this.hUnit=this.vUnit="%"; }
    if(this.width) { this.htmlObj.css('width',this.width+this.hUnit); }
    if(this.height) { this.htmlObj.css('height',this.height+this.vUnit); }
}

function _DS_Lay_AddChild(child, order) {
    //console.log("Lay.AddChild child="+child+";order="+order);
    child=_objects[child];
    //console.log("Lay.AddChild this="+this.id+"; child="+child.id+";this.children="+this.children);
    child.parent={id:this.id};
	child.visible=true;
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
    //var div=(child.odiv ? child.odiv : child.div);
    this.htmlObj.append(child.htmlObj);
	if (this.visible) {
		var lid='#'+child.htmlObj.attr('id');
		_rmtAdd(this, $.html(lid));
	}
}

function _DS_Lay_RemoveChild(child) {
    //console.log("Lay.AddChild child="+child+";order="+order);
    child=_objects[child];
    //console.log("Lay.AddChild this="+this.id+"; child="+child.id+";this.children="+this.children);
    child.parent={};
	child.visible=false;
    var idx=-1;
    for(var xa=0; xa<this.children.length; xa++) {
		// , {id:child.id}
		if(this.children[xa].id === child.id) { idx=xa; break; }
    }
    this.children.splice(idx, 1);
    $('#headhide').append(child.htmlObj); // Remove from body, hide in head
	if(this.visible) { _rmtDel(child); }
}

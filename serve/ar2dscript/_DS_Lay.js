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
    var h=_createNode('DIV', _newId(this))
    if(opts.vAlign == "center") { h.css('class','center'); }
    if(opts.fillx) { h.css('width','95vw'); }
    if(opts.filly) { h.css('height','95vh'); } // Slightly less to avoid scroll bars
    h.css('background','black');
    h.css('color','grey');
    this.htmlObj=h;
    this.opts=opts;
    return this.id;
}

function AddChild(child, order) {
    //console.log("Lay.AddChild child="+child+";order="+order);
    child=_objects[child];
    //console.log("Lay.AddChild this="+this.id+"; child="+child.id+";this.children="+this.children);
    child.parent={id:this.id};
    // 0 = back, end of list=front (drawn last)
    if(order < 0) { order=-order; }
    if(!order || order > this.children.length) { order=this.children.length; }
    this.children.splice(order, 0, {id:child.id});
    if(this.opts) {
	console.log(" OPTIONS: "+util.inspect(this.opts)+";id="+child.id);
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
}

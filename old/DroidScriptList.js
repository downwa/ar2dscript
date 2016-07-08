/////////////// DroidScriptList /////////////////
function DroidScriptList(list, width, height, options) {
    this.className='new_DroidScriptList';
    this.objId=newObjId();
    this.list=list;
    this.width=width;
    this.height=height;
    this.options=options;
    this.backColor='#000000';
    this.textColor='#808080'; 
    _rmt.call(this, Array.from(arguments));
}
DroidScriptList.prototype.SetTextMargins=function(left,top,right,bottom) {
    this.margins={left:left, top:top, right:right, bottom:bottom};
    _rmt.call(this, Array.from(arguments));
}
DroidScriptList.prototype.SetPosition=function(left,top,width,height) {
    this.left=left;
    this.top=top;
    this.width=width;
    this.height=height;
    _rmt.call(this, Array.from(arguments));
}
DroidScriptList.prototype.SetTextColor=function(color) { 
    this.textColor=color; 
    _rmt.call(this, Array.from(arguments));
}
DroidScriptList.prototype.SetOnTouch=function(callback) {
    this.onTouch=callback;
    this.hasTouch=true;
    _rmt.call(this, Array.from(arguments));
}
DroidScriptList.prototype.SetOnLongTouch=function(callback) {
    this.onLongTouch=callback;
    this.hasLongTouch=true;
    _rmt.call(this, Array.from(arguments));
}


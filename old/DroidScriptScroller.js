///////////////// DroidScriptScroller ///////////////
function DroidScriptScroller(width,height) {
    this.className='new_DroidScriptScroller';
    this.objId=newObjId();
    this.children=[];
    this.width=width;
    this.height=height;
    _rmt.call(this, Array.from(arguments));
}
DroidScriptScroller.prototype.AddChild=function(control) {
    _SetParent(control, {objId:this.objId});
    this.children.push({objId:control.objId});
    _rmt.call(this, Array.from(arguments));
}


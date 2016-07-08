///////////////// DroidScriptSpinner ///////////////
function DroidScriptSpinner( list, width, height, options ) {
    this.className='new_DroidScriptSpinner';
    this.objId=newObjId();
    this.list=list;
    this.width=width;
    this.height=height;
    this.options=options;
    this.margins={left:0, top:0, right:0, bottom:0};
    this.onTouch=function() {};
    _rmt.call(this, Array.from(arguments));
}

DroidScriptSpinner.prototype.SetMargins=function(left, top, right, bottom) {
    this.margins={left:left, top:top, right:right, bottom:bottom};
    _rmt.call(this, Array.from(arguments));
}
DroidScriptSpinner.prototype.SetOnTouch=function(callback) {
    this.onTouch=callback;
    this.hasTouch=true;
    _rmt.call(this, Array.from(arguments));
}

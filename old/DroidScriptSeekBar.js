///////////////// DroidScriptSeekBar ///////////////
function DroidScriptSeekBar(width,height) {
    this.className='new_DroidScriptSeekBar';
    this.objId=newObjId();
    this.width=width;
    this.height=height;
    _rmt.call(this, Array.from(arguments));
}
DroidScriptSeekBar.prototype.SetRange=function(range) {
    this.range=range;
    _rmt.call(this, Array.from(arguments));
}
DroidScriptSeekBar.prototype.SetValue=function(value) {
    this.value=value;
    _rmt.call(this, Array.from(arguments));
}


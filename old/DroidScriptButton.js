/////////////// DroidScriptButton /////////////////
function DroidScriptButton(text, width, height) {
    this.className='new_DroidScriptButton';
    this.objId=newObjId();
    this.text=text;
    this.width=width;
    this.height=height;
    this.onTouch=function() {};
    _rmt.call(this, Array.from(arguments));
}
DroidScriptButton.prototype.SetMargins=function(left, top, right, bottom) {
    this.margins={left:left,top:top,right:right,bottom:bottom};
    _rmt.call(this, Array.from(arguments));
}
DroidScriptButton.prototype.SetOnTouch=function(callback) {
    this.onTouch=callback;
    this.hasTouch=true;
    _rmt.call(this, Array.from(arguments));
}
DroidScriptButton.prototype.GetWidth=function() {
    return _rmt.call(this, [], _app.Fiber.current);
}
DroidScriptButton.prototype.GetHeight=function() {
    return _rmt.call(this, [], _app.Fiber.current);
}
DroidScriptButton.prototype.SetTextSize=function(size,mode) {
    this.size=size;
    this.mode=mode;
    _rmt.call(this, Array.from(arguments));
}
DroidScriptButton.prototype.SetTextColor=function(color) { 
    this.textColor=color; 
    _rmt.call(this, Array.from(arguments));
}
DroidScriptButton.prototype.SetBackColor=function(color) {
    this.backColor=color; 
    _rmt.call(this, Array.from(arguments));
}


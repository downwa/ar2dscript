/////////////// DroidScriptText /////////////////
function DroidScriptText(text,width,height,options) {
    this.className='new_DroidScriptText';
    this.objId=newObjId();
    this.text=text;
    this.width=width;
    this.height=height;
    this.options=options;
    this.backColor='#000000';
    this.textColor='#808080'; 
    _rmt.call(this, Array.from(arguments));
}
DroidScriptText.prototype.SetPosition=function( left,top,width,height ) {
    this.left=left;
    this.top=top;
    this.width=width;
    this.height=height;
    _rmt.call(this, Array.from(arguments));
}
DroidScriptText.prototype.SetText=function(text) {
    this.text=text;
    _rmt.call(this, Array.from(arguments));
}
DroidScriptText.prototype.SetTextSize=function(size,mode) {
    this.size=size;
    this.mode=mode;
    _rmt.call(this, Array.from(arguments));
}
DroidScriptText.prototype.SetBackColor=function(color) {
    this.backColor=color; 
    _rmt.call(this, Array.from(arguments));
}
DroidScriptText.prototype.SetTextColor=function(color) { 
    this.textColor=color; 
    _rmt.call(this, Array.from(arguments));
}
// Shorten long text with "...", mode="Start","Middle","End" or "marq"
DroidScriptText.prototype.SetEllipsize=function(mode) {
   this.ellipsizeMode=mode;
    _rmt.call(this, Array.from(arguments));
}
DroidScriptText.prototype.SetTextShadow=function( radius, dx, dy, color) {
   this.textShadow={radius:radius,dx:dx,dy:dy,color:color};
    _rmt.call(this, Array.from(arguments));
}


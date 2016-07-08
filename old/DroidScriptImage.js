///////////////// DroidScriptImage ///////////////
function DroidScriptImage(file,width,height,options) {
    this.className='new_DroidScriptImage';
    this.objId=newObjId();
    this.color='#000000';
    this.left=0;
    this.top=0;
    this.file=file;
    this.width=width;
    this.height=height;
    this.options=options;
    this.onTouch=function() {};
    _rmt.call(this, Array.from(arguments));
}
DroidScriptImage.prototype.SetPosition=function(left, top, width, height) {
    this.left=left;
    this.top=top;
    this.width=width;
    this.height=height;
    _rmt.call(this, Array.from(arguments));
}
DroidScriptImage.prototype.SetColor=function(color) {
    this.color=color;
    _rmt.call(this, Array.from(arguments));
}
DroidScriptImage.prototype.SetOnTouch=function(callback) {
    this.onTouch=callback;
    this.hasTouch=true;
    _rmt.call(this, Array.from(arguments));
}


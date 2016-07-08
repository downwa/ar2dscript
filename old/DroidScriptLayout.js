/////////////// DroidScriptLayout /////////////////
// type=Linear,Frame,Absolute
function DroidScriptLayout(type, options) {
    this.className='new_DroidScriptLayout';
    this.objId=newObjId();
    this.type=type;
    this.background="";
    this.backGradient={color1:'#000000',color2:'#000000',color3:'#000000', 
                x1:0,y1:0, x2:1,y2:1};
    this.children=[];
    this.padding=[0,0,0,0];
    this.options=options;
    //this.width=640;
    //this.height=480;
    _rmt.call(this, Array.from(arguments));
};

// options=repeat
DroidScriptLayout.prototype.SetBackground=function(path, options) {
    options=options.toLowerCase();
    this.background=path;
    this.options=options;
    this.backgroundRepeat = (options.indexOf('repeat') > -1) ? 'repeat' : 'no-repeat';
    //try { fs.accessSync(path); this.background=path; }
    //catch(e) {}    
    _rmt.call(this, Array.from(arguments));
}
DroidScriptLayout.prototype.AddChild=function(child,order) { // > order = foreground
    _SetParent(child, {objId:this.objId});
    // 0 = back, end of list=front (drawn last)
    if(order < 0) { order=-order; }
    if(!order || order > this.children.length) { order=this.children.length; }
    this.children.splice(order, 0, {objId:child.objId});
    var args=Array.from(arguments);
    args[0]={objId:child.objId};
    _rmt.call(this, args);
}
DroidScriptLayout.prototype.SetPadding=function(left,top,right,bottom) {
    this.padding={left:left,top:top,right:right,bottom:bottom};
    _rmt.call(this, Array.from(arguments));
}
DroidScriptLayout.prototype.SetVisibility=function(mode) { // Show, Hide, Gone
    this.visibleMode=mode;
    _rmt.call(this, Array.from(arguments));
}
DroidScriptLayout.prototype.SetSize=function(width,height) {
    this.width=width;
    this.height=height;
    _rmt.call(this, Array.from(arguments));
}
// This sets 3 Background Colors for the Layout which are split at a 
// Line between x1,y1 and x2,y2.
DroidScriptLayout.prototype.SetBackGradient=function(color1,color2,color3, x1,y1, x2,y2) {
    this.backGradient={color1:color1,color2:color2,color3:color3, 
                x1:x1,y1:y1, x2:x2,y2:y2};
    _rmt.call(this, []);
}


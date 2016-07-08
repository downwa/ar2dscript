/////////////// DroidScriptDialog /////////////////
function DroidScriptDialog(title,options) { // options="NoCancel,NoTitle"
    this.className='new_DroidScriptDialog';
    this.objId=newObjId();
    this.title=title;
    this.options=options;
    _rmt.call(this, Array.from(arguments));
};

DroidScriptDialog.prototype.AddLayout=function(lay) {
    throw new Error("Not implemented");
}

/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Btn emulation **/

/////////////////////////////////////////////////////////////////////////////////

function _DS_Btn(text,width,height,options) {
    this.text=text;
    this.width=width;
    this.height=height;
    this.options=options;
    var h=_createNode('BUTTON', _newId(this,'Btn'))
    h.css('background',this.backColor='#444');
    h.css('color',this.textColor='#fff');
    h.css('font-family','Verdana,sans-serif');
    h.html(text);
    this.htmlObj=h;
    this.visible=false;
    this.onClick=function() {};
    this.modified=2; // 2=outer (incl attributes), 1=innerHTML, 0=none
}

function _DS_Btn_SetTextSize(size,mode) {
    //_set.apply(this, {size:size});
    if(parseInt(size) == size) { size += 'pt'; }
    this.htmlObj.css('font-size',this.size=size);
    if(this.visible) { _rmtSet(this, this.htmlObj.html()); }
}

function _DS_Btn_SetText(text) {
    //console.log("SetText: this.id="+this.id);
    this.htmlObj.html(text);
    if(this.visible) { _rmtSet(this, this.htmlObj.html()); }
}

function _DS_Btn_SetTextColor(color) {
    this.htmlObj.css('color',this.textColor=color);
    if(this.visible) { _rmtSet(this, this.htmlObj.html()); }
}

function _DS_Btn_SetOnClick(callback) {
    this.onClick=eval(callback);
    $('#obj_'+this.id).attr('onClick','onClick(this.id.replace(/^obj_/,""))');
    console.log("id="+this.id+";html="+$.html());
    //h.css('font-family','Verdana,sans-serif');
    if(this.visible) { _rmtSet(this, this.htmlObj.html()); }
}
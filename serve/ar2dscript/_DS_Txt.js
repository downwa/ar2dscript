/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Txt emulation **/

/////////////////////////////////////////////////////////////////////////////////

function _DS_Txt(text,width,height,options) {
    this.text=text;
    this.width=width;
    this.height=height;
    this.options=options;
    this.backColor='#000000';
    this.textColor='#808080'; 
    var h=_createNode('DIV', _newId(this))
    h.css('background',this.backColor);
    h.css('color',this.textColor);
    h.html(text);
    this.htmlObj=h;
    return this.id;
}

function _DS_Txt_SetTextSize(size,mode) {
    if(parseInt(size) == size) { size += 'pt'; }
    this.htmlObj.css('font-size',this.size=size);
}

function _DS_Txt_SetText(text) {
    console.log("SetText: this.id="+this.id);
    this.htmlObj.html(text);
    _rmtSet(this, this.htmlObj.html());
}

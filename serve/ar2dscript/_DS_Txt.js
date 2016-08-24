/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Txt emulation **/

/////////////////////////////////////////////////////////////////////////////////

function _DS_Txt(text,width,height,options) {
    _newId(this,'Txt');
    this.attrs={text:text};
    this.css.width=width;
    this.css.height=height;
    this.options=options;
    this.css['background']='rgba(0, 0, 0, 0)'; // Transparent background by default
    this.css['color']='#fff'; // White text by default
}

function _DS_Txt_SetTextSize(size,mode) {
    _load("_DS_Obj");
    _DS_Obj_SetTextSize.call(this, size, mode);
}

function _DS_Txt_SetText(text) {
    _load("_DS_Obj");
    _DS_Obj_SetText.call(this, text);
}

function _DS_Txt_SetTextColor(color) {
    _load("_DS_Obj");
    _DS_Obj_SetTextColor.call(this, color);
}

function _DS_Txt_SetTextShadow(radius, dx, dy, color) {
    _load("_DS_Obj");
    _DS_Obj_SetTextShadow.call(this, radius, dx, dy, color);
}
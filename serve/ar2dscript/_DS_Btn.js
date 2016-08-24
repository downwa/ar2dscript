/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Btn emulation **/

/////////////////////////////////////////////////////////////////////////////////

function _DS_Btn(text,width,height,options) {
    _newId(this,'Btn');
    this.attrs={text:text, width:width, height:height, onClick:function(){}};
    this.options=options;
    this.css['background']='#444';
    this.css['color']='#fff';
}

function _DS_Btn_SetTextSize(size,mode) {
    _load("_DS_Obj");
    _DS_Obj_SetTextSize.call(this, size, mode);
}

function _DS_Btn_SetStyle(color1, color2, radius, strokeColor, strokeWidth, shadow) {
    _load("_DS_Obj");
    _DS_Obj_SetStyle.call(this, color1, color2, radius, strokeColor, strokeWidth, shadow);
}

function _DS_Btn_SetText(text) {
    _load("_DS_Obj");
    _DS_Obj_SetText.call(this, text);
}

function _DS_Btn_SetTextColor(color) {
    _load("_DS_Obj");
    _DS_Obj_SetTextColor.call(this, color);
}

function _DS_Btn_SetTextShadow(radius, dx, dy, color) {
    _load("_DS_Obj");
    _DS_Obj_SetTextShadow.call(this, radius, dx, dy, color);
}

function _DS_Btn_SetOnClick(callback) {
    this.onClick=eval(callback);
// FIXME: Need to eval local callback, but need to execute in remote app?
    _set.call(this, {attrs:{onClick:this.attrs.onClick='onClick('+this.id+')'}});
}
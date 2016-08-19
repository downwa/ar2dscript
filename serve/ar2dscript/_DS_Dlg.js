/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Dlg emulation **/

/////////////////////////////////////////////////////////////////////////////////
function _DS_Dlg(title, options) {
    _newId(this,"Dlg")
    // options: NoCancel, NoTitle, NoDim,NoTouch,NoFocus
    // options: Bottom,Short
    if(options) { options = options.toLowerCase(); }
    else { options = ""; }
    var nocancel=false,notitle=false,nodim=false,notouch=false,nofocus=false;
    if (!title) { notitle=true; }
    switch(options) {
	    case "nocancel": { nocancel=true; break; }
	    case "notitle" : { notitle=true;  break; }
	    case "nodim"   : { nodim=true;    break; }
	    case "notouch" : { notouch=true;  break; }
	    case "nofocus" : { nofocus=true;  break; }
    }
    this.title=title;
    this.options=options;
    this.timer=null;
    
    this.css['background']='gray';
    this.css['color']='white';
    if(title) { this.attrs.text="<h1 style='color:#0000BB'>"+title+"</h1><hr style='color:#0000BB' />"; }
//     this.css['border-color']='gray';
//     this.css['border-style']='solid';
}

function _DS_Dlg_SetBackColor(color) {
    _load("_DS_Obj");
    _DS_Obj_SetBackground.call(this, color);
}
/*
 *
 *
 *                                _dlgPop = app.CreateDialog( null, "NoDim,NoTouch,NoFocus" ); ^M
                                _dlgPop.SetBackColor( "#cc000000" );^M
                                _dlgPop.SetPosition( -1, options.indexOf("bottom")>-1 ? 0.75 : 0.25  );^M
                                var lay = app.CreateLayout( "linear", "vcenter" );^M
                                lay.SetPadding( 0.02, 0.02, 0.02, 0.02 );^M
                                _dlgPop.AddLayout( lay );^M
                                _txtDlgPop = app.CreateText( msg );^M
                                _txtDlgPop.SetTextSize( 22 );^M
                                _txtDlgPop.SetTextColor( "#ffffff" );^M
                                lay.AddChild( _txtDlgPop );^M
 
 **/

// -1 = automatic position
function _DS_Dlg_SetPosition(left, top, width, height) {
    // FIXME: Need better auto-position
//     if(left == -1) { left=0.1; }
//     if(top == -1) { top=0.1; }
    var css={css:{
	position: this.css.position='fixed',
	left:   this.css.left   = (100*left)+'vw',
	top:    this.css.top    = (100*top)+'vh'
    }};
    if(width)  { css.css.width =this.css.width  = (100*width)+'vw'; }
    if(height) { css.css.height=this.css.height = (100*height)+'vh'; }
    _set.call(this, css);
	
}

function _DS_Dlg_AddLayout(layout) {
    layout=_objects[layout];
    //console.log("AddLayout: this.id="+this.id+";layout.id="+layout.id);
    layout.parent={id:this.id, cls:"Dlg"};
    _DS_Lay_SetSize.call(layout); // Already set size, just update units
    this.children.push({id:layout.id});
    layout.visible=true;
    _set.call(this, {children:this.children});
}

function _DS_Dlg_Show() {
    _set.call(this, {visible:this.visible=true});
}

function _DS_Dlg_Hide() {
    _set.call(this, {visible:this.visible=false});
}



/*         //Provide toast popup on Remix.^M
        _dlgPop = null;^M
        if( app.GetModel().indexOf("Remix")>-1 )^M
        {^M
                app.ShowPopup = function( msg, options )^M
                {^M
                        if( _dlgPop==null ) ^M
                        { ^M
                                _dlgPop = app.CreateDialog( null, "NoDim,NoTouch,NoFocus" ); ^M
                                _dlgPop.SetBackColor( "#cc000000" );^M
                                _dlgPop.SetPosition( -1, options.indexOf("bottom")>-1 ? 0.75 : 0.25  );^M
                                var lay = app.CreateLayout( "linear", "vcenter" );^M
                                lay.SetPadding( 0.02, 0.02, 0.02, 0.02 );^M
                                _dlgPop.AddLayout( lay );^M
                                _txtDlgPop = app.CreateText( msg );^M
                                _txtDlgPop.SetTextSize( 22 );^M
                                _txtDlgPop.SetTextColor( "#ffffff" );^M
                                lay.AddChild( _txtDlgPop );^M
                        }^M
                        else _txtDlgPop.SetText( msg );^M
                        _dlgPop.Show();^M
                        if( _dlgPop.timer ) clearTimeout( _dlgPop.timer ); ^M
                        var time = ( options.indexOf("short") ? 2000 : 4000 );^M
                        _dlgPop.timer = setTimeout( function() { _dlgPop.Hide(); }, time );^M
                }^M
        }^M
^M
        //Init app.^M
        prompt( "#", "_Init" );^M

 *
 **/


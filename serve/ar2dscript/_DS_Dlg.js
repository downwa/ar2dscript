/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript Dlg emulation **/

/////////////////////////////////////////////////////////////////////////////////
function _DS_Dlg(title, options) {
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
	this.layouts=[];
	this.visible=false;
	
	var h=_createNode('DIV', _newId(this,"Dlg"))
	h.css('background',this.backColor='gray');
	h.css('color',this.textColor='white');
	if(title) { h.html("<h1 style='color:#0000BB'>"+title+"</h1><hr style='color:#0000BB' />"); }
	h.css('border-color','gray');
	h.css('border-style','solid');
	$('#headhide').append(h); // Not in body, hide in head
	this.htmlObj=h;
	//_rmtSet(this, $.html(this.htmlObj)); // Send outerHTML
}

function _DS_Dlg_SetBackColor(color) {
	this.backColor=color; //='gray';
	this.htmlObj.css('background',this.backColor);
	if (this.visible) {
		// Send outerHTML: $.html(h)
		_rmtSet(this, $.html(this.htmlObj));
		console.log("SETBACKCOLOR: "+$.html(this.htmlObj));
	}
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
	this.htmlObj.css('position', 'absolute');
	if(left && left>=0) { this.htmlObj.css('left', (this.left=(100*left))+'vw'); }
	if(top && top>=0) { this.htmlObj.css('top', (this.top=(100*top))+'vh'); }
	if(width && width>=0) { this.htmlObj.css('width', (this.width=(100*width))+'vw'); }
	if(height && height>=0) { this.htmlObj.css('height', (this.height=(100*height))+'vh'); }
	if (this.visible) {
		_rmtSet(this, $.html(this.htmlObj)); // Send outerHTML
		console.log("SETPOSITION: "+$.html(this.htmlObj));
	}
}

function _DS_Dlg_AddLayout(layout) {
	layout=_objects[layout];
	//console.log("AddLayout: this.id="+this.id+";layout.id="+layout.id);
	layout.parent={id:this.id, cls:"Dlg"};
	_DS_Lay_SetSize.call(layout); // Already set size, just update units
	this.layouts.push({id:layout.id});
	var did='#'+this.htmlObj.attr('id');
	var dlg=$(did);
	var lid='#'+layout.htmlObj.attr('id');
	dlg.append($(lid))
	if (this.visible) {
		//console.log("AddLayout htm="+$.html(lid));
		_rmtAdd({htmlObj:dlg}, $.html(lid));
	}
}

function _DS_Dlg_Show() {
	//this.htmlObj.append(this.htmlObj);
	//var did='#'+this.htmlObj.attr('id');
	//_rmtAdd(this, $.html(did));
	//
	var body=$('body');
    var did='#'+this.htmlObj.attr('id');
    body.append($(did));
	//console.log("body="+$.html('body'));
	this.visible=true;
    //console.log("AddLayout htm="+$.html(lid));
    //_rmtSet({htmlObj:body}, $.html('body'));
	_rmtAdd({htmlObj:body}, $.html(this.htmlObj), this); // Send outerHTML
}

function _DS_Dlg_Hide() {
	this.visible=false;
	$('#headhide').append(this.htmlObj); // Remove from body, hide in head
	_rmtHid(this);
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

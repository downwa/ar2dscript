/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

var _objects=[];
_objects[1]={id:1, cls:'App', layouts:[]} // Application object
var _nextObjId_=2; // Must start at >0

var navigator={
    _VERSION: _app.VERSION,
    userAgent: "Android Emulation for Linux"
};

function prompt(promptMsg, dftVal) {
    var h1=promptMsg[0] == '#';
    var h2=(parseInt(promptMsg) || promptMsg[0] == '0');
    if(h1 || (h2 && dftVal.match(/^[A-Z][a-z]*\.[A-Z][A-Za-z]*\(/))) { // e.g. App.CreateLayout(
	var id=promptMsg[0]=='#' ? promptMsg.substr(1) : promptMsg;
	if(id == '') { id=1; }
	var args=dftVal.split('\f');
	//console.log("id="+id+";args="+JSON.stringify(args));
	var a0=args[0];
	var xa=a0.indexOf('(');
	var fn=null;
	const _main="_Main_";
	var cls=_main;
	if(xa > -1) {
	    fn=a0.substr(0, xa);
	    if(xa < a0.length-1) { args[0]=a0.substr(xa+1); }
	    else { args.shift(); }
	}
	else { fn=a0; args.shift(); }
	var ofn=fn;
	xa=fn.indexOf('.');
	var clsBase=_main;
	if(xa > -1) { clsBase=fn.substr(0,xa); cls="_DS_"+clsBase; fn=fn.substr(xa+1); }
	_load(cls);
	for(xa=0; xa<args.length; xa++) {
	    if(typeof args[xa] === 'string') {
		if(args[xa] === "null" || args[xa] === "undefined") { args[xa]=null; }
	    }
	}
	fn=cls+"_"+fn;
	var f=eval(fn);
	var obj=_objects[id];
	if(!obj) { obj={cls:clsBase,id:id}; }
	if(ofn != "_Init") { log(colors.blue(ofn+" "+JSON.stringify(args))); }
	var ret=f.apply(obj, args); // Passes new object to called function
	if(ret) {
	    var r=(typeof ret === 'number') ? '#'+ret : JSON.stringify(ret);
	    log(colors.blue("-> "+r)); 
	}
	return ret;
    }
    else { 
	//console.log("promptMsg="+util.inspect(promptMsg)+";dftVal="+dftVal);
	return _prompt(promptMsg, dftVal); 	
    }
}

function alert(msg) {
    _send('alert', [msg], _app, true);
}

function _prompt(promptMsg, dftVal) {
    return _send('prompt', [promptMsg, dftVal], _app, true);
}

function _load(cls, context) {
    if(!context) { context=_app.context; }
    if(eval("typeof "+cls) === 'undefined') {
	loadScripts(".", ['./ar2dscript/'+cls+'.js'], context, true);
    }
}

function _newId(obj) {
    obj.id=_nextObjId_++; // Allocate a new id
    _objects[obj.id]=obj;
    return obj.id;
}

function _rmtAdd(obj, html) {
    var tgtId=obj.htmlObj.attr('id');
    _send('add', [tgtId, html], _app);
}

function _rmtSet(obj, html) {
    var tgtId=obj.htmlObj.attr('id');
    _send('set', [tgtId, html], _app);
}

function _rmtDel(obj) {
    var tgtId=obj.htmlObj.attr('id');    
    _send('del', [tgtId], _app);
}

/***********************************************************************8
var cheerio = require('cheerio');

var $ = cheerio.load(
    "<html><head><title>Test</title><div id='headhide' style='display:none'></div></head><body><h1>Hello</h1><ul id='try'><li>first</li><li>2nd</li></ul></body></html>");     
$('html').html(
    "<html><head><title>Test</title><div id='headhide' style='display:none'></div></head><body><h1>Hello</h1><ul id='try'><li>first</li><li>2nd</li></ul></body></html>");

var e=$.parseHTML("<div style='width:100vw' id='testme'></div>");    
$('#headhide').append(e);
    
$('#headhide').append($('#testme'))

$.root().html()

$('body').append($('#testme'))
$('#testme').css('width','95vw')
     
*/
    
function _createNode(elem, idNum) {
    var id="obj_"+idNum;
    $('#headhide').append($.parseHTML("<"+elem+" id="+id+"></"+elem+">"));
    //console.log("_createNode: "+id+";root="+$.root().html()+";htm="+$.html('#'+id)+"***");
    return $('#'+id);
}

function _parseLayoutOptions(options) {
    // OPTIONS: Left”, “Right”, “Bottom” and “VCenter”, by default objects will be aligned “Top,Center”
    // FillXY - Layout should fill its parent (if the only layout, it will fill the screen.
    //          Without FillXY, size to minimums, not maximums).
    // Horizontal, Vertical
    var opts={hAlign:"center", vAlign: "top", fillx:false, filly:false, direction:"vertical"};
    if(!options) { options=''; }
    var opt=options.toLowerCase();

    // Horizontal alignment
    opts.hAlign=_plo(opt,'center');
    opts.hAlign=_plo(opt,'right',opts.hAlign);
    opts.hAlign=_plo(opt,'left',opts.hAlign);

    // Vertical alignment
    opts.vAlign=_plo(opt,'top');
    opts.vAlign=_plo(opt,'vcenter',opts.vAlign,'center');
    opts.vAlign=_plo(opt,'bottom',opts.vAlign);

    // Horizontal and vertical fill
    opts.fillx=opts.filly=_plo(opt,'fillxy',false,true);
    opts.fillx=_plo(opt,'fillx',opts.fillx,true);
    opts.filly=_plo(opt,'filly',opts.filly,true);

    // Direction
    opts.direction=_plo(opt,'vertical','horizontal');
    opts.direction=_plo(opt,'horizontal');

    return opts;
}

function _plo(opt,val,dftVal,setVal) {
    if(!dftVal) { dftVal=val; }
    if(!setVal) { setVal=val; }
    if(opt.indexOf(","+val+",") > -1 || opt.indexOf(val+",") == 0 || opt.indexOf(","+val) == opt.length-val.length-1 || opt == val) { return setVal; }
    return dftVal;
}

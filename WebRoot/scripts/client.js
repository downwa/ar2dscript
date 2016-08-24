/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

//var filterLog="crt[cls=Scr]";
//var filterLog="crt[cls=Dlg]";
var filterLog=null; //"dim";

var otherSession=false;
var _objects=[];

var intViewportWidth  = 0;
var intViewportHeight = 0;

var filtFn="",filtAttr="",filtVal="";
if(filterLog) {
    var ff=filterLog.split('[');
    filtFn=ff[0];
    if(ff.length > 1) {
	ff=ff[1].split(']')[0].split('=');
	filtAttr=ff[0];
	filtVal=ff[1];
    }
    log("filterLog="+filterLog+"; filtFn="+filtFn+",filtAttr="+filtAttr+",filtVal="+filtVal);
}

function main() {
    onResize();
    var firstCall=true;
    var wsurl='ws://'+window.location.hostname+':'+window.location.port+window.location.pathname;
    var title=window.location.pathname.substr(1);
    var xa=title.lastIndexOf('/');
    if(xa == title.length-1 && title.length > 0) { title=title.substr(0,xa); }
    xa=title.lastIndexOf('/');
    if(xa > -1) { title=title.substr(xa+1); }
    document.title=title;
    log('CON '+wsurl); //+'; cookie='+getCookie("session"));
    var proto='droidscript-gui-protocol';
    client = null;
    
    try { client=new WebSocket(wsurl, proto); }
    catch(e) { return null; }

    client.onerror = function() {
        log('Connection Error');
    };
    
    client.onopen = function() {
        //console.log('WebSocket Client Connected');
	if (client.readyState === client.OPEN) {
	    var wloc=window.location.href;
	    var xa=wloc.indexOf('#');
	    if(xa > -1) { wloc=wloc.substring(0,xa); }
	    if(wloc != window.location.href) { window.location.href=wloc; }
	    window.title='Connected.';
	}
    };
    
    client.onclose = function() {
        log('droidscript-gui-protocol Client Closed');
        //var wloc=window.location.href;
        //var xa=wloc.indexOf('#');
        //if(xa > -1) { wloc=wloc.substring(0,xa); }
        //window.location.href=wloc+'# Reconnect in 5 seconds...';
        //window.title='Reconnect in 5 seconds...';
	if(!otherSession) {
	    if(confirm('Connection to server lost.  Reconnect?')) {
		setTimeout('main();',5000);
	    }
	}
    };
    
    client.onmessage = function(e) {
	if(firstCall) { firstCall=false; init(); }
        //console.log('message received');
        if (typeof e.data === 'string') {
	    //alert('data='+e.data);
	    log('data='+e.data);
            var d=JSON.parse(e.data);
	    // e.g. "crt[cls=Scr]"
	    if(!filterLog || (d.fn == filtFn && (filtAttr != "" ? d.args[0][filtAttr] == filtVal : true))) {
		log("RCV " + d.mid+ " " + d.fn+JSON.stringify(d.args));
	    }
	    var fun=null;
	    try { fun=window[d.fn]; }
	    catch(e) { var err=e.message+": locating function "+d.fn; alert(err); throw new Error(err); }
	    if(fun) {
		var args=normalizeArgs(d.args);
		try {
		    var obj=null; // FIXME
		    //console.log("      "+d.fn+" "+JSON.stringify(args));
		    var ret=fun.apply(obj, args);
		    if(d.cb !== 'N') { 
			log("SND mid="+d.mid);
			send({mid:d.mid, args:[ret]}); } // mid=Message Id
		}
		catch(e) {
		    var err=e.message+": executing "+d.fn+": "+fun.toString(); //+" with "+JSON.stringify(args);
		    alert(err);
		    throw new Error(err, e.fileName, e.lineNumber);
		}
	    }
	    else { throw new Error('Missing function: '+d.fn); }
        }
    };
}

function init() {
    var body=document.getElementsByTagName("BODY")[0];
    if(window.location.pathname !== "/Apps/_index/") {
	body.innerHTML='<a href="/" style="background:white; color:black;">&lt;Index</a>';
    }
    _objects[1]={cls:'App', h:body, id:1, children:[]};
}

function onResize() {
//     var w = window.innerWidth ? window.innerWidth : document.body.clientWidth;
//     var h = window.innerHeight ? window.innerHeight : document.body.clientHeight;
    var objNode = document.createElement("div");
    objNode.style.width  = "100vw";
    objNode.style.height = "100vh";
    document.body.appendChild(objNode);
    intViewportWidth  = objNode.offsetWidth;
    intViewportHeight = objNode.offsetHeight;
    document.body.removeChild(objNode);
}

function onClick(id) {    
    send({mid:null, args:contractArgs([{id:id}])});
}

function exit() {
    window.location.href='/Apps/';
}

function crt(obj) {
    var h=document.getElementById(obj.id);
    var inner={inner:null};
    if(!h) { h=create(obj.cls, inner); }
    //else { alert('Existing '+obj.id); }
    _objects[h.id=obj.id]=obj;
    obj.h=h;
    obj.inner=inner.inner;
    if(obj.inner) { obj.inner.id=obj.id+'_inner'; }
    setValues(obj, inner.inner);
    //alert('created '+obj.id+' of '+obj.cls+'; h='+obj.h);
    //return h;
}

function create(cls, inner) {
    var tag='DIV';
    switch(cls) {
	case 'Btn': { tag='BUTTON'; break; }
	case 'Scr': {
	    var outer=document.createElement(tag);
	    outer.style.display='flex';
 	    outer.style.width='100%';
 	    //outer.style.height='50%';
	    inner.inner=document.createElement(tag);
	    outer.appendChild(inner.inner);
	    return outer;
	}
    }
    return document.createElement(tag);
}

function upd(obj) {
    // FIXME: Update object content
    // upd[{"children":[{"id":2}],"id":1}]
    
    if(!obj.h) {
	obj.h=document.getElementById(obj.id);
	if(!obj.h) { return; //alert('HTML:'+document.getElementsByTagName('BODY')[0].innerHTML);
	    throw new Error("Missing parent: id="+obj.id); }
	//alert('upd should add descendents: '+JSON.stringify(obj.children));
	//obj.h=parentHtml;
    }
    setValues(obj);
}

function setValues(obj, objh) {    
    if(!objh) { objh=obj.h; }
    /* cls, visible, attrs, css, children, parent */
    if(obj.attrs) {
	if(obj.attrs.text) { objh.innerHTML=obj.attrs.text; }
	for(a in obj.attrs) {
	    if(a == "text") { continue; }
	    objh.setAttribute(a, obj.attrs[a]);
	}
    }
    for(s in obj.css) {
	var id=objh.id.toString();
	if(id.endsWith('_inner') && (s == "height")) {
	    obj.h.style[s]=obj.css[s];
	    objh.style[s]='100%';
	}
	else { objh.style[s]=obj.css[s]; }
    }
    if(obj.children) { addDescendents(obj.h,obj); }
    if(obj.cls == 'Dlg' && obj.visible) { // Add to body so dialog will display
	var body=_objects[1]; // BODY
	var found=false;
	for(var xa=0; xa<body.children.length; xa++) {
	    if(body.children[xa].id == obj.id) { found=true; break; }
	}
	if(!found) { body.children.push({id:obj.id}); }
	addDescendents(body.h, body);
    }
    if(obj.visible === true || obj.visible === false) {
	var vis = (obj.cls == 'Lay' ? 'table-cell' : '');
	objh.style.display = (obj.visible ? vis : 'none');
	if(obj.cls == "Dlg") {
	    setTimeout(function() {
		var objh=document.getElementById(this.id);
		var s=objh.style;
		if(s.left == '-100vw' || s.top == '-100vw') { // Center automatically
		    if(s.left == '-100vw') { s.left=centerView(intViewportWidth, objh.offsetWidth)+'vw'; }
		    if(s.top == '-100vh') { s.top=centerView(intViewportHeight, objh.offsetHeight)+'vh'; }
		}
	    }.bind(obj),0);
	}
    }
}

function centerView(viewSize, objSize) {
    var center=(viewSize-objSize)/2;
    return 100*center/viewSize;
}

function addDescendents(parentHtml, obj) {
    //if(obj.children.length > 0) { alert('children of '+obj.id+'='+JSON.stringify(obj.children)); }
    for(var xa=0; xa<obj.children.length; xa++) {
	var c=obj.children[xa];
	var child=_objects[c.id];
	//alert('add child='+JSON.stringify(child));
	if(!child) { throw new Error("Missing child: id="+c.id+';c='+JSON.stringify(c)); }
	//alert('Adding child '+child.h);
	var existing=document.getElementById(child.h.id);
	if(!existing) { parentHtml.appendChild(child.h); }
	var ch=child.inner ? child.inner : child.h;
	if(child.inner) {
	    existing=document.getElementById(ch.id);
	    if(!existing) { child.h.appendChild(ch); }
	}
	// Else already in the document tree.  FIXME: Update the child content...
	addDescendents(ch, child);
    }
    // NOTE: Below scrolling may take several tries as content gets populated
    if(obj.cls == 'Scr' && obj.inner && obj.extra && (obj.extra.scrollx || obj.extra.scrolly)) {
	//console.log('try x='+obj.extra.scrollx+';y='+obj.extra.scrolly);
	ScrollTo(obj.inner, obj.extra.scrollx, obj.extra.scrolly);
    }
}

////////////////////////////

function ScrollTo(id, sx, sy) {
    //alert('this='+e.id+',sx='+sx+',sy='+sy);
    var e=document.getElementById(id);
    if(!e) { alert('ScrollTo: id not found: '+id); return; }
    e.scrollLeft = sx*intViewportWidth;
    e.scrollTop = sy*intViewportHeight;
}

function GetScrollX(id) {
    var e=document.getElementById(id);
    if(!e) { return 0; }
    var msw=(e.scrollWidth - e.clientWidth);
    //alert('sl='+e.scrollLeft+';msw='+msw+';sw='+e.scrollWidth+';cw='+e.clientWidth);
    return msw ? (e.scrollLeft/intViewportWidth/*msw*/) : 0;
}

function GetScrollY(id) {
    var e=document.getElementById(id);
    if(!e) { return 0; }
    var msh=(e.scrollHeight - e.clientHeight);
    return msh ? (e.scrollTop/intViewportHeight/*msh*/) : 0;
}

var dimAmt=0.0;
function dim() {
    alert('dim');
	var body=document.getElementsByTagName('body')[0];
	dimAmt+=0.025;
	body.style.background="rgba(0, 0, 0, "+dimAmt+")"
	if(dimAmt <= 0.5) { setTimeout('dim()',25); }
	else { 
	    body.innerHTML+='<br /><br /><center style="background:white; color: red;">(Disconnected by other session)</center>'; 
	    otherSession=true;
	    client.close();
	}
}

// Replace expanded arguments with argument references (by objId)
function contractArgs(args) {
    for(var xa=0; xa<args.length; xa++) {
        if(!args[xa]) { continue; }
        var id=args[xa].id;
	var obj=args[xa];
        if(obj && id && id != "" && Object.keys(obj).length > 1) { // Only contracts if not already contracted
            args[xa]={id:obj.id};
        }
        //console.log("CA:args["+xa+"]="+args[xa]);
    }
    return args;
}

// Replace argument references with objects referred to
function normalizeArgs(args) {
    for(var xa=0; xa<args.length; xa++) {
        if(!args[xa]) { continue; }
        var id=args[xa].id;
	var obj=args[xa];
        if(obj && id && id != "" && Object.keys(obj).length == 1) { // Only expands if not already expanded
            obj=_objects[id];
            if(!obj) { log("MISSING object #"+id); }
            args[xa]=obj;
        }
        //console.log("NA:args["+xa+"]="+args[xa]);
    }
    return args;
}

function d(id) {
    var o=_objects[id];
    log(JSON.stringify(o));
    return o;
}

function send(obj) {
    client.send(JSON.stringify(obj));
}

////////////////////////////

function log(msg) {
    var d = dateToHMS(new Date()); //dateToYMDHMS(new Date());
    console.log(d+' '+msg);
}

function dateToYMD(date) {
  try {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
  }
  catch(e) { console.log("dateToYMD: "+e.stack); }
  return              '' + y  + '-' + 
    (m  <= 9 ? '0' +  m : m)  + '-' +
    (d  <= 9 ? '0' +  d : d);
}
function dateToHMS(date) {
  try {
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();
  }
  catch(e) { console.log("dateToHMS: "+e.stack); }
  return formatHMS(hh,mm,ss);
}
function formatHMS(hh,mm,ss) {
    return (hh <= 9 ? '0' + hh : hh) + ':' +
         (mm <= 9 ? '0' + mm : mm) + ':' +
         (ss <= 9 ? '0' + ss : ss);
}
function dateToYMDHMS(date) {
    return dateToYMD(date) + ' ' + dateToHMS(date);
}


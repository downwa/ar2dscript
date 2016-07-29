#!/usr/bin/env nodejs

var vm = require('vm');
var sandbox={console:console, myfn:function() {
	console.log("MYFN");
//	console.log("MYFN: a="+a);
}, a:42, setTimeout:setTimeout};

setTimeout(function() { console.log('timer0'); }, 1000);

var ctx = new vm.createContext(sandbox);
vm.runInContext("function okfn() { console.log('OKFN'); setTimeout(function() { console.log('timer1'); }, 5000); console.log('OKFN: a='+a); } console.log('TEST'); console.log('TEST: a='+a);okfn(); myfn();", ctx, {filename:"TEST"});

/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */


_app.proc = cp.fork('serve/startapp.js');

_app.proc.on('message', (msg) => {
    _app.Fiber(function() { // Callbacks need a new fiber
	if(msg._appLog) {
	    process.stdout.write(colorsafe.green(msg._appLog));
	}
	else if (msg.msg && msg.msg._serviceForward) {
	    var s=msg.msg._serviceForward;
	    //console.log('PARENT got message: s=', s);
	    _app.proc.send({_appReply:prompt(s.promptMsg, s.dftVal)}); // Send reply to child (app)
	}
	else {
	    console.log('PARENT got invalid message:', msg);
	    //this.onMessage(msg.msg); 
	}
    }.bind(this)).run();
});

_app.proc.send({start: _app.name});

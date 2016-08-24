/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */


_app.proc = cp.fork('serve/startapp.js');

_app.proc.on('message', (msg) => {
    _app.Fiber(function() { // Callbacks need a new fiber
	//console.log('PARENT got message: ', msg);
	if(msg._appLog) {
	    process.stdout.write(colorsafe.green(msg._appLog));
	}
	else if (msg.msg && msg.msg._appForward) {
	    var s=msg.msg._appForward;
	    console.log('PARENT got message: s=', s);
	    var rpy=_send(s.fn, s.args, _app, msg.awaitReturn)
	    console.log('PARENT finished message: mid=', s.mid);
	    //_app.proc.send({_appReply:prompt(s.promptMsg, s.dftVal)}); // Send reply to child (app)
	    _app.proc.send({_appReply:rpy}); // Send reply to child (app)
	}
	else {
	    console.log('PARENT got invalid message:', msg);
	    //this.onMessage(msg.msg); 
	}
    }.bind(this)).run();
});

_app.proc.send({start: _app.name});

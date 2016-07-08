/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

// if(!process.send) {
//     console.log("ERROR: not started as service.");
//     process.exit(1);
// }

if(process.send) {
    process.stdout.write = process.stderr.write = function(data) {
	process.send({_serviceLog:data});
    }
}

process.on('uncaughtException', function(err) {
    console.error((err && err.stack) ? err.stack : err);
});

console.log("RUNNING SERVICE");

process.on('message', (msg) => {
    console.log('CHILD got message:', msg);
    console.log('start='+msg.start);
});

if(process.send) { process.send({_serviceReady: true}); }

setInterval(() => {
    console.log("SERVICE still alive at "+new Date());
},10000);

var ps = require('ps-node');
 
// A simple pid lookup 
ps.lookup({command: 'node'}, function(err, resultList ) {
    if (err) {
        throw new Error( err );
    }
 
    resultList.forEach(function( process ){
        if( process ){
            console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
        }
    });
});
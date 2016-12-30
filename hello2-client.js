const ipc=require('node-ipc');

/***************************************\
 *
 * You should start both goodbye and world
 * then you will see them communicating.
 *
 * *************************************/

ipc.config.id = 'hello';
ipc.config.retry = 1000;

var appName='ar2dscript-_index';
var session='d207bd65cb9373ba18967055553d4692b0f512c69313fb252771ccec602592e1';
var appId=appName+'-'+session;

ipc.connectTo(
    appId,
    function(){
	var msg={fn: "onClick", id:42};
	ipc.of[appId].emit('app.message',{id: ipc.config.id, message: JSON.stringify(msg)});
	
	
//         ipc.of.world.on(
//             'connect',
//             function(){
//                 ipc.log('## connected to world ##', ipc.config.delay);
//                 ipc.of.world.emit(
//                     'app.message',
//                     {
//                         id      : ipc.config.id,
//                         message : 'goodbye'
//                     }
//                 );
//             }
//         );
//         ipc.of.world.on(
//             'disconnect',
//             function(){
//                 ipc.log('disconnected from world');
//             }
//         );
        ipc.of[appId].on(
            'app.message',
            function(data){
                ipc.log('got a message from server : ', data);
            }
        );

        console.log(ipc.of[appId].destroy);
    }
);

const ipc=require('node-ipc');

/***************************************\
 *
 * You should start both hello and world
 * then you will see them communicating.
 *
 * *************************************/

ipc.config.id = 'hello';
ipc.config.retry = 1000;
//ipc.config.silent=true;

ipc.connectTo(
    'worldtest',
    function(){
	var msg={testme: "Howdy", val:42};
	ipc.of.worldtest.emit('app.message',{id: ipc.config.id, message: JSON.stringify(msg)});
	//process.exit();
        ipc.of.worldtest.on(
            'connect',
            function(){
                ipc.log('## connected to world ##', ipc.config.delay);
                //ipc.of.worldtest.emit('app.message',{id: ipc.config.id, message: 'howdy'});
		//process.exit();
            }
        );
		
        ipc.of.worldtest.on(
            'disconnect',
            function(){
                ipc.log('disconnected from world');
		process.exit();
            }
        );
        ipc.of.worldtest.on(
            'app.message',
            function(data){
                ipc.log('got a message from world : ', data);
		process.exit();
            }
        );
// 
//         console.log(ipc.of.world.destroy);
    }
);

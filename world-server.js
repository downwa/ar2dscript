const ipc=require('node-ipc');

/***************************************\
 *
 * You should start both hello and world
 * then you will see them communicating.
 *
 * *************************************/

ipc.config.id = 'worldtest';
ipc.config.retry= 1500;
//ipc.config.silent=true;

ipc.serve(
    function(){
        ipc.server.on(
            'app.message',
            function(data,socket){
		console.log("data=",data);
                ipc.server.emit(
                    socket,
                    'app.message',
                    {
                        id      : ipc.config.id,
                        message : data.message+' world!'
                    }
                );
            }
        );
    }
);



ipc.server.start();

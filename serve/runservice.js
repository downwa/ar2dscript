/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

// if(!process.send) {
//     console.log("ERROR: not started as service.");
//     process.exit(1);
// }

process.title='com.ar2dscript:droidscript_service';
console.log(process.title);

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

//var columnParser = require('node-column-parser');
//const exec = require('child_process').exec;
//exec('ps aux', (error, stdout, stderr) => {
//  if (error) {
//    console.error(`exec error: ${error}`);
//    return;
//  }
//  console.log(columnParser(stdout));
//  //console.log(`stdout: ${stdout}`);
//  console.log(`stderr: ${stderr}`);
//});

//var child = require('child_process');
// 
//var ps = child.spawn('ps axu');
//var shellOutput = '';
// 
//ps.stdout.on('data', function (chunk) {
//  shellOutput += chunk;
//});
// 
//ps.stdout.on('end', function () {
//  console.log(shellParser(shellOutput))
//});

//var ps = require('ps-node');
// 
//// A simple pid lookup 
////ps.lookup({command: 'node',psargs: 'ax'}, function(err, resultList ) {
//ps.lookup({psargs: 'axu'}, function(err, resultList ) {
//    if (err) {
//        throw new Error( err );
//    }
// 
//    resultList.forEach(function( process ){
//        if( process ){
//	    console.log("proc="+JSON.stringify(process));
//            //console.log( 'USER: %s, PID: %s, COMMAND: %s, ARGUMENTS: %s', process.user, process.pid, process.command, process.arguments );
//        }
//    });
//});

/** ps axu output
 * Columns 1,2,11
 * MacOS:

USER              PID  %CPU %MEM      VSZ    RSS   TT  STAT STARTED      TIME COMMAND
 * Android:
 * 
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
10119     1961  0.5  1.5 1046652 29656 ?       S<l  16:53   1:02 com.estrongs.android.pop                                                              
10119     2084  0.0  0.0   4752   120 ?        Sl   16:53   0:00 /data/user/0/com.estrongs.android.pop/files/libestool2.so 39623 /data/user/0/com.estrongs.android.pop/files/comm/tool_port
10154     2715  0.8  2.9 999072 55052 ?        Sl   16:56   1:36 com.nuance.swype.dtc                                                                  
10189     2825  0.0  0.7 890032 13560 ?        Sl   16:56   0:04 org.pocketworkstation.pckeyboard                                                      
10013     3258  0.0  1.2 1458344 23824 ?       Sl   16:58   0:10 com.google.process.gapps                                                                          
10066     3396  0.6  2.6 1572456 49812 ?       S<l  16:59   1:08 com.google.android.apps.messaging                                                                 

vs. ps axu | awk '{print $1" "$2" "$11}' | grep \\.
10154 2715 com.nuance.swype.dtc
10189 2825 org.pocketworkstation.pckeyboard
10013 3258 com.google.process.gapps
10066 3396 com.google.android.apps.messaging
10057 3513 com.google.android.inputmethod.latin
10013 3538 com.google.android.gms.persistent
10116 4103 com.pushbullet.android:background
10031 4123 com.google.android.googlequicksearchbox:interactor
10137 4590 com.lastpass.lpandroid
10238 4768 com.gnuroot.debian
10238 5039 /data/user/0/com.gnuroot.debian/support/busybox
10238 5043 /data/user/0/com.gnuroot.debian/support/proot
10182 7371 com.icecoldapps.sambaserver
10002 7567 android.process.acore
10214 7721 com.facebook.katana
10031 7793 com.google.android.googlequicksearchbox:search
10211 7896 com.facebook.orca
10089 8331 com.mapfactor.navigator:Notifications
10031 8518 com.google.android.googlequicksearchbox
10236 10388 jackpal.androidterm
10228 13991 com.koushikdutta.vysor
10015 18995 com.google.android.dialer
10013 19042 com.google.android.gms.feedback
10146 22375 app.greyshirts.firewall
10160 24364 egw.estate
10024 24848 com.android.vending
10217 24930 com.appgeneration.itunerfree
10230 25130 com.smartphoneremote.androidscriptfree
10230 25220 com.smartphoneremote.androidscriptfree:NewActivityProcess
10174 25522 adarshurs.android.vlcmobileremote
10212 25554 mobi.mgeek.TunnyBrowser
10226 25775 berserker.android.apps.sshdroid
10067 26026 com.google.android.deskclock
10009 26129 android.process.media
10013 26672 com.google.android.gms
10230 32409 com.smartphoneremote.androidscriptfree:droidscript_service

MacOS:
USER              PID  %CPU %MEM      VSZ    RSS   TT  STAT STARTED      TIME COMMAND
warren.downs     4440   9.4 39.5  6201108 3315376   ??  S    Tue04PM 787:25.84 /Applications/VirtualBox.app/Contents/Resources/VirtualBoxVM.app/Contents/MacOS/VirtualBoxVM --comment Win10 --startvm c254f936-db28-4843-9d1b-76dc0b2b15ce --no-startvm-errormsgbox
warren.downs      419   4.0  1.5  6173144 127396   ??  U    Tue08AM 384:34.72 /Applications/Thunderbird.app/Contents/MacOS/thunderbird -psn_0_36873
_windowserver     243   2.1  0.6  4441892  53372   ??  Ss   Tue08AM  71:37.92 /System/Library/Frameworks/ApplicationServices.framework/Frameworks/CoreGraphics.framework/Resources/WindowServer -daemon
warren.downs      433   1.2  0.4  2734968  36052   ??  S    Tue08AM   0:23.60 /Applications/Utilities/Terminal.app/Contents/MacOS/Terminal -psn_0_61


Current output:
proc={"pid":"2084","command":"/data/user/0/com.estrongs.android.pop/files/libestool2.so","arguments":["39623","/data/user/0/com.estrongs.android.pop/files/comm/tool_port"]}
proc={"pid":"2715","command":"com.nuance.swype.dtc","arguments":""}
proc={"pid":"2825","command":"org.pocketworkstation.pckeyboard","arguments":""}
proc={"pid":"3258","command":"com.google.process.gapps","arguments":""}
proc={"pid":"3396","command":"com.google.android.apps.messaging","arguments":""}
proc={"pid":"3513","command":"com.google.android.inputmethod.latin","arguments":""}
proc={"pid":"3538","command":"com.google.android.gms.persistent","arguments":""}
proc={"pid":"4103","command":"com.pushbullet.android:background","arguments":""}
proc={"pid":"4123","command":"com.google.android.googlequicksearchbox:interactor","arguments":""}
proc={"pid":"4590","command":"com.lastpass.lpandroid","arguments":""}
proc={"pid":"4768","command":"com.gnuroot.debian","arguments":""}
proc={"pid":"5039","command":"/data/user/0/com.gnuroot.debian/support/busybox","arguments":["sh","/data/user/0/com.gnuroot.debian/support/launchProot","/support/blockingScript","startX","/support/startX","/bin/bash"]}
proc={"pid":"5043","command":"/data/user/0/com.gnuroot.debian/support/proot","arguments":["-r","/data/user/0/com.gnuroot.debian/debian","-v","-1","-p","-H","-l","-0","-b","/sys","-b","/dev","-b","/proc","-b","/data","-b","/mnt","-b","/proc/mounts:/etc/mtab","-b","/:/host-rootfs","-b","/storage/emulated/0/GNURoot/intents:/intents","-b","/storage/emulated/0/GNURoot/home:/home","-b","/storage/emulated/0/GNURoot/debian:/.proot.noexec","-b","/storage/emulated/0:/sdcard","-b","/data/user/0/com.gnuroot.debian/support/:/support","-b","/data/user/0/com.gnuroot.debian/support/ld.so.preload:/etc/ld.so.preload","/support/blockingScript","startX","/support/startX","/bin/bash"]}
proc={"pid":"5061","command":"Xtightvnc","arguments":[":51","-desktop","X","-auth","/root/.Xauthority","-geometry","1024x768","-depth","24","-rfbwait","120000","-rfbauth","/root/.vnc/passwd","-rfbport","5951","-fp","/usr/share/fonts/X11/misc/,/usr/share/fonts/X11/Type1/,/usr/share/fonts/X11/75dpi/,/usr/share/fonts/X11/100dpi/","-co","/etc/X11/rgb"]}
proc={"pid":"5106","command":"twm","arguments":""}
proc={"pid":"6749","command":"xterm","arguments":""}
proc={"pid":"6751","command":"bash","arguments":""}
proc={"pid":"7371","command":"com.icecoldapps.sambaserver","arguments":""}
proc={"pid":"7567","command":"android.process.acore","arguments":""}
proc={"pid":"7721","command":"com.facebook.katana","arguments":""}
proc={"pid":"7793","command":"com.google.android.googlequicksearchbox:search","arguments":""}
proc={"pid":"7896","command":"com.facebook.orca","arguments":""}
proc={"pid":"8331","command":"com.mapfactor.navigator:Notifications","arguments":""}
proc={"pid":"8518","command":"com.google.android.googlequicksearchbox","arguments":""}
proc={"pid":"10388","command":"jackpal.androidterm","arguments":""}
proc={"pid":"10404","command":"/system/bin/sh","arguments":["-"]}
proc={"pid":"11417","command":"sshd:","arguments":["root@pts/1"]}
proc={"pid":"11418","command":"-bash","arguments":""}
proc={"pid":"13991","command":"com.koushikdutta.vysor","arguments":""}
proc={"pid":"18995","command":"com.google.android.dialer","arguments":""}
proc={"pid":"19042","command":"com.google.android.gms.feedback","arguments":""}
proc={"pid":"20018","command":"xterm","arguments":""}
proc={"pid":"20026","command":"bash","arguments":""}
proc={"pid":"22375","command":"app.greyshirts.firewall","arguments":""}
proc={"pid":"22459","command":"com.google.android.deskclock","arguments":""}
proc={"pid":"23274","command":"/usr/sbin/sshd","arguments":""}
proc={"pid":"24364","command":"egw.estate","arguments":""}
proc={"pid":"24848","command":"com.android.vending","arguments":""}
proc={"pid":"24930","command":"com.appgeneration.itunerfree","arguments":""}
proc={"pid":"25130","command":"com.smartphoneremote.androidscriptfree","arguments":""}
proc={"pid":"25220","command":"com.smartphoneremote.androidscriptfree:NewActivityProcess","arguments":""}
proc={"pid":"25434","command":"sshd:","arguments":["root@notty"]}
proc={"pid":"25435","command":"/bin/sh","arguments":["-c","if","env","true","2>/dev/null;","then","env","PS1=","PS2=","TZ=UTC","LANG=C","LC_ALL=C","LOCALE=C","/bin/sh;","else","PS1=","PS2=","TZ=UTC","LANG=C","LC_ALL=C","LOCALE=C","/bin/sh;","fi"]}
proc={"pid":"25437","command":"/bin/sh","arguments":""}
proc={"pid":"25439","command":"perl","arguments":[".fishsrv.pl","e2ac6807b28e74f69a03118c8bc248c7"]}
proc={"pid":"25522","command":"adarshurs.android.vlcmobileremote","arguments":""}
proc={"pid":"25554","command":"mobi.mgeek.TunnyBrowser","arguments":""}
proc={"pid":"25775","command":"berserker.android.apps.sshdroid","arguments":""}
proc={"pid":"25819","command":"/bin/sh","arguments":["./run"]}
proc={"pid":"25828","command":"/usr/bin/node","arguments":["./serve/main.js"]}
proc={"pid":"25840","command":"/usr/bin/nodejs","arguments":["serve/runservice.js"]}
proc={"pid":"25845","command":"/bin/sh","arguments":["-c","ps","axu"]}
proc={"pid":"25846","command":"ps","arguments":["axu"]}
proc={"pid":"26672","command":"com.google.android.gms","arguments":""}
proc={"pid":"32409","command":"com.smartphoneremote.androidscriptfree:droidscript_service","arguments":""}

Desired output:
{"user":1002,"pid":5199,"name":"com.android.bluetooth"} running
{"user":10154,"pid":2715,"name":"com.nuance.swype.dtc"} running
{"user":1000,"pid":22024,"name":"com.qualcomm.telephony"} running
{"user":10060,"pid":0,"name":"com.google.android.music:main"} running
{"user":10089,"pid":8331,"name":"com.mapfactor.navigator:Notifications"} running
{"user":10137,"pid":4590,"name":"com.lastpass.lpandroid"} running
{"user":1001,"pid":4276,"name":"com.android.phone"} running
{"user":10160,"pid":24364,"name":"egw.estate"} running
{"user":10214,"pid":7721,"name":"com.facebook.katana"} running
{"user":10214,"pid":0,"name":"com.facebook.katana:videoplayer"} running
{"user":10230,"pid":32409,"name":"com.smartphoneremote.androidscriptfree:droidscript_service"} r...
{"user":10226,"pid":22419,"name":"berserker.android.apps.sshdroid"} running
{"user":10067,"pid":22459,"name":"com.google.android.deskclock"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10029,"pid":3336,"name":"com.android.systemui"} running
{"user":10211,"pid":7896,"name":"com.facebook.orca"} running
{"user":10024,"pid":24848,"name":"com.android.vending"} running
{"user":1002,"pid":5199,"name":"com.android.bluetooth"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10029,"pid":3336,"name":"com.android.systemui"} running
{"user":10057,"pid":3513,"name":"com.google.android.inputmethod.latin"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10137,"pid":4590,"name":"com.lastpass.lpandroid"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10228,"pid":13991,"name":"com.koushikdutta.vysor"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":1002,"pid":5199,"name":"com.android.bluetooth"} running
{"user":10013,"pid":19042,"name":"com.google.android.gms.feedback"} running
{"user":1002,"pid":5199,"name":"com.android.bluetooth"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":1002,"pid":5199,"name":"com.android.bluetooth"} running
{"user":10119,"pid":1961,"name":"com.estrongs.android.pop"} running
{"user":1002,"pid":5199,"name":"com.android.bluetooth"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10154,"pid":2715,"name":"com.nuance.swype.dtc"} running
{"user":1002,"pid":5199,"name":"com.android.bluetooth"} running
{"user":1001,"pid":22080,"name":"com.qualcomm.qcrilmsgtunnel"} running
{"user":10013,"pid":26672,"name":"com.google.android.gms"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10238,"pid":4768,"name":"com.gnuroot.debian"} running
{"user":10029,"pid":3336,"name":"com.android.systemui"} running
{"user":1000,"pid":881,"name":"system"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10182,"pid":7371,"name":"com.icecoldapps.sambaserver"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10116,"pid":4103,"name":"com.pushbullet.android:background"} running
{"user":1000,"pid":881,"name":"system"} running
{"user":10119,"pid":1961,"name":"com.estrongs.android.pop"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":1001,"pid":4276,"name":"com.android.phone"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10146,"pid":22375,"name":"app.greyshirts.firewall"} running
{"user":1000,"pid":881,"name":"system"} running
{"user":10211,"pid":7896,"name":"com.facebook.orca"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":1002,"pid":5199,"name":"com.android.bluetooth"} running
{"user":10031,"pid":4123,"name":"com.google.android.googlequicksearchbox:interactor"} running
{"user":10174,"pid":22127,"name":"adarshurs.android.vlcmobileremote"} running
{"user":1000,"pid":881,"name":"system"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10217,"pid":24930,"name":"com.appgeneration.itunerfree"} running
{"user":1002,"pid":5199,"name":"com.android.bluetooth"} running
{"user":10236,"pid":10388,"name":"jackpal.androidterm"} running
{"user":1001,"pid":4276,"name":"com.android.phone"} running
{"user":1001,"pid":4276,"name":"com.android.phone"} running
{"user":10212,"pid":22174,"name":"mobi.mgeek.TunnyBrowser"} running
{"user":10013,"pid":26672,"name":"com.google.android.gms"} running
{"user":1002,"pid":5199,"name":"com.android.bluetooth"} running
{"user":1002,"pid":5199,"name":"com.android.bluetooth"} running
{"user":10013,"pid":3538,"name":"com.google.android.gms.persistent"} running
{"user":10031,"pid":7793,"name":"com.google.android.googlequicksearchbox:search"} running


*/


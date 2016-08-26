/* ar2dscript http server - nodejs implementation of DroidScript, running server apps via browser
 * Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */
(typeof define !== "function" ? function($){ $(require, exports, module); } : define)(function(require, exports, module, undefined) {

exports.cacheFromZip = cacheFromZip;

// Extract specified files and save to cache (returning list of cache filenames)
function cacheFromZip(zipFile, files) {
    var rets=[];
    // Return cached zips
    var anyMiss=false;
    var tmp=os.tmpdir();
    for(var xa=0; xa<files.length; xa++) {
	var cachePath=fsp.join(tmp, zipFile.replace(/\//g,"_")+"#"+files[xa].replace(/\//g,"_"));
	try { accessFiber(cachePath, fs.R_OK); rets[xa]=cachePath; }
	catch(e) { rets[xa]=null; anyMiss=true; }
    }
    if(!anyMiss) { return rets; }
    console.info("cacheFromZip : "+zipFile);
    var fiber = Fiber.current;
    yauzl.open(zipFile, {lazyEntries: true}, function(err, zipfile) {
	if (err) { console.err("ERROR: "+err.stack); throw err; }
	zipfile.readEntry();
	zipfile.on("entry", function(entry) {
	    var anyFound=false;
	    for(var xa=0; xa<files.length; xa++) {
		if(rets[xa] === null && entry.fileName === files[xa]) {
		    anyFound=true;
		    zipfile.openReadStream(entry, function(err, readStream) {
			if (err) throw err;
			//var string='';
			var cachePath=fsp.join(tmp, zipFile.replace(/\//g,"_")+"#"+files[this].replace(/\//g,"_"));
			readStream.pipe(fs.createWriteStream(cachePath));
			//readStream.on('data', function(part) { string += part; });
			readStream.on('end', function() {
			    rets[this]=cachePath; //string;
			    //Fiber(function() { writeFileFiber(cachePath, string); }).run(); // file, data, options
			    zipfile.readEntry();
			}.bind(this));
		    }.bind(xa));
		}
	    }
	    if(!anyFound) { zipfile.readEntry(); }
	});
	zipfile.on("end", function() { fiber.run(); });
    });
    Fiber.yield();
    console.info("cachedFromZip: "+zipFile+" ("+rets.length+" entries)");
    return rets;
}



// *********************************************************************************

});

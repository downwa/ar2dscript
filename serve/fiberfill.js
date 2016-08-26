/* ar2dscript http server - nodejs implementation of DroidScript, running server apps via browser
 * Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */
(typeof define !== "function" ? function($){ $(require, exports, module); } : define)(function(require, exports, module, undefined) {

exports.readdirFiber   = readdirFiber;
exports.statFiber      = statFiber;
exports.readFileFiber  = readFileFiber;
exports.writeFileFiber = writeFileFiber;
exports.accessFiber    = accessFiber;

var Fiber = require('fibers'); // Threading
const fs = require('fs'); // statSync, readdirSync, readFileSync, readdir, stat, readFile, writeFile, access, createWriteStream

///////////////////////////////////////////////////////////////////////////////////////////
/******** Replacements for fs.*Sync functions, using Fibers for better efficiency ********/
///////////////////////////////////////////////////////////////////////////////////////////

function readdirFiber(path, alphaSort) {
    var fiber = Fiber.current;
    fs.readdir(path, (err, files) => { fiber.run({err:err,files:files}); });
    var ret=Fiber.yield(); // Pause for exec
    //if(ret.err) { Fiber(function() { throw ret.err; }).run(); }
    if(alphaSort) { ret.files.sort(); }
    return ret.files;
}

function statFiber(path) {
    var fiber = Fiber.current;
    fs.stat(path, (err, stats) => { fiber.run({err:err,stats:stats}); });
    var ret=Fiber.yield(); // Pause for exec
    if(ret.err) { throw ret.err; }
    return ret.stats;
}

function readFileFiber(file, options) {
    var fiber = Fiber.current;
    fs.readFile(file, options, (err, data) => { fiber.run({err:err, data:data}); });
    var ret=Fiber.yield(); // Pause for exec
    if(ret.err) { throw ret.err; }
    return ret.data;
}

function writeFileFiber(file, data, options) {
    var fiber = Fiber.current;
    fs.writeFile(file, data, options, (err) => { fiber.run({err:err}); });
    var ret=Fiber.yield(); // Pause for exec
    if(ret.err) { throw ret.err; }
}

function accessFiber(path, mode) {
    var fiber = Fiber.current;
    fs.access(path, mode, (err) => { fiber.run({err:err}); });
    var ret=Fiber.yield(); // Pause for exec
    if(ret.err) { throw ret.err; }
}

// *********************************************************************************

});

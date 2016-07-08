/* Copyright 2016 by Warren E. Downs on behalf of Choggiung Limited.
 * Licensed under the MIT License (MIT)
 */

/** DroidScript emulation initialization **/

//////////////////////////////

function _Main___Init() {
   // console.log("Initializing ar2dscript...");
    $ = cheerio.load("<html><head><title>"+_app.name+"</title><div id='headhide' style='display:none'></div></head><body id='body'></body></html>");
    // $.root().toArray()[0].children[0].children.length
    // var save=$('body').clone();
    // $.text()
    // $.html()
    // $('#one').each(function(index, elem) { console.log(this.html()); });
    // $('head').html("<title>Test</title>")
    // $('body').attr('style','width:100vw')
    // $('body').attr()
    // $('body').attr('style')

    var body=$('body');
    //console.log("_Main___Init: app="+_app.name+";body.id="+body.attr('id')+";htm="+body.html());
}


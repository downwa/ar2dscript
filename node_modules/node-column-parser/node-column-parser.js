// node-column-parser.js is © 2016, Warren E. Downs <vwdowns at gmail dot com>

// Returns array of Javascript objects (header-keyed)
// Optionally returns header array of headers with {header, start, end, ltr} keys for each header.
module.exports = function (out, options) {
    var lines=out.trim().split('\n');
    var headers=[];
    var rows=[];
    for(var xa=0; xa<lines.length; xa++) {
        var line=lines[xa];
        if (xa == 0) {
          headers=parseHeaders(line,lines);
        }
        else {
          rows[xa-1]={};
          for(var xb=0; xb<headers.length; xb++) {
            var hh=headers[xb];
            var ee=headers[xb+1] ? headers[xb+1].start-1 : line.length;
            rows[xa-1][hh.header]=line.substring(hh.start,ee).trim();
          }
        }
    }
    if(options) { options.headers=headers; }
    return rows;
}

function parseHeaders(line,lines) {
  var headers=[];
  var cur='';
  var start=0;
  for(var xa=0; xa<line.length; xa++) {
    var ch=line[xa];
    var isBlank=/^\s*$/.test(ch);
    var atEnd=(xa==line.length-1);
    if ((cur != '' && isBlank) || atEnd) {
      if (atEnd) { cur+=ch; }
      headers.push({header:cur,start:start,end:xa-1,ltr:true}); cur='';
    }
    else if(!isBlank) {
      if (cur == '') { start=xa; }
      cur+=ch;
    }
  }
  for(var xx=0; xx<headers.length; xx++) {
    var hh=headers[xx];
    var hs=hh.start;
    var he=hh.end;
    for(var xa=0; xa<lines.length; xa++) {
      // For each header, for each line,
      // if non-blank in both first of header columns, and the one before it,
      // as well as non-blank in last of a given header's columns,
      // then this is not ltr, but rtl, and first header column decreases by one
      var cl=lines[xa];
      var pp=cl[hh.start-1];
      if (!pp) { pp=' '; }
      var isBlank1=/^\s*$/.test(cl[hs]);   // First header column
      var isBlank2=/^\s*$/.test(pp); // 1 before first header column
      var isBlank3=/^\s*$/.test(cl[he]);   // Last header column
      if (isBlank3) { headers[xx].ltr=true; }
      else if (!isBlank1 && !isBlank2 && !isBlank3) {
        headers[xx].ltr=false;
        headers[xx].start--;
      }
      else if (isBlank1) { headers[xx].ltr=false; }
    }
  }
  return headers;
}

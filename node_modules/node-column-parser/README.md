# node-column-parser
Intended to provide better shell output to Javascript object parsing, turning a whitespace-delimited table (such as ps aux) returns, into an array of Javascript objects, each object keyed on column headers, using row values.

## Credits
https://github.com/namshi/node-shell-parser/
for the idea and outline for this README (but not for the implementation).  I tried it first and found it buggy so decided to make a better one from scratch.

## Install

You can install this library through [NPM](https://www.npmjs.org/package/node-column-parser):

```bash
npm install node-column-parser
```

## Definition:

```javascript
  columnParser(shellOutput, options);
```

* `shellOutput`: the string resulting from running your command
* `options`: Currently an optional empty object which will contain a headers object on return

## Usage

Execute a process, get its output and then simply
feed it to the parser:

``` javascript

var columnParser=require("node-column-parser");

var util=require('util');

const exec = require('child_process').exec;
exec('ps u', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  var options={};
  var rows=columnParser(stdout, options);
  console.log("rows.length="+rows.length+"\n"+util.inspect(rows));
  console.log("HEADERS:\n"+util.inspect(options.headers));
  console.log(`stderr: ${stderr}`);
});
```

Execution results:

```
WarrenMac:node-column-parser warren.downs$ node pstest.js
[ { USER: 'warren.downs',
    PID: '84777',
    '%CPU': '0.0',
    '%MEM': '0.2',
    VSZ: '057464',
    RSS: '9848',
    TT: 's000',
    STAT: 'R+',
    STARTED: '4:49PM',
    TIME: '0:00.08',
    COMMAND: 'node pstest.js' },
  { USER: 'warren.downs',
    PID: '84320',
    '%CPU': '0.0',
    '%MEM': '0.0',
    VSZ: '463084',
    RSS: '1592',
    TT: 's001',
    STAT: 'S+',
    STARTED: '4:05PM',
    TIME: '0:00.01',
    COMMAND: '-bash' },
  { USER: 'warren.downs',
    PID: '14166',
    '%CPU': '0.0',
    '%MEM': '0.0',
    VSZ: '463084',
    RSS: '980',
    TT: 's000',
    STAT: 'S',
    STARTED: '12Jul16',
    TIME: '0:01.02',
    COMMAND: '-bash' } ]
HEADERS:
[ { header: 'USER', start: 0, end: 3, ltr: true },
  { header: 'PID', start: 13, end: 17, ltr: false },
  { header: '%CPU', start: 20, end: 23, ltr: false },
  { header: '%MEM', start: 25, end: 28, ltr: false },
  { header: 'VSZ', start: 32, end: 37, ltr: false },
  { header: 'RSS', start: 41, end: 44, ltr: false },
  { header: 'TT', start: 46, end: 49, ltr: false },
  { header: 'STAT', start: 52, end: 55, ltr: true },
  { header: 'STARTED', start: 57, end: 63, ltr: false },
  { header: 'TIME', start: 67, end: 73, ltr: false },
  { header: 'COMMAND', start: 75, end: 80, ltr: true } ]
stderr: 


```

## Command-lines containing spaces

Changing e.g. "ps u" to "ps aux" turns e.g.
```
USER              PID  %CPU %MEM      VSZ    RSS   TT  STAT STARTED      TIME COMMAND
warren.downs      432   0.4  2.2  2895776 181368   ??  S    11Jul16  43:30.62 /Applications/Google Drive.app/Contents/MacOS/Google Drive
```
into
```
  { USER: 'warren.downs',
    PID: '432',
    '%CPU': '0.4',
    '%MEM': '2.2',
    VSZ: '2895776',
    RSS: '181368',
    TT: '??',
    STAT: 'S',
    STARTED: '11Jul16',
    TIME: '43:30.62',
    COMMAND: '/Applications/Google Drive.app/Contents/MacOS/Google Drive' },
```

As long as the headers line up in a tabular manner, or the space-containing command line is the last column in the table,
parsing should work fine.

## How it works
Parsing basically replicates how a human would visually scan a whitespace-delimited table.  The column headers give
a starting point for the table columns, and scanning the entire table tells us whether a column is right or left
aligned.

If the rightmost character in a row below a column header area is always non-blank, as well as the leftmost character,
and the one to it's left, then the column is definitely right-aligned (see e.g. VSZ, RSS, and TIME, above).

If there's not enough data to tell, then it doesn't matter (see PID, TT).  In the above example, %CPU and %MEM are
technically right-aligned but this algorithm doesn't care unless the values expand to the left beyond the header's
starting column.

If a column is right-aligned expanding to the left, the actual starting point of the left-most data of a column
in any row, is used for all the data rows.

var columnParser=require("node-column-parser");

var util=require('util');

const exec = require('child_process').exec;
exec('ps aux', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  var options={};
  console.log(columnParser(stdout, options));
  console.log("HEADERS:\n"+util.inspect(options.headers));
  console.log(`stderr: ${stderr}`);
});

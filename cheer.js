const cheerio = require('cheerio');

var $ = cheerio.load(
    "<html><head><title>Test</title><div id='headhide' style='display:none'></div></head><body><h1>Hello</h1><ul id='try'><li>first</li><li>2nd</li></ul></body></html>");

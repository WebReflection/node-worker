// require(module) example
var consolemd = require('consolemd');

// it will log on node via consolemd
// and its Markdown capabilities
onmessage = function (event) {
  consolemd.log(event.data);
};
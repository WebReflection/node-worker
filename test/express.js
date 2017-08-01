var PORT = process.env.PORT || 3000;

var express = require('express');
var nodeWorker = require('../server.js');

var app = nodeWorker(express());
app.get('/', function (req, res) {
  res.writeHead(200, 'OK', {
    'Content-Type': 'text/html'
  });
  res.end(require('fs').readFileSync(__dirname + '/test.html'));
});
app.listen(PORT, () => {
  console.log('listening on http://localhost:' + PORT);
});
var PORT = process.env.PORT || 3000;

var http = require('http').createServer(handler);
var nodeWorker = require('../server.js');
var app = nodeWorker(http);
app.listen(PORT, () => {
  console.log('listening on http://localhost:' + PORT);
});

function handler(req, res) {
  res.writeHead(200, 'OK', {
    'Content-Type': 'text/html'
  });
  res.end(require('fs').readFileSync(__dirname + '/test.html'));
}
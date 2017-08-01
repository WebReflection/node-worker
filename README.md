# node-worker
Web Worker like API to drive NodeJS files

### Concept

Instead of having an [Electron](https://electron.atom.io/) like environment,
this module make it possible to use NodeJS through the browser,
using a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) like mechanism.

All workers file must be inside a `workers` directory within the application folder.


### Basic Example

**NodeJS**
```js
var index = require('fs').readFileSync(__dirname + '/index.html');

var http = require('http').createServer(handler);
var nodeWorker = require('node-worker');

var app = nodeWorker(http);
app.listen(process.env.PORT);

function handler(req, res) {
  res.writeHead(200, 'OK', {
    'Content-Type': 'text/html'
  });
  res.end(index);
}
```

**Express**
```js
var index = require('fs').readFileSync(__dirname + '/index.html');

var express = require('express');
var nodeWorker = require('node-worker');

var app = nodeWorker(express());
app.get('/', handler);
app.listen(process.env.PORT);

function handler(req, res) {
  res.writeHead(200, 'OK', {
    'Content-Type': 'text/html'
  });
  res.end(index);
}
```

```html
<!doctype html>
<!-- socket.io must be available before /node-worker.js -->
<script src="/socket.io/socket.io.js"></script>
<script src="/node-worker.js"></script>
<script>
var nw = new NodeWorker('echo.js');
nw.postMessage({hello: "world"});
nw.onmessage = function (event) {
  console.log(event);
};
nw.onerror = function (error) {
  console.error(error);
};
</script>
```
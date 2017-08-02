# node-worker

[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC) [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/WebReflection/donate)

Web Worker like API to drive NodeJS files

`npm install @webreflection/node-worker`

### Concept

The aim of this project is to provide an alternative to [Electron](https://electron.atom.io/) environment.
This might be particularly useful in those platforms with constrains such Raspberry Pi Zero or 1.

The module is based on the standard [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) API.

You can `postMessage(data)` and receive `onmessage = (data) => {}` on both client and server.

All workers files must be inside a `workers` directory within the application folder.

Every worker is a [sandboxed VM](https://nodejs.org/api/vm.html) and it runs on the backend: nothing is shared directly with the browser.

### Basic Example

**NodeJS**
```js
var index = require('fs').readFileSync(__dirname + '/index.html');

var http = require('http').createServer(handler);
var nodeWorker = require('@webreflection/node-worker');

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
var nodeWorker = require('@webreflection/node-worker');

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

**Demo index.html**
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

**workers/echo.js**
```js
// simple echo
// when some data arrives
// same data goes back
onmessage = function (e) {
  postMessage(e.data);
};
```

You can clone and run `npm test` after an `npm install`.
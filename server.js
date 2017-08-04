// core modules
var crypto = require('crypto');
var fs = require('fs');
var http = require('http');
var path = require('path');
var vm = require('vm');

// dependencies
var socketIO = require('socket.io');

// local constants / variables
// used as communication channel
var SECRET = crypto.randomBytes(32).toString('hex');

var jsContent = fs.readFileSync(path.join(__dirname, 'client.js'))
                  .toString()
                  .replace('${SECRET}', SECRET);

var workers = path.resolve(path.join(process.cwd(), 'workers'));

// return a new Worker sandbox
function createSandbox(filename, socket) {
  var sandbox = {
    __filename: filename,
    __dirname: path.dirname(filename),
    postMessage: function postMessage(data) { message(socket, data); },
    console: console,
    process: process,
    Buffer: Buffer,
    clearImmediate: clearImmediate,
    clearInterval: clearInterval,
    clearTimeout: clearTimeout,
    setImmediate: setImmediate,
    setTimeout: setTimeout,
    module: module,
    require: require
  };
  return (sandbox.global = sandbox);
}

// notify the socket there was an error
function error(socket, error) {
  socket.emit(SECRET + ':error', JSON.stringify(error));
}

// send serialized data to the client
function message(socket, data) {
  socket.emit(SECRET + ':message', JSON.stringify({data: data}));
}

// used to send /node-worker.js client file
function responder(request, response, next) {
  response.writeHead(200, 'OK', {
    'Content-Type': 'application/javascript'
  });
  response.end(jsContent);
  if (next) next();
}

module.exports = function (app) {
  var io;
  var native = app instanceof http.Server;
  if (native) {
    io = socketIO(app);
    var request = app._events.request;
    app._events.request = function (req) {
      return /^\/node-worker\.js(?:\?|$)/.test(req.url) ?
        responder.apply(this, arguments) :
        request.apply(this, arguments);
    };
  } else {
    var wrap = http.Server(app);
    io = socketIO(wrap);
    app.get('/node-worker.js', responder);
    Object.defineProperty(app, 'listen', {
      configurable: true,
      value: function () {
        wrap.listen.apply(wrap, arguments);
        return app;
      }
    });
  }
  io.on('connection', function (socket) {
    var sandbox;
    var queue = [];
    function message(data) {
      if (sandbox) {
        if ('onmessage' in sandbox) {
          try {
            sandbox.onmessage({data: data});
          } catch(e) {
            error(socket, {message: e.message});
          }
        }
      }
      else queue.push(data);
    }
    socket.on(SECRET, message);
    socket.on(SECRET + ':setup', function (worker) {
      var filename = path.resolve(path.join(workers, worker));
      if (filename.indexOf(workers)) {
        error(socket, {message: 'Unauthorized worker: ' + worker});
      } else {
        fs.readFile(filename, function (err, content) {
          if (err) {
            error(socket, {message: 'Worker not found: ' + worker});
          } else {
            sandbox = createSandbox(filename, socket);
            vm.createContext(sandbox);
            vm.runInContext(content, sandbox);
            while (queue.length) {
              setTimeout(message, queue.length * 100, queue.pop());
            }
          }
        });
      }
    });
    socket.on('disconnect', function () {
      sandbox = null;
    });
  });
  return app;
};

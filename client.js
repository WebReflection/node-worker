var NodeWorker = (function (SECRET, io, sockets) {'use strict';

  addEventListener('before', function () {
    while (instances.length) instances[0].terminate();
  });

  var instances = [];
  var sPO = Object.setPrototypeOf ||
            function (o, p) {
              o.__proto__ = p;
              return o;
            };

  function error(data) {
      this.onerror(sPO(JSON.parse(data), Error.prototype));
  }

  function message(data) {
      this.onmessage(JSON.parse(data));
  }

  function NodeWorker(worker) {
    /*! Copyright 2017 Andrea Giammarchi - @WebReflection
     *
     * Permission to use, copy, modify, and/or distribute this software
     * for any purpose with or without fee is hereby granted,
     * provided that the above copyright notice
     * and this permission notice appear in all copies.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS
     * ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING
     * ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.
     * IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL,
     * DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR
     * ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE,
     * DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT,
     * NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     */
    if (-1 < instances.indexOf(this)) {
      throw new Error('invalid invoke');
    }
    var socket = io();
    instances.push(this);
    sockets.set(this, socket);
    socket.on(SECRET + ':error', error.bind(this));
    socket.on(SECRET + ':message', message.bind(this));
    socket.emit(SECRET + ':setup', worker);
  }

  Object.defineProperties(
    NodeWorker.prototype,
    {
      postMessage: {
        configurable: true,
        value: function postMessage(message) {
          sockets.get(this).emit(SECRET, JSON.stringify(message));
        }
      },
      terminate: {
        configurable: true,
        value: function terminate() {
          instances.splice(instances.indexOf(this), 1);
          sockets.get(this).destroy();
        }
      },
      onerror: {
        configurable: true,
        writable: true,
        value: function onerror() {}
      },
      onmessage: {
        configurable: true,
        writable: true,
        value: function onmessage() {}
      }
    }
  );

  return NodeWorker;

}(
  '${SECRET}',
  io,
  typeof WeakMap === 'undefined' ?
    {
      get: function (obj) { return obj.__NodeWorker; },
      set: function (obj, value) {
        Object.defineProperty(obj, '__NodeWorker', {
          configurable: true,
          value: value
        });
      }
    } :
    new WeakMap()
));
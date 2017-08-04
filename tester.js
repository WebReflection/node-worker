// var echo = require('./tester')('./workers/echo.js');
// echo.onmessage = console.info;
// echo.postMessage('hello');
module.exports = function (name) {
  var onmessage;
  var mock = {
    onmessage: function () {},
    postMessage: function (value) {
      if (onmessage) onmessage({data: value});
      else console.error('no onmessage was defined');
    }
  };
  global.postMessage = function (value) {
    mock.onmessage(value);
  };
  Object.defineProperty(
    global,
    'onmessage',
    {
      configurable: true,
      set: function (value) {
        console.log('TRIGGERED');
        onmessage = value;
      }
    }
  );
  require(name);
  return mock;
};
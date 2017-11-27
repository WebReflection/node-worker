// simple echo
// when some data arrives
// same data goes back
onmessage = function (e) {
  setTimeout(() => shenanigans(), 1000);
  postMessage(e.data);
};

process.on('uncaughtException', console.error);

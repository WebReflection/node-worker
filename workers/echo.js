// simple echo
// when some data arrives
// same data goes back
onmessage = function (e) {
  postMessage(e.data);
};
// simple echo
// when dome data arrives
// same data goes back
onmessage = function (e) {
  postMessage(e.data);
};
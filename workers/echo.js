// simple echo
// when dome data arrives
// some data goes back
onmessage = function (e) {
  postMessage(e.data);
};
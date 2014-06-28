var pull = require("pull-stream");
var flow = require("pull-flow");
var substream = require("../");


var asyncStream = pull.Through(function (read) {
  return function (end, cb) {
    read(end, function (end, data) {
      if (end) return cb(end);
      setTimeout( function () {
        cb(end, data)
      },Math.round(Math.random()*1000+1000));
    });
  }
})

pull(
  pull.values([1,2,3,4,5,6]),
  substream( function (msg) {
    return pull(
      asyncStream(),
      asyncStream()
    )
  },2),
  flow.parallel(2),
  pull.drain(console.log)
)
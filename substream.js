var _ = require("underscore");
var pull = require("pull-stream");
var pushable = require("pull-pushable");

module.exports = pull.Through(function (read, createThroughStream, contexts) {
  contexts = contexts || 1;

  var substreams = [], subcount = 0, cbs = [], queue = [], ended;
  return function (end, cb) {
    ended = ended || (end === true);
    cbs.push(cb);

    ;(function drain() {
      if (ended && !queue.length && !subcount && cbs.length) {
        cbs.shift()(true);
        return drain();
      }

      while (queue.length && cbs.length)
        cbs.shift()(queue[0][0], queue.shift()[1]);

      while (!ended && subcount < contexts) {
        ++subcount;
        read(null,  function (end, data) {
          --subcount;
          if (end === true) {ended = true; return drain();}
          if (end) { queue.push([end, data]); return drain(); }

          var source = pushable();
          substreams.push(pull(
            source,
            createThroughStream(data)
          ));
          ++subcount;
          source.push(data);
          source.end();
          drain();
        })
      }

      while (subcount && cbs.length && substreams.length) {
        var sub = substreams.shift();
        var cb = cbs.shift();
        sub(null,  function (end, data) {
          --subcount;
          cbs.unshift(cb);
          if (end === true) { return drain(); }

          queue.push([end, data]);
          substreams.push(sub);
          ++subcount;
          drain();
        });
      }
    })();
  }
})
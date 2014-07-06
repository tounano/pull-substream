var _ = require("underscore");
var pull = require("pull-stream");
var spawn = require("pull-spawn");
var robin = require("pull-robin");
var substream = module.exports = pull.Through(function (read, throughCreator, contexts) {
  contexts = contexts || 1;

  var streams = [];
  for (var i=0; i<contexts; ++i) {
    streams.push(spawn.isolate(throughCreator)(read));
  }

  return robin(streams);
});
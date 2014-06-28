# pull-substream

Multiple execution contexts for pull substreams.

Sometimes, when processing events you need to isolate each event in an isolated context (think of it like a thread).

For example, let's say that each event would result in several HTTP requests, where all the requests for a certain event
should use the same cookie jar.

In order to achieve such behaviour, you have to isolate each event in a separate context.

This isolated context is a substream.

## Usage

### substream(createThroughStream, ?contexts)

`pull-substream` is a Through stream that creates a new instance of a given `Through` stream for each event. A substream
will end, once it finished processing a single event.

### Args

*  `createThroughStream` - a callback that creates a Through stream. This callback will get `msg` as an argument. `msg` is
the event that is going to be dispatched by the current substream.
*  `contexts` - The amount of parallel execution contexts. (Default=1).

### Parallelism

`pull-substream` won't execute in paralel. The way it works is that it simply holds X amount of concurrent contexts. Each
time data will be requested, `pull-substream` will pull the data from the next `context` in a round-robin fashion.

Once a substream finished dispatching an event, the context would end and a new context will be created instead with a
new event pulled.

In order to have true parallelism use [pull-flow](https://github.com/dominictarr/pull-flow) together with `pull-substream`.

## Example

```js
var pull = require("pull-stream");
var flow = require("pull-flow");
var substream = require("pull-substream");

// Dummy async stream.
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
    // `msg` is the event that is being dispatched
    return pull(
      asyncStream(),
      asyncStream()
    )
  },2),
  flow.parallel(2), // We'll execute those contexts in parallel
  pull.drain(console.log)
)
```

## install

With [npm](https://npmjs.org) do:

```
npm install pull-substream
```

## license

MIT
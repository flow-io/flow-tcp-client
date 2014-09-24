TCP Client
===
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependencies][dependencies-image]][dependencies-url]

> Factory for creating TCP clients.


## Installation

``` bash
$ npm install flow-tcp-client
```

For use in the browser, use [browserify](https://github.com/substack/node-browserify).


## Usage

To create a TCP client,

``` javascript
var createClient = require( 'flow-tcp-client' );

var client = createClient();
```

TCP clients are configurable and have the following methods...


#### client.host( [host] )

This method is a setter/getter. If no `host` is provided, the method returns the configured `host`. By default, the client `host` is `127.0.0.1`. To point to a remote `host`,

``` javascript
client.host( '192.168.92.11' );
```


#### client.port( [port] )

This method is a setter/getter. If no `port` is provided, the method returns the configured `port`. By default, the client `port` is `7331`. To set a `port`,

``` javascript
client.port( 8080 );
```


#### client.connect()

Creates a TCP socket connection.

``` javascript
client.connect();
```


#### client.status()

Returns the current connection status. If a socket connection exists, returns `true`. If no socket connection exists, returns `false`.

``` javascript
client.status();
```


#### client.strict( [bool] )

This method is a setter/getter. If no boolean `flag` is provided, the method returns the strict setting. By default, the socket enforces strict type checking on socket writes. To turn off strict mode,

``` javascript
client.strict( false );
```


#### client.write( string[, clbk] )

Writes to a socket connection. If strict mode is `off`, no type checking of input arguments occurs. An optional callback is invoked after writing data to the socket. To write to the socket,

``` javascript
var data = {
		'value': [ Date.now(), Math.random() ],
		'stats': {
			'load': 83,
			'mem': 0.34
		}
	};

data = JSON.stringify( data ) + '\n';

client.write( data, function ack() {
	console.log( '...data written...' );
});
```


#### client.stream()

Returns a socket stream.

``` javascript
var stream = client.stream();
```

Note: in order to return a socket stream, a socket connection must first be established.

Additionally, note that the returned `stream` conforms to the Node.js [stream](http://nodejs.org/api/stream.html) interface.

``` javascript
var eventStream = require( 'event-stream' );

// Create some data:
var data = [ 'beep\n', 'boop\n', 'bop\n', 'bip\n', 'bap\n' ];

// Create a readable stream:
var readStream = eventStream.readArray( data );

// Get the client stream:
var socketStream = client.stream();

// Pipe the data...
readStream.pipe( socketStream );
```


#### client.end()

Closes a socket connection. To close a socket,

``` javascript
client.end();
```


### Events

#### 'connect'

The socket emits a `connect` event upon successfully establishing a socket connection. To register a listener,

``` javascript
client.addListener( 'connect', function onConnect() {
	console.log( '...connected...' );
});
```


#### 'error'

The socket emits an `error` event upon encountering an error. To register a listener,

``` javascript
client.addListener( 'error', function onError( error ) {
	console.error( error.message );
	console.error( error.stack );
});
```


#### 'close'

The socket emits a `close` event when the other end of the connection closes the socket. To register a listener,

``` javascript
client.addListener( 'close', function onClose() {
	console.log( '...socket closed...' );
	console.log( '...attempting to reconnect in 5 seconds...' );
	setTimeout( function reconnect() {
		client.connect();
	}, 5000 );
});
```


#### 'warn'

The socket emits a `warn` event when attempting to create a new socket connection when a connection already exists. To register a listener,

``` javascript
client.addListener( 'warn', function onWarn( message ) {
	console.warn( message );
});
```


## Notes

When used as setters, all setter/getter methods are chainable. For example,

``` javascript
var createClient = require( 'flow-tcp-client' ),
	client = createClient();

client
	.host( '192.168.92.111' )
	.port( 8080 )
	.strict( false )
	.connect();
```



## Examples

``` javascript
var createClient = require( 'flow-tcp-client' );

var client = createClient();

client
	.host( '192.168.92.111' )
	.port( 4243 )
	.strict( false );

client.on( 'error', onError );
client.on( 'close', onClose );
client.on( 'connect', onConnect );

connect();

function connect() {
	client.connect();
}

function onError( error ) {
	console.error( error.message );
	console.error( error.stack );
}

function onClose() {
	console.log( '...attempting to reconnect in 2 seconds...' );
	setTimeout( function reconnect() {
		connect();
	}, 2000 );
}

function onConnect() {
	for ( var i = 0; i < 100; i++ ) {
		write( i );
	}
}

function write( idx ) {
	setTimeout( function onTimeout() {
		if ( client.status() ) {
			client.write( newLine(), onWrite );
		}
	}, 1000*idx );
}

function newLine() {
	var time = Date.now(),
		val = Math.random(),
		data;

	data = {
		'value': [ time, val ]
	};

	return JSON.stringify( data ) + '\n';
}

function onWrite() {
	console.log( '...data written to socket...' );
}
```

To run the example code from the top-level application directory,

``` bash
$ node ./examples/index.js
```


## Tests

### Unit

Unit tests use the [Mocha](http://visionmedia.github.io/mocha) test framework with [Chai](http://chaijs.com) assertions. To run the tests, execute the following command in the top-level application directory:

``` bash
$ make test
```

All new feature development should have corresponding unit tests to validate correct functionality.


### Test Coverage

This repository uses [Istanbul](https://github.com/gotwarlost/istanbul) as its code coverage tool. To generate a test coverage report, execute the following command in the top-level application directory:

``` bash
$ make test-cov
```

Istanbul creates a `./reports/coverage` directory. To access an HTML version of the report,

``` bash
$ open reports/coverage/lcov-report/index.html
```


## License

[MIT license](http://opensource.org/licenses/MIT). 


---
## Copyright

Copyright &copy; 2014. Athan Reines.


[npm-image]: http://img.shields.io/npm/v/flow-tcp-client.svg
[npm-url]: https://npmjs.org/package/flow-tcp-client

[travis-image]: http://img.shields.io/travis/flow-io/flow-tcp-client/master.svg
[travis-url]: https://travis-ci.org/flow-io/flow-tcp-client

[coveralls-image]: https://img.shields.io/coveralls/flow-io/flow-tcp-client/master.svg
[coveralls-url]: https://coveralls.io/r/flow-io/flow-tcp-client?branch=master

[dependencies-image]: http://img.shields.io/david/flow-io/flow-tcp-client.svg
[dependencies-url]: https://david-dm.org/flow-io/flow-tcp-client

[dev-dependencies-image]: http://img.shields.io/david/dev/flow-io/flow-tcp-client.svg
[dev-dependencies-url]: https://david-dm.org/dev/flow-io/flow-tcp-client

[github-issues-image]: http://img.shields.io/github/issues/flow-io/flow-tcp-client.svg
[github-issues-url]: https://github.com/flow-io/flow-tcp-client/issues
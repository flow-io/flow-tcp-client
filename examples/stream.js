/**
*
*	DEMO
*
*
*	DESCRIPTION:
*		- Demonstrates use of a flow TCP socket client to pipe data to a flow TCP socket server.
*
*
*	NOTES:
*		[1] 
*
*
*	TODO:
*		[1] 
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. athan@gmail.com. 2014.
*
*/

(function() {
	'use strict';

	// MODULES //

	var net = require( 'net' ),
		eventStream = require( 'event-stream' ),
		createClient = require( './../lib' );


	// SERVER //

	/**
	* FUNCTION: createServer()
	*	Creates a TCP server.
	*/
	function createServer() {
		var server = net.createServer();

		server.on( 'connection', function onConnection( socket ) {

			socket.on( 'connect', function onConnect() {
				console.log( '...client connected...' );
			});

			socket.on( 'end', function onEnd() {
				console.log( '...client finished writing data...' );
			});

			socket.on( 'close', function onClose() {
				console.log( '...socket closed by client...' );
				server.close();
			});

			socket.on( 'data', function onData( data ) {
				console.log( data.toString() );
			});
		});

		server.on( 'close', function onClose() {
			console.log( '...server closed...' );
		});

		server.on( 'listening', function onListen() {
			console.log( '...server is listening...' );
			createConnection( server.address() );
		});

		server.listen( 0, '127.0.0.1' );
	} // end FUNCTION server()


	// CLIENT //

	/**
	* FUNCTION: createConnection( address )
	*	Creates a TCP client and writes data.
	*
	* @param {Object} address - object containing TCP server address information, such as `host` and `port`.
	*/
	function createConnection( address ) {
		var client = createClient(),
			numData = 5;

		client
			.host( address.address )
			.port( address.port )
			.strict( false );

		client.on( 'error', onError );
		client.on( 'connect', onConnect );

		connect();

		return;
		
		function connect() {
			client.connect();
		}

		function onError( error ) {
			console.error( error.message );
			console.error( error.stack );
		}

		function onConnect() {
			var arr = new Array( numData ),
				readStream;

			// Create some data...
			for ( var i = 0; i < numData; i++ ) {
				arr[ i ] = newLine();
			}

			// Create a readable stream:
			readStream = eventStream.readArray( arr );

			// Bind a listener for when all data is written:
			readStream.on( 'end', function onEnd() {
				client.end();
			});

			// Pipe the data:
			readStream.pipe( client.stream() );
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
	} // end FUNCTION createConnection()


	// RUN //

	createServer();

})();
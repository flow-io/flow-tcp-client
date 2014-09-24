

(function() {
	'use strict';

	// MODULES //

	var // TCP server:
		net = require( 'net' );


	// VARIABLES //

	var PORT = 0, // assigned PORT is random
		HOST = '127.0.0.1';


	// SERVER //

	/**
	* FUNCTION: createServer()
	*	Creates a TCP server.
	*
	* @returns {Server} TCP server
	*/
	function createServer() {
		var server = net.createServer();

		server.on( 'error', function onError( error ) {
			if (error.code === 'EADDRINUSE') {
				console.log( 'Address in use. Retrying in 1 second...');
				setTimeout(function () {
					server.close();
					server.listen( PORT, HOST );
				}, 1000 );
			}
		});

		server.on( 'connection',  function onConnection( socket ) {

			socket.on( 'error', function onError( error ) {
				console.error( '...socket error...' );
				console.error( error.message );
				console.error( error.stack );
			});

		});

		server.listen( PORT, HOST );

		return server;
	} // end FUNCTION createServer()


	// EXPORTS //

	module.exports = createServer;

})();
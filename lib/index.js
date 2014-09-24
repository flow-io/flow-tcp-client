/**
*
*	FLOW: TCP client
*
*
*	DESCRIPTION:
*		- Factory for creating TCP clients.
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
*		Athan Reines. kgryte@gmail.com. 2014.
*
*/

(function() {
	'use strict';

	// MODULES //

	var // Event emitter:
		EventEmitter = require( 'events' ).EventEmitter,

		// TCP connections:
		net = require( 'net' );


	// CLIENT //

	/**
	* FUNCTION: Client()
	*	TCP socket client constructor.
	*
	* @constructor
	* @returns {Client} Client instance
	*/
	function Client() {
		EventEmitter.call( this );

		// Default host: (localhost)
		this._host = '127.0.0.1';
		
		// Default port:
		this._port = 7331;

		// Type checking flag when writing to the socket:
		this._strict = true;

		// Socket connection:
		this._socket = null;

		return this;
	} // end FUNCTION Client()

	/**
	* Create a prototype which inherits from the parent prototype.
	*/
	Client.prototype = Object.create( EventEmitter.prototype );

	/**
	* Set the constructor.
	*/
	Client.prototype.constructor = Client;

	/**
	* METHOD: host( url )
	*	Host URL setter and getter. If a `URL` is supplied, sets the host `URL`. If no `URL` is supplied, returns the host `URL`.
	*
	* @param {String} [url] - host `URL`
	* @returns {Client|String} Client instance or host `URL`
	*/
	Client.prototype.host = function( url ) {
		if ( !arguments.length ) {
			return this._host;
		}
		if ( typeof url !== 'string' ) {
			throw new TypeError( 'host()::invalid input argument. URL must be a string.' );
		}
		if ( !net.isIP( url ) && url !== 'localhost' ) {
			throw new Error( 'host()::invalid input argument. URL is not valid. Ensure valid IP or `localhost`.' );
		}
		this._host = url;
		return this;
	}; // end METHOD host()

	/**
	* METHOD: port( port )
	*	Port setter and getter. If a `port` is supplied, sets the `port`. If no `port` is supplied, returns the `port`.
	*
	* @param {Number} [port] - TSDB `port`
	* @returns {Client|Number} Client instance or `port`
	*/
	Client.prototype.port = function( port ) {
		if ( !arguments.length ) {
			return this._port;
		}
		if ( typeof port !== 'number' || port !== port ) {
			throw new TypeError( 'port()::invalid input argument. Port must be a number.' );
		}
		this._port = port;
		return this;
	}; // end METHOD port()

	/**
	* METHOD: connect()
	*	Establishes a TCP socket connection.
	*
	* @returns {Client} Client instance
	*/
	Client.prototype.connect = function() {
		if ( this._socket ) {
			this.emit( 'warn', {
				'message': 'Socket connection already exists. To create a new connection, end the current connection. To create an additional connection, create a new Client instance.'
			});
			return this;
		}
		this._socket = new net.Socket();

		// Setup socket event forwarding:
		this._socket.on( 'connect', this.emit.bind( this, 'connect' ) );
		this._socket.on( 'error', this.emit.bind( this, 'error' ) );
		this._socket.on( 'close', this.emit.bind( this, 'close' ) );

		// Clear the socket reference when the socket closes:
		this._socket.on( 'close', function() {
			this._socket = null;
		});

		// Create the connection:
		this._socket.connect( this._port, this._host );

		return this;
	}; // end METHOD connect()

	/**
	* METHOD: status()
	*	Returns the current connection status. If socket is not connected, returns `false`. If the socket is connected, returns `true`.
	*
	* @returns {Boolean} connection status
	*/
	Client.prototype.status = function() {
		if ( this._socket ) {
			return true;
		}
		return false;
	}; // end METHOD status()

	/**
	* METHOD: strict( bool )
	*	Type checking during write calls setter and getter. If a boolean flag is supplied, sets the type checking flag. If no boolean flag is provided, returns whether type checking is turned on or off.
	*
	* @param {Boolean} bool - true to enforce type checking and false to turn off type checking when writing to the socket stream
	* @returns {Client|Boolean} Client instance or type checking flag
	*/
	Client.prototype.strict = function( bool ) {
		if ( !arguments.length ) {
			return this._strict;
		}
		if ( typeof bool !== 'boolean' ) {
			throw new TypeError( 'strict()::invalid input argument. Must provide a boolean argument.' );
		}
		this._strict = bool;
		return this;
	}; // end METHOD strict()

	/**
	* METHOD: write( str[, clbk] )
	*	Writes data to the socket stream.
	*
	* @param {String} str - string to write
	* @param {Function} [clbk] - callback to invoke after writing data.
	* @returns {Client} Client instance
	*/
	Client.prototype.write = function( str, clbk ) {
		if ( this._strict ) {
			if ( !this._socket ) {
				throw new Error( 'write()::cannot write. No socket connection.' );
			}
			if ( typeof str !== 'string' ) {
				throw new TypeError( 'write()::invalid input argument. First argument must be a string.' );
			}
			if ( arguments.length > 1 ) {
				if ( typeof clbk !== 'function' ) {
					throw new TypeError( 'write()::invalid input argument. Second argument must be a function.' );
				}
			}
		}
		this._socket.write.apply( this._socket, arguments );
		return this;
	}; // end METHOD write()

	/**
	* METHOD: stream()
	*	Returns a socket stream.
	*
	* @returns {Socket} socket stream
	*/
	Client.prototype.stream = function() {
		if ( !this._socket ) {
			throw new Error( 'stream()::cannot return stream. No socket connection.' );
		}
		return this._socket;
	}; // end METHOD stream()

	/**
	* METHOD: end()
	*	Closes a socket connection.
	*
	* @returns {Client} Client instance
	*/
	Client.prototype.end = function() {
		this._socket.end();
		this._socket = null;
		return this;
	}; // end METHOD end()


	// EXPORTS //

	module.exports = function newClient(){
		return new Client();
	};

})();
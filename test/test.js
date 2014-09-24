
// MODULES //

var // Expectation library:
	chai = require( 'chai' ),

	// Duplex stream base class:
	Duplex = require( 'stream' ).Duplex,

	// Event Emitter:
	EventEmitter = require( 'events' ).EventEmitter,

	// Utility module to create a mock TCP server:
	createServer = require( './utils/tcp_server.js' ),

	// Module to be tested:
	createClient = require( './../lib' );


// VARIABLES //

var expect = chai.expect,
	assert = chai.assert;


// TESTS //

describe( 'flow-socket-client', function tests() {
	'use strict';

	// SETUP //

	var SERVER,
		ADDRESS,
		client;

	before( function setup( done ) {
		SERVER = createServer();
		SERVER.on( 'listening', function onListen() {
			ADDRESS = SERVER.address();
			done();
		});
	});

	beforeEach( function setup() {
		client = createClient();
	});

	// TEARDOWN //

	after( function teardown() {
		SERVER.close();
	});


	// TESTS //

	it( 'should export a factory function', function test() {
		expect( createClient ).to.be.a( 'function' );
	});

	it( 'should generate an event emitter', function test() {
		assert.ok( client instanceof EventEmitter );
	});

	describe( 'host', function tests() {

		it( 'should provide a method to set/get the server host', function test() {
			expect( client.host ).to.be.a( 'function' );
		});

		it( 'should not allow a non-string host', function test() {
			var values = [
					5,
					[],
					{},
					true,
					null,
					undefined,
					NaN,
					function(){}
				];

			for ( var i = 0; i < values.length; i++ ) {
				expect( badValue( values[i] ) ).to.throw( TypeError );
			}

			function badValue( value ) {
				return function() {
					client.host( value );
				};
			}
		});

		it( 'should not allow an invalid host', function test() {
			var values = [
					'badhost',
					'1000.10.10.100'
				];

			for ( var i = 0; i < values.length; i++ ) {
				expect( badValue( values[i] ) ).to.throw( Error );
			}

			function badValue( value ) {
				return function() {
					client.host( value );
				};
			}
		});

		it( 'should set the host', function test() {
			client.host( '192.168.1.172' );
			assert.strictEqual( client.host(), '192.168.1.172' );
		});

	}); // end TESTS host

	describe( 'port', function tests() {

		it( 'should provide a method to set/get the server port', function test() {
			expect( client.port ).to.be.a( 'function' );
		});

		it( 'should not allow a non-numeric port', function test() {
			var values = [
					'5',
					[],
					{},
					true,
					null,
					undefined,
					NaN,
					function(){}
				];

			for ( var i = 0; i < values.length; i++ ) {
				expect( badValue( values[i] ) ).to.throw( TypeError );
			}

			function badValue( value ) {
				return function() {
					client.port( value );
				};
			}
		});

		it( 'should set the port', function test() {
			client.port( 1337 );
			assert.strictEqual( client.port(), 1337 );
		});

	}); // end TESTS port

	describe( 'connect', function tests() {

		it( 'should provide a method to create a socket connection', function test() {
			expect( client.connect ).to.be.a( 'function' );
		});

		it( 'should create a socket connection', function test( done ) {
			// Configure the socket:
			client.on( 'connect', function onConnect() {
				assert.ok( true );
				client.end();
				done();
			});

			// Create a client socket connection:
			client
				.host( ADDRESS.address )
				.port( ADDRESS.port )
				.connect();
		});

		it( 'should not override an existing connection (one connection per socket instance)', function test( done ) {
			// Configure the socket:
			client.on( 'connect', onConnect );
			client.on( 'warn', onWarn );

			// Create a client socket connection:
			client
				.host( ADDRESS.address )
				.port( ADDRESS.port )
				.connect();

			function onConnect() {
				client.connect();
			}

			function onWarn( msg ) {
				assert.ok( true );
				client.end();
				done();
			}
		});

	}); // end TESTS connect()

	describe( 'status', function tests() {

		it( 'should provide a method to determine the current connection status', function test() {
			expect( client.status ).to.be.a( 'function' );
		});

		it( 'should indicate when no socket connection exists', function test( done ) {
			assert.notOk( client.status() );

			client
				.host( ADDRESS.address )
				.port( ADDRESS.port )
				.connect();

			client.on( 'connect', function onConnect() {
				client.end();
			});

			client.on( 'close', function onClose() {
				assert.notOk( client.status() );
				done();
			});
		});

		it( 'should indicate when a socket connection exists', function test( done ) {
			client
				.host( ADDRESS.address )
				.port( ADDRESS.port )
				.connect();

			client.on( 'connect', function onConnect() {
				assert.ok( client.status() );
				client.end();
				done();
			});
		});

	});

	describe( 'strict', function tests() {

		it( 'should provide a method to set/get a type checking level when writing to the socket stream', function test() {
			expect( client.strict ).to.be.a( 'function' );
		});

		it( 'should not allow a non-boolean flag', function test() {
			var values = [
					'5',
					[],
					{},
					5,
					null,
					undefined,
					NaN,
					function(){}
				];

			for ( var i = 0; i < values.length; i++ ) {
				expect( badValue( values[i] ) ).to.throw( TypeError );
			}

			function badValue( value ) {
				return function() {
					client.strict( value );
				};
			}
		});

		it( 'should set a type checking flag', function test() {
			client.strict( false );
			assert.strictEqual( client.strict(), false );
		});

	});

	describe( 'write', function tests() {

		it( 'should provide a method to write to the socket stream', function test() {
			expect( client.write ).to.be.a( 'function' );
		});

		it( 'should throw an error if no connection has been established when in strict mode', function test() {
			client.strict( true );

			expect( foo ).to.throw( Error );

			function foo() {
				client.write( 'beep' );
			}
		});

		it( 'should not allow a non-string to be written to the socket when in strict mode', function test( done ) {
			var values = [
					5,
					[],
					{},
					true,
					null,
					undefined,
					NaN,
					function(){}
				];

			// Configure the socket:
			client.on( 'connect', function onConnect() {
				for ( var i = 0; i < values.length; i++ ) {
					expect( badValues( values[i] ) ).to.throw( TypeError );
				}
				client.end();
				done();
			});

			// Create a client socket connection:
			client
				.host( ADDRESS.address )
				.port( ADDRESS.port )
				.strict( true )
				.connect();

			function badValues( value ) {
				return function() {
					client.write( value, function(){} );
				};
			}
		});

		it( 'should ensure the callback is a function when in strict mode', function test( done ) {
			var values = [
					5,
					[],
					{},
					true,
					null,
					undefined,
					NaN,
					'5'
				];

			// Configure the socket:
			client.on( 'connect', function onConnect() {
				for ( var i = 0; i < values.length; i++ ) {
					expect( badValues( values[i] ) ).to.throw( TypeError );
				}
				client.end();
				done();
			});

			// Create a client socket connection:
			client
				.host( ADDRESS.address )
				.port( ADDRESS.port )
				.strict( true )
				.connect();

			function badValues( value ) {
				return function() {
					client.write( 'beep', value );
				};
			}
		});

		it( 'should not enforce type checking when not in strict mode', function test( done ) {
			var values = [
					5,
					[],
					{},
					true,
					null,
					undefined,
					NaN,
					function(){}
				];

			// Configure the socket:
			client.on( 'connect', function onConnect() {
				for ( var i = 0; i < values.length; i++ ) {
					expect( badValues( values[i] ) ).to.not.throw( TypeError );
				}
				client.end();
				done();
			});

			// Create a client socket connection:
			client
				.host( ADDRESS.address )
				.port( ADDRESS.port )
				.strict( false )
				.connect();

			function badValues( value ) {
				return function() {
					try {
						client.write( value );
					} catch ( error ) {
						// Expected behavior...
						return;
					}
					throw new Error();
				};
			}
		});

		it( 'should write to the socket stream', function test( done ) {
			var expected = 'beep\n';

			// Configure the server:
			SERVER.on( 'connection', onSocket );

			// Configure the socket:
			client.on( 'connect', function onConnect() {
				client.write( expected );
			});

			// Create a client socket connection:
			client
				.host( ADDRESS.address )
				.port( ADDRESS.port )
				.strict( true )
				.connect();

			function onSocket( sSocket ) {
				sSocket.on( 'data', function onData( actual ) {
					assert.strictEqual( actual.toString(), expected );
					SERVER.removeListener( 'connection', onSocket );
					client.end();
					done();
				});
			}
		});

		it( 'should invoke a callback when finished writing to the socket', function test( done ) {
			// Configure the socket:
			client.on( 'connect', function onConnect() {
				client.write( 'beep', onFinish );
			});

			// Create a client socket connection:
			client
				.host( ADDRESS.address )
				.port( ADDRESS.port )
				.strict( true )
				.connect();

			function onFinish() {
				assert.ok( true );
				client.end();
				done();
			}
		});

	}); // end TESTS write()

	describe( 'stream', function tests() {

		it( 'should provide a method to return a socket stream', function test() {
			expect( client.stream ).to.be.a( 'function' );
		});

		it( 'should throw an error if no connection exists', function test() {
			expect( foo ).to.throw( Error );
			function foo() {
				client.stream();
			}
		});

		it( 'should return a socket stream', function test( done ) {
			// Configure the socket:
			client.on( 'connect', function onConnect() {
				assert.ok( client.stream() instanceof Duplex );
				client.end();
				done();
			});

			// Create a client socket connection:
			client
				.host( ADDRESS.address )
				.port( ADDRESS.port )
				.connect();
		});

	}); // end TESTS stream()

	describe( 'end', function tests() {

		it( 'should provide a method to end a socket connection', function test() {
			expect( client.end ).to.be.a( 'function' );
		});

		it( 'should end a socket connection', function test( done ) {
			// Configure the socket:
			client.on( 'connect', function onConnect() {
				client.end();
			});

			client.on( 'close', function onClose( flg ) {
				if ( flg ) {
					assert.ok( false, 'Socket closed due to an error.' );
					done();
					return;
				}
				assert.ok( true );
				done();
			});

			// Create a client socket connection:
			client
				.host( ADDRESS.address )
				.port( ADDRESS.port )
				.strict( true )
				.connect();
		});

	}); // end TESTS end()

});
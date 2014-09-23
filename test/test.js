
// MODULES //

var // Expectation library:
	chai = require( 'chai' ),

	// Module to be tested:
	flowFactory = require( './../lib' );


// VARIABLES //

var expect = chai.expect,
	assert = chai.assert;


// TESTS //

describe( 'flow-socket', function tests() {
	'use strict';

	it( 'should export a factory function', function test() {
		expect( flowFactory ).to.be.a( 'function' );
	});

	it( 'should do something' );

});
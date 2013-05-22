//require necessary packages
var osc = require( 'node-osc' ),
	http = require('http'),
	ws = require( 'socket.io' ),
	fs = require( 'fs' );

// create server
var server = http.createServer( function( request, response ){
	fs.readFile( __dirname + '/public/index.html', function( error, data ){
		if( error ){
			response.writeHead( 500 );
			return response.end( 'Error loading index.html' );
		}
		response.writeHead( 200 );
		response.end( data );
	});
});	

server.listen( 3000 );

// sockets setup
var sock;
var io = ws.listen( server );
io.sockets.on( 'connection', function( socket ){
	sock = socket;
	socket.emit( 'info', { data: 'Connection made.' } );
	socket.on( 'comm', function( data ){
		// console.log( data );
	});
});

// osc communication setup
var oscServer = new osc.Server( 8000, '127.0.0.1' );

oscServer.on( "message", function( msg, rinfo ){
	switch( msg[0] ){
		case "/position":
			sock.emit( 'osc-position-change', { position: msg[1] } );
		break;
		case "/msg":
			if( msg[1].length > 0){
				sock.emit( 'osc-new', { url: msg[1] } );
			} else {
				sock.emit( 'osc-disconnect', { message: 'bye bye' } );
			}
		break;
	}
	
});
//require necessary packages
var osc = require( 'node-osc' ),
	http = require('http'),
	ws = require( 'socket.io' ),
	fs = require( 'fs' );

var App = function(){
	this.server
	this.io;
	this.isSocketConnected = false
	this.socket;
	this.oscServer;
};

App.prototype = {
	begin: function(){
		this.server = http.createServer( this.serverRequest );
		this.server.listen( 3000 );
		this.io = ws.listen( this.server, { log: false } );
		this.oscServer = new osc.Server( 8000, '127.0.0.1' );
		this.socketsListen();
		this.oscListen();
	},
	serverRequest: function( request, response ){
		var that = this;
		fs.readFile( __dirname + '/public/index.html', function( error, data ){
			if( error ){
				response.writeHead( 500 );
				return response.end( 'Error loading index.html' );
			}
			response.writeHead( 200 );
			response.end( data );
		});
	},
	socketsListen: function(){
		var that = this;
		this.io.sockets.on( 'connection', function( socket ){
			that.socket = socket;
			that.isSocketConnected = true;
			that.socket.emit( 'info', { connected: true } );			
		});
	},
	oscListen: function(){
		var that = this;
		this.oscServer.on( "message", function( msg, rinfo ){
			if( that.isSocketConnected ){
				switch( msg[0] ){
					case "/position":					
						that.socket.emit( 'osc-position-change', { position: msg[1] } );
					break;
					case "/msg":
						if( msg[1].length > 0){
							that.socket.emit( 'osc-new', { url: msg[1] } );
						} else {
							that.socket.emit( 'osc-disconnect', { message: 'bye bye' } );
						}
					break;
				}
			}
		});
	}
}


var interactiveBrowser = new App();

interactiveBrowser.begin();
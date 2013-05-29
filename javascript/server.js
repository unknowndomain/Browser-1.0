//require necessary packages
var http = require('http'),
	ws = require( 'socket.io' ),
	fs = require( 'fs' ),
	gs = require( './files.js' ),
	SerialPort = require( 'serialport' ).SerialPort;
	
var App = function(){
	this.arduino;
	this.server
	this.io;
	this.isSocketConnected = false;
	this.isArduinoAvailable = false;
	this.socket;
	this.cardSensor = 0;
	//Tom's arduino
	//this.arduinoPort = "/dev/tty.usbmodemfa121";
	//Olly's arduino
	this.arduinoPort = "/dev/tty.usbmodem411";
};

App.prototype = {
	begin: function(){
		this.server = http.createServer( this.serverRequest );
		this.server.listen( 3000 );
		this.io = ws.listen( this.server, { log: false } );
		this.socketsListen();		
		this.arduino = new SerialPort( this.arduinoPort, { baudrate: 115200, buffersize: 255 * 5 } );	
		this.arduinoListen();
		console.log( __dirname );
	},
	serverRequest: function( request, response ){	
		var that = this;
		console.log( '"' + request.url + '"' );
		var file = ( request.url === '/' ) ? 'index.html' : request.url;
		fs.readFile( __dirname + '/public/' + file, function( error, data ){
			if( error ){
				response.writeHead( 500 );
				return response.end( error + 'Error loading ' + request.url );
			}
			response.writeHead( 200 );
			response.end( data );
		});
	},
	socketsListen: function(){
		var that = this;
		this.io.sockets.on( 'connection', function( socket ){
			console.log( "* Connected to Chrome WebSocket." );
			that.socket = socket;
			that.isSocketConnected = true;
			that.socket.emit( 'info', { connected: true } );
		});
	},
	arduinoListen: function () {
		var that = this;
		this.arduino.on( 'open', function () {
			console.log( "* Connected to Arduino." );
			that.arduino.on( 'data', function( data ) {
				data = data.toString().trim();
				if ( data.match( "^(0|1),([0-9]{1,4})$" ) ) {
					var button = parseInt( data.match( "^(0|1),([0-9]{1,4})$" ).slice(1)[0] );
					var slider = parseInt( data.match( "^(0|1),([0-9]{1,4})$" ).slice(1)[1] );
					
					if ( that.isSocketConnected )
						if ( that.cardSensor != button )
							that.sensorListen( that.cardSensor, button );
						
					that.cardSensor = button;
					
					if ( that.isSocketConnected )
						that.socket.emit( 'osc-position-change', { position: mapValue( slider, 0, 1023, 0, 10 ) } );
				}				
	    	} );
		} );
	},
	sensorListen: function( oldValue, newValue ) {
		var that = this;
		
		if ( oldValue && ! newValue )
			that.socket.emit( 'osc-disconnect', { message: 'bye bye' } );
			
		if ( ! oldValue && newValue )
			gs.getStudent( "http://open.gdnm.org/alba-santiago-blair", function ( e, data ) { 
				if ( ! e ) {
					that.socket.emit( 'osc-new', data );
				} else {
					console.log( e );
					that.socket.emit( 'osc-disconnect', { message: 'bye bye' } );
				}
			} );
	}
}

var interactiveBrowser = new App();
interactiveBrowser.begin();

mapValue = function( val, origMin, origMax, newMin, newMax ){
	return newMin + ( newMax - newMin ) * ( ( val - origMin ) / ( origMax - origMin ) );
};

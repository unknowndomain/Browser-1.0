//require necessary packages
var osc = require( 'node-osc' ),
	http = require( 'http' ),
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
	this.oscServer;
	this.qr;
};

App.prototype = {
	begin: function(){
		var that = this;
		this.server = http.createServer( this.serverRequest );
		this.server.listen( 3000 );
		this.io = ws.listen( this.server, { log: false } );
		this.socketsListen();
		this.oscServer = new osc.Server( 8000, '127.0.0.1' );
		this.oscListen();
		fs.readdir( '/dev', function( e, ports ) {
			// Find USB Modems (presume they are Arduinos)
			 ports = ports.filter( function ( file ) {
				 if ( file.match( '^tty\.usbmodem' ) ) {
					 return true;
				 } else {
					 return false;
				 }
			} );
			// If there is at least one port, connect to the first
			if ( ports.length > 0 ) {
				that.arduino = new SerialPort( '/dev/' + ports[0], { baudrate: 115200, buffersize: 255 * 6 } );	
				that.arduinoListen();
			} else {
				console.log( "*** No Arduino ***" );
				process.kill();
			}
		} );		
	},
	serverRequest: function( request, response ){	
		var that = this;
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
			that.socket = socket;
			that.isSocketConnected = true;
			that.socket.emit( 'info', { connected: true } );
		});
	},
	arduinoListen: function () {
		var that = this;
		this.arduino.on( 'open', function () {
			that.arduino.on( 'data', function( data ) {
				data = data.toString().trim();
				if ( data.match( '^(0|1),([0-9]{1,4})$' ) ) {
					var button = parseInt( data.match( '^(0|1),([0-9]{1,4})$' ).slice(1)[0] );
					var slider = parseInt( data.match( '^(0|1),([0-9]{1,4})$' ).slice(1)[1] );
					
					if ( that.isSocketConnected )
						if ( that.cardSensor != button )
							that.sensorListen( that.cardSensor, button );
						
					that.cardSensor = button;
					
					if ( that.isSocketConnected )
						that.socket.emit( 'osc-position-change', { position: mapValue( slider, 0, 1023, 0, 1 ) } );
				}				
	    	} );
		} );
	},
	sensorListen: function( oldValue, newValue ) {
		var that = this;
		
		if ( oldValue && ! newValue ) {
			that.socket.emit( 'osc-disconnect', { message: 'bye bye' } );
			that.qr = "";
		}			
	},
	oscListen: function(){
		var that = this;
		this.oscServer.on( "message", function( msg, rinfo ){
			if( that.isSocketConnected ){
				switch( msg[0] ){
					case "/qr":
						if ( that.cardSensor && that.qr != msg[1] ) {
							that.qr = msg[1]
							gs.getStudent( that.qr, function ( e, data ) { 
								if ( ! e ) {
									that.socket.emit( 'osc-new', data );
								} else {
									console.log( e );
									that.socket.emit( 'osc-disconnect', { message: 'bye bye' } );
								}
							} );
						} else if ( msg[1] == "" ) {
							that.qr = "";
						}
					break;
				}
			}
		} );
	}
}

var interactiveBrowser = new App();
interactiveBrowser.begin();

mapValue = function( val, origMin, origMax, newMin, newMax ){
	return newMin + ( newMax - newMin ) * ( ( val - origMin ) / ( origMax - origMin ) );
};

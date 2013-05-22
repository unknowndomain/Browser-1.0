( function( $, M, io, undefined ){
	var transitionEndEvents = "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd";

	var InteractiveBrowser = function( ele, _socketUrl ){
		this.$ele = $( ele );
		this.socketUrl = _socketUrl;
		this.mode = 'attract';
	};

	InteractiveBrowser.prototype = {
		prepare: function(){
			// connect sockets
			this.socket = io.connect( this.socketUrl );
			// find templates
			this.templates = {
				gallery: M.compile( $('#template-gallery').html() ),
				info: M.compile( $('#template-info').html() )
			}
			// get the containers from the dom
			this.$browser = $( '#browser', this.$ele );
			this.$info = $( 'header', this.$browser );
			this.$gallery = $( 'section', this.$browser );

			this.$attractor = $( '#attractor', this.$ele );
		},
		run: function(){
			this.socketBindEvents();
			this.renderStudent({
				'name': 'Sam Nguyen',
				'url': 'http://something.anything.com/anywhere',
				'media': [
					{'video': '1-video1.mp4' },
					{'image': '2-image1.jpg' },
					{'video': '3-video2.mp4' },
					{'image': '4-image2.jpg' },
					{'image': '5-image3.jpg' },
					{'video': '6-video3.mp4' },
					{'image': '7-image4.jpg' },
					{'image': '8-image5.jpg' }
				]
			});
		},
		socketBindEvents: function(){
			var that = this;
			this.socket.on( 'info', function( data ){
				console.log( 'DATA RECEIVED: ', data );
				that.onInfoMessage( data );
			});
			this.socket.on( 'osc-position-change', function( data ){
				console.log( 'POSITION: ' + data.position );
				that.onPositionMessage( data )
			});

			this.socket.on( 'osc-new', function( data ){
				console.log( 'NEW: ' + data.url );
				that.onUrlMessage( data );
			});
			this.socket.on( 'osc-disconnect', function( data ){
				console.log( that.$info.innerText = 'DISCONNECT. SAYS: "' + data.message + '"' );
				that.onDisconnectMessage( data );
			});
		},
		onInfoMessage: function( data ){

		},
		onPositionMessage: function( data ){

		},
		onUrlMessage: function( data ){			
			this.switchMode( 'browse' );
			this.renderStudent( data );
		},
		onDisconnectMessage: function( data ){	
			this.switchMode( 'attract' );
			console.log( "DISCONNECT!" );
		},
		switchMode: function( mode ){
			this.mode = mode;
			if( this.mode === 'attract' ){
				this.$browser.addClass( 'hidden' );
				this.$attractor.removeClass( 'hidden' );
			} else {
				this.$attractor.removeClass( 'hidden' );
				this.$browser.addClass( 'hidden' );
			}
		},
		renderStudent: function( data ){
			var that = this;
			console.log( data );
			//this.$info.one( transitionEndEvents, function(){ 
				that.$info.empty().append( this.templates.info( data ) );
			//});
			//this.$gallery.one( transitionEndEvents, function(){ 
				that.$gallery.empty().append( this.templates.gallery( data ) );
			//});

			this.$gallery.addClass('hidden');
			this.$info.addClass('hidden')

		}
	};

	window.InteractiveBrowser = InteractiveBrowser;

})( jQuery, Mustache, io );
( function( $, M, io, undefined ){
	var transitionEndEvents = "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd";
	var _anim = 500;

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
			this.$strip = $(); //we will cache this when a tempolate is rendered
			this.$attractor = $( '#attractor', this.$ele );
		},
		run: function(){
			this.socketBindEvents();
			this.switchMode( 'attract' );
		},
		socketBindEvents: function(){
			var that = this;
			this.socket.on( 'info', function( data ){				
				that.onInfoMessage( data );
			});
			this.socket.on( 'osc-position-change', function( data ){				
				that.onPositionMessage( data )
			});

			this.socket.on( 'osc-new', function( data ){				
				that.onUrlMessage( data );
			});
			this.socket.on( 'osc-disconnect', function( data ){				
				that.onDisconnectMessage( data );
			});
		},
		onInfoMessage: function( data ){
			console.log( 'INFO: ' + data );
		},
		onPositionMessage: function( data ){			
			if( this.mode === 'browse' ){
				this.scrollStudent( data.position );
			}
		},
		onUrlMessage: function( data ){			
			this.switchMode( 'browse' );
			console.log( 'render a student?' );
			this.renderStudent( data );
		},
		onDisconnectMessage: function( data ){	
			this.switchMode( 'attract' );
			console.log( "DISCONNECT!" );
		},
		switchMode: function( mode ){
			if( mode === 'attract' && this.mode !== 'attract' ){				
				this.$browser.addClass( 'hidden' );
				this.$attractor.removeClass( 'hidden' );
			} else if( mode === 'browse' && this.mode !== 'browse' ){			
				this.$attractor.addClass( 'hidden' );
				this.$browser.removeClass( 'hidden' );
			}
			this.mode = mode;
		},
		renderStudent: function( data ){
			var that = this;
						
			this.$gallery.addClass('hidden');
			this.$info.addClass('hidden');

			setTimeout( function(){
				that.$info.empty().append( that.templates.info( data ) );
				that.$gallery.empty().append( that.templates.gallery( data ) );
				// cache the scrollable strip for speed
				that.$strip = $( '.scrollable', this.$gallery );
				// show the title (for a while)
				that.$info.removeClass( 'hidden' );
				setTimeout( function(){	
					// hide the title
					that.$info.addClass( 'hidden' );					
					setTimeout( function(){
						// show the images
						that.$gallery.removeClass( 'hidden' );
					}, _anim * 0.5 );
				}, 3000);				
			}, _anim );
		},
		scrollStudent: function( amount ){						
			var scrollAmount = amount * -1;
			var gallW = this.$gallery.width();
			var stripW = this.$strip.width();
			var scrollExtent = stripW - gallW;
			var calculated = scrollExtent * scrollAmount;
			
			this.$strip.css( 'transform', 'translate3d(' + calculated + 'px ,0, 0)' );
		}
	};

	window.InteractiveBrowser = InteractiveBrowser;

})( jQuery, Mustache, io );
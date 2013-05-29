( function( $, M, io, undefined ){
	var _anim = 500;

	var InteractiveBrowser = function( ele, _socketUrl ){
		this.$ele = $( ele );
		this.socketUrl = _socketUrl;
		this.mode = 'attract';
		this.attractAnim = new Intro( $( '.intro', this.$ele ) );
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

			this.timers = {
				student: [],
				mode: []
			};

			this.attractAnim.run();	

			$( window ).on( 'resize', function(){
				window.location = window.location;
			});

		},
		clearTimers: function( type ){
			if( type ){
				for( var i = 0, len = this.timers[ type ].length; i < len; i++ ){
					clearTimeout( this.timers[ type ][ i ] );
				}
			} else {
				for( type in this.timers ){
					for( var i = 0, len = this.timers[ type ].length; i < len; i++ ){
						clearTimeout( this.timers[ type ][ i ] );
					}
				}
			}
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
			this.renderStudent( data );
		},
		onDisconnectMessage: function( data ){	
			console.log( this.mode );
			this.switchMode( 'attract' );
			console.log( "DISCONNECT!" );
		},
		switchMode: function( mode ){
			var that = this;
			if( mode === 'attract' && this.mode !== 'attract' ){				
				this.$browser.addClass( 'hidden' );
				this.$gallery.addClass( 'hidden' );
				this.clearTimers( 'mode' );
				var timer = setTimeout( function(){
					that.$attractor.removeClass( 'hidden' );	
					that.attractAnim.run();	
				}, _anim );
				this.timers.mode.push( timer );
			} else if( mode === 'browse' && this.mode !== 'browse' ){			
				this.$attractor.addClass( 'hidden' );
				this.clearTimers( 'mode' );
				var timer = setTimeout( function(){
					that.attractAnim.clear();
					that.$browser.removeClass( 'hidden' );
				}, _anim );
				this.timers.mode.push( timer );
			}
			this.mode = mode;
		},
		renderStudent: function( data ){
			var that = this;
						
			this.$gallery.addClass('hidden');
			this.$info.addClass('hidden');	

			this.clearTimers( 'student' );

			var timer = setTimeout( function(){
				that.$info.empty().append( that.templates.info( data ) );
				that.$gallery.empty().append( that.templates.gallery( data ) );	
				// cache the scrollable strip for speed
				that.$strip = $( '.scrollable', this.$gallery );
				//lay out the gallery
				that.setupGallery( function(){
					// show the title (for a while)
					that.$info.removeClass( 'hidden' );
					var timer = setTimeout( function(){	
						// hide the title
						that.$info.addClass( 'hidden' );
						var timer = setTimeout( function(){
							// show the images
							that.$gallery.removeClass( 'hidden' );
							that.checkPosition();
						}, _anim * 0.5 );
						that.timers.student.push( timer );
					}, 1000);
					that.timers.student.push( timer );
				});
			}, _anim );
			this.timers.student.push( timer );
		},
		setupGallery: function( callback ){
			var that = this;
			var winW = $(window).width();
			var $imgs = $( 'img', this.$strip );
			var $items = $( 'li', this.$strip );
			var $text = $( '.blurb', this.$strip );
			var $vids = $( 'video', this.$strip );
			var vidCount = $vids.length;
			var vidW = ( this.$strip.height() / 9 ) * 16;
			var vidWidthAddition = vidW * vidCount;	
			var textW = winW * 0.7;
			var totalW = 0;
			var toLoad = $imgs.length;
			var loaded = 0;	
			$text.width( textW );
			
			$imgs.each( function(){
				$(this).on( 'load', function(){
					loaded++;
					if( loaded === toLoad ){						
						$imgs.each( function(){
							totalW += $(this).width();
						});
						totalW += vidWidthAddition;
						totalW += textW;
						that.$strip.width( totalW );

						if( typeof callback === 'function' ){
							callback();
						}
					}
				});
			});
		},
		scrollStudent: function( amount ){
			var scrollAmount = amount * -1;
			var gallW = this.$gallery.width();
			var stripW = this.$strip.width();
			var scrollExtent = stripW - gallW;
			var calculated = scrollExtent * scrollAmount;
			this.$strip.css( 'transform', 'translate3d(' + calculated + 'px ,0, 0)' );
			this.checkPosition();
		},
		checkPosition: function(){
			var $items = $( 'li', this.$strip );
			var containerW = this.$gallery.width();
			
			$items.each( function(){
				var width =  $(this).width();
				var left = $(this).offset().left;
				var right = left + width;
				var $thisVideo = $(this).find('video');
				var $thisImage = $(this).find('img');
				if( left > width*-1 && right < containerW + width ){
					// is visible ( at least in part )
					$(this).addClass( 'visible' );
					if( left > (width*-0.5) && right < containerW + (width*0.5) ){				
						if( $thisVideo.length > 0 ){
							$thisVideo[0].play();
						}
					} else {
						if( $thisVideo.length > 0 ){
							$thisVideo[0].pause();
						}
					}
				} else {						
					$(this).removeClass( 'visible' );
					if( $thisVideo.length > 0 ){
						$thisVideo[0].pause();
					}
				}
			});
		}
	};

	window.InteractiveBrowser = InteractiveBrowser;

})( jQuery, Mustache, io );
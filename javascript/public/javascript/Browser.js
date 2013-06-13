( function( $, M, io, undefined ){
	var DEBUG_DATA = [{"name":"Calvin Ncube","url":"http://open.gdnm.org/calvin-ncube","tag":"data/calvin-ncube/tag.png","media":[{"video":"data/calvin-ncube/00.mp4"},{"image":"data/calvin-ncube/01.jpg"},{"image":"data/calvin-ncube/02.jpg"},{"image":"data/calvin-ncube/03.jpg"},{"image":"data/calvin-ncube/04.jpg"},{"image":"data/calvin-ncube/05.jpg"},{"image":"data/calvin-ncube/06.jpg"}],"blurb":{"text":["INSIGHT is a piece of dynamic motion graphics that has been created to visualize how life would appear to a person without the sense of sight. Advancements in biomedical retinal implants are happening frequently, and this piece of design has been created in order to simulate how the world appears through the implant, using creative coding in order to achieve the desired effect."]}},{"name":"Giovanni Nappo","url":"http://open.gdnm.org/giovanni-nappo","tag":"data/giovanni-nappo/tag.png","media":[{"video":"data/giovanni-nappo/a.mp4"},{"image":"data/giovanni-nappo/b.jpg"},{"image":"data/giovanni-nappo/c.jpg"}],"blurb":{"text":["WOW is an experimental website and an ongoing study aiming to show the amount of time we spend on social networks, converting it into tangible entities. It collects information, experiments and data involving different media in the attempt to create a useful data-set visualization on the topic."]}},{"name":"Jack Ellis","url":"http://open.gdnm.org/jack-ellis","tag":"data/jack-ellis/tag.png","media":[{"image":"data/jack-ellis/00.jpg"},{"image":"data/jack-ellis/01.jpg"},{"image":"data/jack-ellis/02.jpg"},{"image":"data/jack-ellis/03.jpg"},{"video":"data/jack-ellis/04.mp4"}],"blurb":{"text":["The role of technology in our modern lives has had a huge but negative impact on health. How can technology be used to address the health issues?","Being a huge video gamer and also really into fitness, I was frustrated with all the news saying that video games are making people, especially children, overweight and obese. I realised that one of the main problems was in particular fast food restaurants, and the more I researched the area the more I realised that one of the biggest fast food companies was having a huge effect on society and the obesity issue. For this project I wanted to use video games to actually try to combat obesity, and demonstrate that burgers are many people's enemy."]}},{"name":"Jewell Marasigan","url":"http://open.gdnm.org/jewell-marasigan","tag":"data/jewell-marasigan/tag.png","media":[{"image":"data/jewell-marasigan/00.jpg"},{"image":"data/jewell-marasigan/01.jpg"},{"image":"data/jewell-marasigan/02.jpg"},{"image":"data/jewell-marasigan/03.jpg"},{"image":"data/jewell-marasigan/04.jpg"},{"image":"data/jewell-marasigan/05.jpg"},{"image":"data/jewell-marasigan/06.jpg"},{"image":"data/jewell-marasigan/07.jpg"},{"video":"data/jewell-marasigan/08.mp4"}],"blurb":{"text":["My project aims to explore the personal relationship between people and the items they own. What do these items mean to their owners?","I proposed a pop-up shop to execute this idea, is it called The Recollective Shop where people can exchange their items for memory credits, a monetary value I have devised which categorises items into several memory classes. In essence, The Recollective Shop is a thrift store. However unlike conventional stores, where money is king, memories are what decide the value of an item."]}},{"name":"Kleanthis Michael","url":"http://open.gdnm.org/kleanthis-michael","tag":"data/kleanthis-michael/tag.png","media":[{"video":"data/kleanthis-michael/00.mp4"},{"image":"data/kleanthis-michael/01.jpg"},{"image":"data/kleanthis-michael/02.jpg"},{"image":"data/kleanthis-michael/03.jpg"},{"image":"data/kleanthis-michael/04.jpg"},{"image":"data/kleanthis-michael/05.jpg"},{"image":"data/kleanthis-michael/06.jpg"},{"image":"data/kleanthis-michael/07.jpg"}],"blurb":{"text":["'The Power of Crystals' considers crystals in relation to both spirituality and science, and proposes their further use as a new media tool to produce beautiful moving imagery. During my experiments I found ways to create connections between spirituality and science. The resulting Power of Crystals video presents a series of vivid crystal optical effects in movement, as symbols or metaphors for the properties of crystals.","The Illuminated Plant is an interactive pot which communicates with people, giving them information about the plant. Light turns red when in need of water, and turns white when it has enough."]}},{"name":"Michael Dowdle","url":"http://open.gdnm.org/michael-dowdle","tag":"data/michael-dowdle/tag.png","media":[{"video":"data/michael-dowdle/00.mp4"},{"image":"data/michael-dowdle/01.jpg"},{"image":"data/michael-dowdle/02.jpg"},{"image":"data/michael-dowdle/03.jpg"},{"image":"data/michael-dowdle/04.jpg"},{"image":"data/michael-dowdle/05.jpg"},{"image":"data/michael-dowdle/06.jpg"}],"blurb":{"text":["This is an installation exploring the interplay between physical and digital objects. The work also challenges ideas of perception. Firstly by reappropriating picture frames into digital canvases; Secondly by combining digital and technological influences, such as glitching and low polygon effects with more traditional art forms of portraiture and landscape."]}}];

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
			var vidW = Math.ceil( this.$strip.height() / 9 ) * 16;
			var vidWidthAddition = vidW * vidCount;	
			var textW = Math.floor( winW * 0.7 );
			var totalW = 0;
			var toLoad = $imgs.length;
			var loaded = 0;	
			var vidsChecked = 0;
			var vidsToCheck = $vids.length;
			var checkCount = 0;
			var checkThreshold = 10;
			$text.width( textW );
			
			this.$ele.imagesLoaded( function(){	
				$imgs.each( function(){	
					totalW += $(this).width();		
				});

				totalW += textW;
				if( $vids.length > 0 ){
					var checkVideo = setInterval( function(){					
						$vids.each( function(){	
							var vid = $(this)[0];
							var vidNatWidth = vid.videoWidth; 
							var vidNatHeight = vid.videoHeight
							if( (vidNatWidth !== 0 && vidNatHeight !== 0) || checkCount > checkThreshold ){
								if( checkCount <= checkThreshold ){
									var vidRatio = vidNatWidth / vidNatHeight;
									var newW = Math.ceil( that.$strip.height() * vidRatio );							
									$(this).width( newW );
									totalW += newW;
									vidsChecked++;
								}
								if( vidsChecked >= vidsToCheck || checkCount > checkThreshold ){									
									clearInterval( checkVideo );

									if( checkCount > checkThreshold ){
										console.log( 'ERROR: problem with video files, removing files.' );
										$vids.remove();
									}
									that.$strip.width( totalW );
									if( typeof callback === 'function' ){					
										callback();
									}
								}
							}													
						});
						checkCount++;
					}, 100 );
				} else {
					//no videos soooooo:
					that.$strip.width( totalW );
					if( typeof callback === 'function' ){					
						callback();
					}
				} 
				that.timers.student.push( checkVideo );
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
		},
		debugLoad: function( _pos ){
			var count = DEBUG_DATA.length;
			var pos = _pos || Math.floor( Math.random() * count );			
			this.onUrlMessage( DEBUG_DATA[pos] );
		},
		debugScroll: function( data ){			
			this.onPositionMessage( data );			
		}
	};

	window.InteractiveBrowser = InteractiveBrowser;

})( jQuery, Mustache, io );
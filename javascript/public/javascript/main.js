//( function( $ ){
	var pos = 0;
	var browser = new InteractiveBrowser( '#app', 'http://localhost' );

	browser.prepare();
	browser.run();

	var offset = browser.attractAnim.moveSizeX;

	$(window).on( 'keypress', function( e ){
		if( e.which === 115 ){ // key === s
			//go right
			pos -= 0.05;
			if( pos < 0 ){ pos = 0; }
			browser.debugScroll( { position: pos } );
		} else if( e.which === 97 ){ // key === a
			//go left
			pos += 0.05
			if( pos > 1 ){ pos = 1; }
			browser.debugScroll( { position: pos } );
		} else if( e.which === 108 ){ // key === l
			browser.debugLoad();
		}	
	});

//})( jQuery );
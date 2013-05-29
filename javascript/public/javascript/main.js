//( function( $ ){
	
	var browser = new InteractiveBrowser( '#app', 'http://localhost' );

	browser.prepare();
	browser.run();

	var offset = browser.attractAnim.moveSizeX;

//})( jQuery );
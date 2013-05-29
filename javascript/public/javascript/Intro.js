( function( $, undefined ){

	var randomRange = function( fromValue, toValue ){
		return fromValue + ( Math.random() * ( toValue - fromValue ) );
	};

	var Intro = function( ele ){
		this.$ele = $( ele );
		this.$sprite = $( '.sprite', this.$ele );
		this.w = this.$ele.width();
		this.h = this.$ele.height();

		this.maxMoves = 12;
		this.moveSizeX = 169.25;
		this.moveSizeY = 169.25;
		this.frameCount = 0;
		this.frameInterval = 20;

		console.log( this.$sprite );

		this.animLoop;

	};

	Intro.prototype = {
		run: function(){
			console.log( 'run' );
			this.loop();
		},
		getMove: function( axis ){
			var size;
			if( axis === 'y' ){
				size = this.moveSizeY;
			} else {
				size = this.moveSizeX;
			}
			return Math.floor( randomRange( 0, this.maxMoves ) ) * size;
		},
		frame: function(){
			if( this.frameCount % this.frameInterval === 0 ){
				//var trans = 'translate3d(' + this.getMove() + 'px, ' + this.getMove()  + 'px, 0 )';				
				//this.$sprite.css('transform', trans);
				this.$sprite.css('background-position', this.getMove() + 'px ' + this.getMove( 'y' ) + 'px' );
			}	
		},
		loop: function(){
			var that = this;
			
			this.frame();
			this.frameCount++;

			that.animLoop = webkitRequestAnimationFrame( function(){
				that.loop();
			});
		},
		clear: function(){
			webkitCancelAnimationFrame( this.animLoop );
		}
	}

	window.Intro = Intro;

})( jQuery );
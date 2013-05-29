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
		this.moveSize = 169.25;
		this.frameCount = 0;

		console.log( this.$sprite );

		this.animLoop;

	};

	Intro.prototype = {
		run: function(){
			console.log( 'run' );
			this.loop();
		},
		getMove: function(){
			return randomRange( 0, this.maxMoves ) * this.moveSize;
		},
		frame: function(){
			if( this.frameCount % 30 === 0 ){
				var trans = 'translate3d(' + this.getMove() + 'px, ' + this.getMove()  + 'px, 0 )';				
				this.$sprite.css('transform', trans);
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
			clearAnaimationFrame( this.animLoop );
		}
	}

	window.Intro = Intro;

})( jQuery );
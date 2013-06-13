// Here be dragons. Look not directly upon the code, lest thine eyes bleed.
//
//
//
//                                        ` )								
//                               (         (
//                                )      (
//                              )          )
//                             (          ( ,
//                            _ _)_      .-Y.
//                 .--._ _.--'.',T.\_.--' (_)`.
//               .'_.   `  _.'  `-'    __._.--;
//              /.'  `.  -'     ___.--' ,--.  :       o       ,-. _
//             : |  xX|       ,'  .-'`.(   |  '      (   o  ,' .-' `,
//            :  `.  .'    ._'-,  \   | \  ||/        `.{  / .'    :
//           .;    `'    ,',\|\|   \  |  `.;'     .__(()`./.'  _.-'
//           ;           |   ` `    \.'|\\ :      ``.-. _ '_.-'
//          .'           ` /|,         `|\\ \        -'' \  \
//          :             \`/|,-.       `|\\ :         ,-'| `-.
//          :        _     \`/  |   _   .^.'\ \          -'> \_
//          `;      --`-.   \`._| ,' \  |  \ : \           )`.\`-
//           :.      .---\   \   ,'   | '   \ : .          `  `.\_,/
//            :.        __\   `. :    | `-.-',  :               `-'
//            `:.     -'   `.   `.`---'__.--'  /
//             `:         __.\    `---'      _'
//              `:.     -'    `.       __.--'
//               `:.          __`--.--'\
//          -bf-  `:.      --'     __   `.
//
//
//
//
/////////////////////////////////////////////////////////////////////////////
// 

var fs = require( 'fs' );

var webroot = '../public/';
var directory = 'data/';

var getSudent = function( slug, callback ){
	var textToParagraphs = function( string ){
		if( string ){
			var sections = string.split('\n');
			var paras = [];
			for( var i = 0; i < sections.length; i++ ){
				if( sections[i].length > 0 ){
					paras.push( sections[i] );
				}
			}
			return paras;
		}
		return false;
	};	
	// Grab the student name from the URL
	var student = slug;

	// Check student directory exists
	fs.exists( __dirname + "/" + "/" + webroot + directory + student, function ( exists ) {

		// If it does...
		if ( exists ) {
	
			// Grab the directory contents
			fs.readdir( __dirname + "/" + webroot + directory + student, function( e, files ) {

				// Filter out .DS_Store and directories
				 files = files.filter( function ( file ) {
					 if ( file == '.DS_Store' )
					 					 return false;
					 if ( file == 'tag.png' )
					 					 return false;
					return fs.statSync( __dirname + "/" + webroot + directory + student + '/' + file ).isFile();
				} );


				// Report any errors
				if ( e ) {
					console.log( 'Error: ' + e );
				} else {
			
					// Create a JSON object
					var json = new Object();
			
					// Process a name from the directory name
					json['name'] = '';
			
					for ( part in student.split( '-' ) ) {
						part = student.split( '-' )[part];
						json['name'] += part.substr( 0, 1 ).toUpperCase() + part.substr( 1 ) + ' ';
					}
			
					json['name'] = json['name'].trim();
			
					// Process a URL from the directory name
					json['url'] = 'http://open.gdnm.org/' + student;
							
					// Process a tag from the directory name
					json['tag'] = directory + student + '/tag.png';
											
					// Create an array of media items
					json['media'] = new Array();	

					// Fill array
					for ( file in files  ) {
				
						// If file is an image then add image: filename
						if ( files[file].substr( -3, 3 ) == 'jpg' | files[file].substr( -3, 3 ) == 'png' | files[file].substr( -4, 4 ) == 'jpeg' | files[file].substr( -3, 3 ) == 'gif' ) {
							var item = new Object();
							item['image'] = directory + student + '/' + files[file];
							json['media'].push( item );

						// If file is a video then add video: filename
						} else if ( files[file].substr( -3, 3 ) == 'mp4' ) { 
							var item = new Object();
							item['video'] = directory + student + '/' + files[file];
							json['media'].push( item );
						}
					}
			
					// Process a bio from the directory name
					fs.exists( __dirname + "/" + webroot + directory + student + '/blurb.txt', function ( exists ) {
						if ( exists ) {
							fs.readFile( __dirname + "/" + webroot + directory + student + '/blurb.txt', 'utf8', function ( e, data ) {
								if ( ! e ) {
									json['blurb'] = {'text': textToParagraphs( data ) };
								} else {
									console.log( 'Blurb error' );
								}
						
								// Output data
								if ( typeof callback  === 'function' ) {
									callback( e, json );
								}
							});
						} else {
							json['blurb'] = '';
							console.log( 'No blurb' );

							// Output data
							if ( typeof callback  === 'function' ) {
								callback( e, json );
							}
						}
					});
				}
			} );
			
		// Output error
		} else {
			e = 'Error: No such student directory exists.'
			if ( typeof callback  === 'function' ) {
				callback( e, null );
			}
		}
	} );
};

var results = [];
var gotCount = 0;

fs.readdir( __dirname + "/" + webroot + directory, function( e, files ) {
	
	files = files.filter( function ( file ) {
		 if ( file == '.DS_Store' ){
			return false;
		 }		 		
		return fs.statSync( __dirname + "/" + webroot + directory + file ).isDirectory();
	} );


	for( var i = 0; i < files.length; i++ ){
		getSudent( files[i], function( e, json ){
			results.push( json );
			gotCount++;
			if( gotCount === files.length ){
				fs.writeFile( __dirname + "/" + webroot + 'debug/example_data.json', JSON.stringify( results ), function(err) {
	    			if(err) {
	      				console.log(err);
		    		} else {
		      			console.log( 'JSON saved to ' + __dirname + '/' + webroot + 'debug/example_data.json');
		    		}
				}); 		
			}
		});
	}
});









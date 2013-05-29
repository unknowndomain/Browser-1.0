var fs = require('fs');

function getStudent( url, callback ) {
	var e;
	var regex = "^http://open.gdnm.org/([a-z-]+)$";
	var webroot = "public/";
	var directory = "data/";
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

	// Check URL format is okay
	if ( url.match( regex ) ) {
		
		// Grab the student name from the URL
		var student = url.match( regex ).slice(1)[0];

		// Check student directory exists
		fs.exists( webroot +directory + student, function ( exists ) {

			// If it does...
			if ( exists ) {
		
				// Grab the directory contents
				fs.readdir( webroot +directory + student, function( e, files ) {

					// Filter out .DS_Store and directories
					 files = files.filter( function ( file ) {
						 if ( file == ".DS_Store" )
						 					 return false;
						 if ( file == "tag.png" )
						 					 return false;
						return fs.statSync( webroot + directory + student + "/" + file ).isFile();
					} );
	
					// Report any errors
					if ( e ) {
						console.log( "Error: " + e );
					} else {
				
						// Create a JSON object
						var json = new Object();
				
						// Process a name from the directory name
						json["name"] = "";
				
						for ( part in student.split( "-" ) ) {
							part = student.split( "-" )[part];
							json["name"] += part.substr( 0, 1 ).toUpperCase() + part.substr( 1 ) + " ";
						}
				
						json["name"] = json["name"].trim();
				
						// Process a URL from the directory name
						json["url"] = "http://open.gdnm.org/" + student;
								
						// Process a tag from the directory name
						json["tag"] = directory + student + "/tag.png";
												
						// Create an array of media items
						json["media"] = new Array();

						// Fill array
						for ( file in files  ) {
					
							// If file is an image then add image: filename
							if ( files[file].substr( -3, 3 ) == "jpg" | files[file].substr( -3, 3 ) == "png" | files[file].substr( -4, 4 ) == "jpeg" | files[file].substr( -3, 3 ) == "gif" ) {
								var item = new Object();
								item["image"] = directory + student + "/" + files[file];
								json["media"].push( item );

							// If file is a video then add video: filename
							} else if ( files[file].substr( -3, 3 ) == "mp4" ) { 
								var item = new Object();
								item["video"] = student + "/" + files[file];
								json["media"].push( item );
							}
						}
				
						// Process a bio from the directory name
						fs.exists( webroot + directory + student + "/blurb.txt", function ( exists ) {
							if ( exists ) {
								fs.readFile( webroot + directory + student + "/blurb.txt", "utf8", function ( e, data ) {
									if ( ! e ) {
										json["blurb"] = {'text': textToParagraphs( data ) };
									} else {
										console.log( "Blurb error" );
									}
							
									// Output data
									if ( typeof callback  === "function" ) {
										callback( e, json );
									}
								});
							} else {
								json["blurb"] = "";
								console.log( "No blurb" );

								// Output data
								if ( typeof callback  === "function" ) {
									callback( e, json );
								}
							}
						});
					}
				} );
				
			// Output error
			} else {
				e = "Error: No such student directory exists."
				if ( typeof callback  === "function" ) {
					callback( e, null );
				}
			}
		} );

	// Output error
	} else {
		e = "Error: URL format invalid."
		if ( typeof callback  === "function" ) {
			callback( e, null );
		}
	}
}

module.exports.getStudent = getStudent;
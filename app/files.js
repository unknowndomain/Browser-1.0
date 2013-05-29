var fs = require('fs');

function getStudent( url, callback ) {
	var e;
	var regex = "^http://open.gdnm.org/([a-z-]+)$";
	var directory = "public/Data/";

	// Check URL format is okay
	if ( url.match( regex ) ) {
		
		// Grab the student name from the URL
		var student = url.match( regex ).slice(1)[0];

		// Check student directory exists
		fs.exists( directory + student, function ( exists ) {

			// If it does...
			if ( exists ) {
		
				// Grab the directory contents
				fs.readdir( directory + student, function( e, files ) {

					// Filter out .DS_Store and directories
					 files = files.filter( function ( file ) {
						 if ( file == ".DS_Store" )
						 					 return false;
						return fs.statSync( directory + student + "/" + file ).isFile();
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
						json["tag"] = student + ".png";
						// Create an array of media items
						json["media"] = new Array();

						// Fill array
						for ( file in files  ) {
					
							// If file is an image then add image: filename
							if ( files[file].substr( -3, 3 ) == "jpg" | files[file].substr( -3, 3 ) == "png" | files[file].substr( -4, 4 ) == "jpeg" | files[file].substr( -3, 3 ) == "gif" ) {
								var item = new Object();
								item["image"] = student + "/" + files[file];
								json["media"].push( item );

							// If file is a video then add video: filename
							} else if ( files[file].substr( -3, 3 ) == "mp4" ) { 
								var item = new Object();
								item["video"] = student + "/" + files[file];
								json["media"].push( item );
							}
						}
				
						// Output data
						if ( typeof callback  === "function" ) {
							callback( e, json );
						}
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
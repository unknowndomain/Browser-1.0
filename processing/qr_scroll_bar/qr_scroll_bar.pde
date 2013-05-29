import oscP5.*;
import netP5.*;
import processing.video.*;
import com.google.zxing.*;
import java.awt.image.BufferedImage;

// Camera & ZXing objects
Capture cam;
com.google.zxing.Reader reader = new com.google.zxing.qrcode.QRCodeReader();

// OSC objects
OscP5 oscP5;
NetAddress destination;

// Calibration positions
float left_edge = 50;
float right_edge = 50;

// QR code globals
float position = 0.0;
String msg = "";
long last_detect = 0;
boolean qr_present = false;

// Modes
boolean calibration = false;

void setup() {
  // Setup canvas
  size( 1280, 800 );
  noSmooth();
  textAlign( CENTER );
  
  // Load existing calibration data
  loadCalibration();
  
  String[] cameras = Capture.list();
  
  if (cameras.length == 0) {
    println("There are no cameras available for capture.");
    exit();
  } else {
    println("Available cameras:");
    for (int i = 0; i < cameras.length; i++) {
      println(cameras[i]);
    }
  }

  // Setup camera and open camera settings
  cam = new Capture( this, Capture.list()[0] );
  
  cam.start();
  
  // Start OSC
  oscP5 = new OscP5( this, 8000 );
  destination = new NetAddress( "127.0.0.1", 8000 );
}

void draw() {
  // If new camera data is available
  if ( cam.available() == true ) {
    stroke(255);

    // Read the data
    cam.read();

    // Render the image
    image( cam, 0, 0 );
    
    // Draw calibration lines
    line( left_edge, 0, left_edge, height );
    line( width - right_edge, 0, width - right_edge, height );

    // Try to detect a QR code
    try
    {
      // Now test to see if it has a QR code embedded in it
      LuminanceSource source = new BufferedImageLuminanceSource( (BufferedImage) cam.getImage() );
      BinaryBitmap bitmap = new BinaryBitmap( new HybridBinarizer( source ) );
      Result result = reader.decode( bitmap );

      // If a QR code is found
      if ( result.getText() != null ) {
        
        // Compare QR code message to previous message to detect change
        if ( msg.equals( result.getText() ) != true  ) {
          qr_present = true;
          OscMessage decoded_msg = new OscMessage( "/msg" );
          decoded_msg.add( result.getText() );
          oscP5.send( decoded_msg, destination );
        }
        
        // Store current decoded message
        msg = result.getText();
        
        // Get the location data.
        ResultPoint[] points = result.getResultPoints();

        if ( calibration )
          calibrate( points[0].getX() );
        
        // Calculate a new position number
        float new_position = map( points[0].getX(), left_edge, width - right_edge, 0, 1 );
        
        // Compare new position to old and if change is significant send an OSC message
        if ( abs( new_position - position ) > 0.001 ) {
          
            if ( position > 1.0 )
              position = 1.0;
          
            if ( position < 0.0 )
              position = 0.0;
          
            // Send new position
            OscMessage position_msg = new OscMessage( "/position" );
            position_msg.add( position );
            oscP5.send( position_msg, destination );
        }
        
        // Store new position
        position = new_position;

        // Render position and content info
        textSize( 15 );
        text( ( position * 100 ) + "%", 25, height - 45 );
        text( msg, 25, height - 25 );

        // Store last capture time
        last_detect = millis();
      }
    } 
    catch ( Exception e ) {
      if ( last_detect < ( millis() - 1500 ) && qr_present == true ) {
            msg = "";
            qr_present = false;
            OscMessage position_msg = new OscMessage( "/msg" );
            position_msg.add( "" );
            oscP5.send( position_msg, destination );
      }
    }
    if ( calibration ) {
      noStroke();
      fill( 255, 0, 0 );
      rect( 0, 0, width, 25 );
      fill( 255 );
      text( "CALIBRATION MODE", width / 2 , 17 );
    }
  }
}

void keyPressed() {
  if ( key == 'c' ) {
    calibration = ! calibration;
    if ( ! calibration ) { 
      saveCalibration();
    }
  }
}

void calibrate( float x ) {
  // If the left edge is greater than the QR code position recalibrate
  if ( x < width / 2 )
    left_edge = x;
  
  // If the right edge is less than than the QR code position recalibrate
  if ( x > width / 2 )
    right_edge = width - x;
  
  // Draw a progress bar at the bottom
  rect( 0, height - 10, map( x, left_edge, width - right_edge, 0, width ), height );
}

void loadCalibration() {
  String calibration[] = loadStrings( "cal.txt" );
  if ( calibration != null ) {
    left_edge = Float.parseFloat( calibration[0] );
    right_edge = Float.parseFloat( calibration[1] );
    println( "Calibration Loaded." );
  }
}

void saveCalibration() {
  String calibration[] = new String[2];
  calibration[0] = nf( left_edge, 0, 0 );
  calibration[1] = nf( right_edge, 0, 0 );
  saveStrings( "cal.txt", calibration );
}

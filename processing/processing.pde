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

// QR code globals
String msg = "";
long last_detect = 0;
boolean qr_present = false;

void setup() {
  // Setup canvas
  size( 320, 180 );
  noSmooth();
  textAlign( CENTER );

//  String[] cameras = Capture.list();
//
//  if (cameras.length == 0) {
//    println("There are no cameras available for capture.");
//    exit();
//  } else {
//    println("Available cameras:");
//    for (int i = 0; i < cameras.length; i++) {
//      println( cameras[i] );
//    }
//  }

  // Setup camera and open camera settings
  //Capture.list()[15]
  cam = new Capture( this, "name=Microsoft¬Æ LifeCam HD-3000,size=1280x800,fps=30" );
  cam.start();

  // Start OSC
  oscP5 = new OscP5( this, 8000 );
  destination = new NetAddress( "127.0.0.1", 8000 );
}

void draw() {
  // If new camera data is available
  if ( cam.available() == true ) {

    // Read the data
    cam.read();

    // Render the image
    image( cam, 0, 0, 320, 180 );

    // Try to detect a QR code
    try
    {
      // Now test to see if it has a QR code embedded in it
      LuminanceSource source = new BufferedImageLuminanceSource( (BufferedImage) cam.getImage() );
      BinaryBitmap bitmap = new BinaryBitmap( new HybridBinarizer( source ) );
      Result result = reader.decode( bitmap );

      // If a QR code is found
      if ( result.getText() != null ) {
          OscMessage decoded_msg = new OscMessage( "/qr" );
          decoded_msg.add( result.getText() );
          oscP5.send( decoded_msg, destination );

        // Render position and content info
        textSize( 12 );
        text( result.getText(), width / 2, height - 25 );

        // Store last capture time
        last_detect = millis();
      }
    } 
    catch ( Exception e ) {
      if ( last_detect < ( millis() - 1500 ) && qr_present == true ) {
        msg = "";
        qr_present = false;
        OscMessage position_msg = new OscMessage( "/qr" );
        position_msg.add( "" );
        oscP5.send( position_msg, destination );
      }
    }
  }
}


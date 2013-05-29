import oscP5.*;
import netP5.*;
import java.awt.image.BufferedImage;
import java.awt.event.*;

OscP5 oscP5;
NetAddress destination;

float position = 0.0;
String msg = "";

void setup() {
  size( 1280, 130 );
  noStroke();
  textSize( 15 ); 
  textAlign( CENTER );
  noSmooth();
  
  oscP5 = new OscP5( this, 8000 );
  destination = new NetAddress( "127.0.0.1", 8000 );

  addMouseWheelListener( new MouseWheelListener() { 
    public void mouseWheelMoved( MouseWheelEvent mwe ) { 
        mouseWheel( mwe.getWheelRotation() );
      }
    }
  ); 
}

void draw() {
  background( 0 );
  fill( 255 );
  rect( 0, 0, map( position, 0, 1.0, 0, width ), height );
  fill( 128 );
  text( msg, width / 2, height / 2 );
}

void mouseWheel( int delta ) {
  position += float( delta ) / 75;
  
  if ( position > 1.0 )
    position = 1.0;
    
  if ( position < 0.0 ) 
    position = 0.0;
    
  OscMessage position_msg = new OscMessage( "/position" );
  position_msg.add( position );
  oscP5.send( position_msg, destination );
}

void keyPressed() {
  OscMessage decoded_msg;
  switch ( key ) {
    case '1':
      decoded_msg = new OscMessage( "/msg" );
      msg = "http://open.gdnm.org/tavis-murray";
      decoded_msg.add( msg );
      oscP5.send( decoded_msg, destination );
      break;
    case '2':
      decoded_msg = new OscMessage( "/msg" );
      msg = "http://open.gdnm.org/jonathan-smith";
      decoded_msg.add( msg );
      oscP5.send( decoded_msg, destination );
      break;
    case '3':
      decoded_msg = new OscMessage( "/msg" );
      msg = "http://lolcats.com";
      decoded_msg.add( msg );
      oscP5.send( decoded_msg, destination );
      break;
    case '4':
      decoded_msg = new OscMessage( "/msg" );
      msg = "";
      decoded_msg.add( msg );
      oscP5.send( decoded_msg, destination );
      break;
  }
}

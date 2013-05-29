unsigned long send_timer = 0;

int samples[10] = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };

void setup() {
  Serial.begin( 115200 );
  delay( 1000 );
  pinMode( A2, INPUT );
  pinMode( 10, INPUT );
  digitalWrite( 10, HIGH );
}

void loop() {
  if ( send_timer < millis() ) {
    String str = "";
    send_timer = millis() + 20;
    if ( digitalRead( 10 ) != HIGH ) {
      str = "1";
    } else {
      str = "0";
    }
    str = str + ",";
    str = str + averagePot();
    Serial.println( str );
  }
  samplePot();
}

void samplePot() {
  for ( int i = sizeof( samples ) / sizeof( int ); i > 0; i-- ) {
    samples[i] = samples[i - 1];
  }
  samples[0] = analogRead( A2 );
}

int averagePot() {
  int average = 0;
  for ( int i = 0; i <= sizeof( samples ) / sizeof( int ); i++ ) {
    average += samples[i];
  }
  average /= sizeof( samples ) / sizeof( int );
  return average;
}

#define sliderPin A2
#define btnPin 10

unsigned long send_timer = 0;
int samples[50];

void setup() {
  Serial.begin( 115200 );
  delay( 1000 );
  pinMode( sliderPin, INPUT );
  pinMode( btnPin, INPUT );
  digitalWrite( btnPin, HIGH );
}

void loop() {
  if ( send_timer < millis() ) {
    String str = "";
    send_timer = millis() + 25;
    if ( digitalRead( btnPin ) != HIGH ) {
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
  samples[0] = analogRead( sliderPin );
}

int averagePot() {
  int average = 0;
  for ( int i = 0; i < sizeof( samples ) / sizeof( int ); i++ ) {
    average += samples[i];
  }
  average /= sizeof( samples ) / sizeof( int );
  return average;
}

/*
 * ============================================================
 *  FreshScan — Arduino Uno Sensor Sketch
 *  Hardware: MQ-2 Gas Sensor + DHT22 + ESP8266 (ESP-01) Wi-Fi
 *  Sends sensor data to backend POST /api/sensor every 5 s
 * ============================================================
 */

#include <SoftwareSerial.h>
#include <DHT.h>

// ── Pin Definitions ───────────────────────────────────────────
#define MQ2_ANALOG_PIN  A0
#define MQ2_DIGITAL_PIN 8
#define DHT_PIN         7
#define DHT_TYPE        DHT22
#define LED_GREEN       4   // Fresh  (score >= 80)
#define LED_YELLOW      5   // Moderate (50-79)
#define LED_RED         6   // Spoiled (<50)
#define BUZZER_PIN      9
#define ESP_RX          2   // SoftSerial: Arduino RX ← ESP TX
#define ESP_TX          3   // SoftSerial: Arduino TX → ESP RX (voltage divider!)

// ── Wi-Fi / Server Config ─────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASS     = "YOUR_WIFI_PASSWORD";
const char* SERVER_HOST   = "localhost";      // Replace with Render URL in production
const int   SERVER_PORT   = 5000;
const char* POST_PATH     = "/api/sensor";
const char* DEVICE_ID     = "arduino-01";
const char* DEVICE_KEY    = "your_secret_here";  // Must match DEVICE_SECRET_KEY in .env

// ── Globals ───────────────────────────────────────────────────
SoftwareSerial espSerial(ESP_RX, ESP_TX);
DHT dht(DHT_PIN, DHT_TYPE);

unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 5000; // 5 seconds

// ── PPM Conversion ─────────────────────────────────────────────
float rawToPpm(int raw) {
  if (raw <= 300) return ((float)raw / 300.0) * 10.0;
  if (raw <= 600) return 10.0 + ((float)(raw - 300) / 300.0) * 40.0;
  if (raw <= 800) return 50.0 + ((float)(raw - 600) / 200.0) * 100.0;
  return 150.0 + ((float)(raw - 800) / 223.0) * 150.0;
}

// ── ESP8266 Helpers ────────────────────────────────────────────
bool sendATCommand(const String& cmd, const String& expectedResponse, unsigned long timeout = 2000) {
  espSerial.println(cmd);
  unsigned long start = millis();
  String resp = "";
  while (millis() - start < timeout) {
    if (espSerial.available()) resp += (char)espSerial.read();
    if (resp.indexOf(expectedResponse) >= 0) return true;
  }
  Serial.println("[ESP] Response: " + resp);
  return false;
}

bool connectWiFi() {
  sendATCommand("AT", "OK");
  sendATCommand("AT+CWMODE=1", "OK");
  String joinCmd = "AT+CWJAP=\"" + String(WIFI_SSID) + "\",\"" + String(WIFI_PASS) + "\"";
  return sendATCommand(joinCmd, "OK", 10000);
}

bool postSensorData(int mq2Raw, float mq2Ppm, float temp, float humidity) {
  // Build JSON body
  String body = "{\"mq2Raw\":" + String(mq2Raw) +
                ",\"mq2Ppm\":" + String(mq2Ppm, 1) +
                ",\"temperature\":" + String(temp, 1) +
                ",\"humidity\":" + String(humidity, 1) +
                ",\"deviceId\":\"" + String(DEVICE_ID) + "\"}";

  int contentLength = body.length();

  // HTTP request string
  String httpReq = "POST " + String(POST_PATH) + " HTTP/1.1\r\n";
  httpReq += "Host: " + String(SERVER_HOST) + "\r\n";
  httpReq += "Content-Type: application/json\r\n";
  httpReq += "x-device-key: " + String(DEVICE_KEY) + "\r\n";
  httpReq += "Content-Length: " + String(contentLength) + "\r\n";
  httpReq += "Connection: close\r\n\r\n";
  httpReq += body;

  // Open TCP connection
  String cipStart = "AT+CIPSTART=\"TCP\",\"" + String(SERVER_HOST) + "\"," + String(SERVER_PORT);
  if (!sendATCommand(cipStart, "OK", 5000)) {
    Serial.println("[ESP] TCP connect failed");
    return false;
  }

  // Send data
  String cipSend = "AT+CIPSEND=" + String(httpReq.length());
  if (!sendATCommand(cipSend, ">", 2000)) {
    Serial.println("[ESP] CIPSEND failed");
    return false;
  }

  espSerial.print(httpReq);
  unsigned long start = millis();
  String resp = "";
  while (millis() - start < 5000) {
    if (espSerial.available()) resp += (char)espSerial.read();
    if (resp.indexOf("SEND OK") >= 0 || resp.indexOf("200 OK") >= 0) break;
  }

  sendATCommand("AT+CIPCLOSE", "OK", 2000);
  return resp.indexOf("SEND OK") >= 0 || resp.indexOf("201") >= 0;
}

// ── LED + Buzzer Feedback ──────────────────────────────────────
void setStatusLEDs(float mq2Ppm, float temp) {
  bool alarm = (mq2Ppm > 50 || temp > 35);
  digitalWrite(LED_GREEN,  LOW);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_RED,    LOW);
  // Note: FreshScore is computed on backend; for local LEDs use gas as proxy
  if (alarm) {
    digitalWrite(LED_RED, HIGH);
    // Short buzzer pulse
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);
    digitalWrite(BUZZER_PIN, LOW);
  } else if (mq2Ppm < 20) {
    digitalWrite(LED_GREEN, HIGH);
  } else {
    digitalWrite(LED_YELLOW, HIGH);
  }
}

// ── Setup ─────────────────────────────────────────────────────
void setup() {
  Serial.begin(9600);
  espSerial.begin(9600);
  dht.begin();

  pinMode(LED_GREEN,  OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_RED,    OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  Serial.println("[FreshScan] Booting...");
  delay(2000);  // MQ-2 warm-up

  Serial.println("[FreshScan] Connecting to Wi-Fi...");
  if (connectWiFi()) {
    Serial.println("[FreshScan] Wi-Fi connected!");
    digitalWrite(LED_GREEN, HIGH);
    delay(500);
    digitalWrite(LED_GREEN, LOW);
  } else {
    Serial.println("[FreshScan] Wi-Fi FAILED — check SSID/password");
    digitalWrite(LED_RED, HIGH);
  }
}

// ── Loop ──────────────────────────────────────────────────────
void loop() {
  unsigned long now = millis();
  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;

    // Read sensors
    int  mq2Raw  = analogRead(MQ2_ANALOG_PIN);
    float mq2Ppm = rawToPpm(mq2Raw);
    float temp   = dht.readTemperature();
    float humid  = dht.readHumidity();

    // Validate DHT22 reading
    if (isnan(temp) || isnan(humid)) {
      Serial.println("[DHT22] Read failed — skipping this cycle");
      return;
    }

    // Print to Serial Monitor
    Serial.print("[Sensor] MQ2 Raw="); Serial.print(mq2Raw);
    Serial.print("  PPM=");  Serial.print(mq2Ppm, 1);
    Serial.print("  Temp="); Serial.print(temp, 1);
    Serial.print("°C  Hum="); Serial.print(humid, 1);
    Serial.println("%");

    // Update LEDs
    setStatusLEDs(mq2Ppm, temp);

    // POST to backend
    bool ok = postSensorData(mq2Raw, mq2Ppm, temp, humid);
    Serial.println(ok ? "[ESP] POST success" : "[ESP] POST failed");
  }
}

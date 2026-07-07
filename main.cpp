//This our code for the hardware part (ESP32 and other sensors[RFID card and others])
//This code here connects to our backend and from our backend to the system UI
// OrderWatch ESP32 Firmware — Demo-Ready Version
// Reads an RFID tap, maps it to a registered rider, and sends a transit payment to the backend.
 
#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>
 
// ===== WiFi Credentials =====
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
 
// ===== Backend Endpoint =====
const char* serverName = "https://orderwatch-cg01.onrender.com/api/v1/payments/p2p-transfer";
 
// ===== This Device's Driver ID =====
// Get this from your backend after registering the driver (check /api/v1/drivers/active or your DB log)
const char* driverId = "ow_driver_123456"; // <-- REPLACE with real registered driver systemId
 
// ===== RFID UID -> Rider ID map =====
// Register 2-3 test riders in the app first, grab their systemId from the register response,
// then tap each card once and print the UID (see printUID()) to fill this in.
struct RiderCard {
  const char* uid;
  const char* riderId;
};
 
RiderCard knownRiders[] = {
  { "AA:BB:CC:DD", "ow_rider_000001" }, // <-- REPLACE with real UID + real riderId
  { "11:22:33:44", "ow_rider_000002" }, // <-- REPLACE with real UID + real riderId
};
const int NUM_KNOWN_RIDERS = 2;
 
// ===== Fare =====
const int STANDARD_FARE = 500;
 
// ===== RFID Pins (adjust to your wiring) =====
#define SS_PIN 5
#define RST_PIN 22
MFRC522 rfid(SS_PIN, RST_PIN);
 
// Debounce: ignore repeat taps of the same card within this window
unsigned long lastTapTime = 0;
String lastTapUID = "";
const unsigned long DEBOUNCE_MS = 4000;
 
void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();
 
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi connected");
  Serial.println("📡 OrderWatch terminal ready — tap a card.");
}
 
String getUIDString() {
  String uidStr = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uidStr += "0";
    uidStr += String(rfid.uid.uidByte[i], HEX);
    if (i < rfid.uid.size - 1) uidStr += ":";
  }
  uidStr.toUpperCase();
  return uidStr;
}
 
const char* lookupRiderId(String uid) {
  for (int i = 0; i < NUM_KNOWN_RIDERS; i++) {
    if (uid.equals(knownRiders[i].uid)) {
      return knownRiders[i].riderId;
    }
  }
  return nullptr;
}
 
void sendPaymentToCloud(const char* riderId) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected — cannot send payment.");
    return;
  }
 
  WiFiClientSecure client;
  client.setInsecure(); // 🚨 Hackathon shortcut — skips SSL cert check
 
  HTTPClient http;
  http.begin(client, serverName);
  http.addHeader("Content-Type", "application/json");
 
  // Field names must match backend's /api/v1/payments/p2p-transfer exactly
  StaticJsonDocument<200> doc;
  doc["senderId"] = riderId;
  doc["receiverId"] = driverId;
  doc["amount"] = STANDARD_FARE;
 
  String requestBody;
  serializeJson(doc, requestBody);
 
  Serial.print("📤 Sending: ");
  Serial.println(requestBody);
 
  int httpResponseCode = http.POST(requestBody);
 
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("✅ Payment response:");
    Serial.println(response);
    // TODO: light green LED / show "Success" on LCD
  } else {
    Serial.print("❌ HTTP error: ");
    Serial.println(httpResponseCode);
    // TODO: light red LED / show "Failed" on LCD
  }
 
  http.end();
}
 
void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }
 
  String uid = getUIDString();
  unsigned long now = millis();
 
  // Debounce: skip if same card tapped again within the window
  if (uid == lastTapUID && (now - lastTapTime) < DEBOUNCE_MS) {
    rfid.PICC_HaltA();
    return;
  }
 
  Serial.print("💳 Card tapped, UID: ");
  Serial.println(uid);
 
  const char* riderId = lookupRiderId(uid);
 
  if (riderId == nullptr) {
    Serial.println("⚠️ Unknown card — not registered to any rider.");
    // TODO: flash red LED / show "Unknown Card"
  } else {
    Serial.print("👤 Matched rider: ");
    Serial.println(riderId);
    sendPaymentToCloud(riderId);
  }
 
  lastTapUID = uid;
  lastTapTime = now;
 
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}
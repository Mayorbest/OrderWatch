//This our code for the hardware part (ESP32 and other sensors[RFID card and others])
//This code here connects to our backend and from our backend to the system UI
#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h> // Make sure you install this library!

// Your WiFi Credentials
const char* ssid = "YOUR_WIFI_NAME"; 
const char* password = "YOUR_WIFI_PASSWORD";

// Your Live Render API Endpoint
const char* serverName = "https://orderwatch-cg01.onrender.com/api/v1/payments/p2p-transfer";

// ... (Your standard MFRC522 setup goes here) ...

void sendPaymentToCloud(String rfidUID) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure(); // 🚨 HACKATHON BYPASS: Skips SSL cert verification so it doesn't crash
    
    HTTPClient http;
    http.begin(client, serverName);
    http.addHeader("Content-Type", "application/json");

    // Build the JSON payload
    // You must format this to match exactly what your Express backend expects!
    StaticJsonDocument<200> doc;
    doc["riderId"] = rfidUID;       // The card ID tapped
    doc["driverId"] = "driver_001"; // Hardcoded for demo, or read from device state
    doc["amount"] = 500;            // Standard transit fare
    
    String requestBody;
    serializeJson(doc, requestBody);

    Serial.print("Sending Payload: ");
    Serial.println(requestBody);

    // Fire the POST request
    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("✅ Payment Success:");
      Serial.println(response);
      // TODO: Trigger Green LED or LCD "Success" Message
    } else {
      Serial.print("❌ Error on sending POST: ");
      Serial.println(httpResponseCode);
      // TODO: Trigger Red LED or LCD "Failed" Message
    }
    http.end();
  } else {
    Serial.println("❌ Error in WiFi connection");
  }
}
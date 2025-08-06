#include <WiFi.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

const char* ssid = "L1";
const char* password = "0932633299";

const char* host = "192.168.10.169";
const int port = 8000;

unsigned long lastSendTime = 0;

Servo myservo;

void setup() {
  Serial.begin(115200);
  wifiConnect();
  myservo.attach(18);
}

void loop() {
  // Nếu mất WiFi → tự kết nối lại
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost. Reconnecting...");
    wifiConnect();
  }

  // Gửi mỗi 5 giây khi WiFi vẫn còn
  if (millis() - lastSendTime > 2000 && WiFi.status() == WL_CONNECTED) {
    getOpenCanRequest();
    lastSendTime = millis();
  }
}

void wifiConnect() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Connected!");
}

void sendPostRequest() {
  WiFiClient client;

  // Kiểm tra kết nối tới server trước khi gửi
  if (!client.connect(host, port)) {
    Serial.println("❌ Cannot connect to host:port");
    return;
  }

  // Tạo JSON từ số random
  int value = random(0, 101);
  String jsonData = "{\"value\": " + String(value) + "}";

  Serial.print("✅ Sending JSON: ");
  Serial.println(jsonData);

  // Gửi POST request
  client.println("POST /trash/trash-volume HTTP/1.1");
  client.println("Host: " + String(host));
  client.println("Content-Type: application/json");
  client.println("Connection: close");
  client.print("Content-Length: ");
  client.println(jsonData.length());
  client.println();
  client.println(jsonData);

  // Đọc phản hồi
  while (client.connected()) {
    while (client.available()) {
      String line = client.readStringUntil('\n');
      Serial.println(line);
    }
  }

  client.stop();
}

void getOpenCanRequest(){
  WiFiClient client;
  String json = "";

  if (!client.connect(host, port)) {
    Serial.println("❌ Cannot connect to host:port");
    return;
  }

  client.print(String("GET ") + "/can/get-req" + " HTTP/1.1\r\n"
              + "Host: " + host + "\r\n"
              + "Connection: close\r\n\r\n");

  while (client.connected()) {
    while (client.available()) {
      String line = client.readStringUntil('\n');
      int idx = line.indexOf("{");
      if (idx != -1) {
        json = line.substring(idx);
      }
    }
  }

  client.stop();

  if (json.length() == 0) {
    Serial.println("❌ Không tìm thấy JSON trong phản hồi");
    return;
  }

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, json);

  if (error) {
    Serial.print(F("❌ deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }

  const char* code = doc["code"];
  const char* message = doc["message"];

  Serial.print("✅ Server responded with code: ");
  Serial.println(code);
  Serial.println(message);

  if (strcmp(code, "success") == 0) {
    myservo.write(90);
    delay(2000);
    myservo.write(0);
  }
}

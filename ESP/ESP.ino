#include <WiFi.h>

const char* ssid = "L1";
const char* password = "0932633299";

const char* host = "192.168.10.169";
const int port = 8000;

unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  wifiConnect();
}

void loop() {
  // Nếu mất WiFi → tự kết nối lại
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost. Reconnecting...");
    wifiConnect();
  }

  // Gửi mỗi 5 giây khi WiFi vẫn còn
  if (millis() - lastSendTime > 5000 && WiFi.status() == WL_CONNECTED) {
    sendPostRequest();
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
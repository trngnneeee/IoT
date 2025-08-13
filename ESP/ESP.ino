#include <WiFi.h>
#include <WiFiManager.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

const char* ssid = "Haha";
const char* password = "12345678";

const char* host = "10.123.1.83";
const int port = 8000;

unsigned long lastCheckOpenCanRequest = 0;
unsigned long lastSendTrashPercentage = 0;

Servo myservo1;
Servo myservo2;
Servo myservo3;

int echo_pin_1 = 21;
int trig_pin_1 = 22;

int echo_pin_2 = 23;
int trig_pin_2 = 25;

int echo_pin_3 = 26;
int trig_pin_3 = 27;


void setup() {
  Serial.begin(115200);
  wifiConnect();
  myservo1.attach(17);
  myservo2.attach(18);
  myservo3.attach(19);
  pinMode(trig_pin_1, OUTPUT);
  pinMode(echo_pin_1, INPUT);

  pinMode(trig_pin_2, OUTPUT);
  pinMode(echo_pin_2, INPUT);

  pinMode(trig_pin_3, OUTPUT);
  pinMode(echo_pin_3, INPUT);
}

void loop() {
  // Nếu mất WiFi → tự kết nối lại
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost. Reconnecting...");
    wifiConnect();
  }

  // Gửi mỗi 5 giây khi WiFi vẫn còn
  if (millis() - lastCheckOpenCanRequest > 2000 && WiFi.status() == WL_CONNECTED) {
    getOpenCanRequest();
    lastCheckOpenCanRequest = millis();
  }

  long distance1 = getDistance(trig_pin_1, echo_pin_1);
  long distance2 = getDistance(trig_pin_2, echo_pin_2);
  long distance3 = getDistance(trig_pin_3, echo_pin_3);
  // Serial.print("d1=");
  // Serial.println(distance1);
  // Serial.print("d2=");
  // Serial.println(distance2);
  // Serial.print("d3=");
  // Serial.println(distance3);
  if (millis() - lastSendTrashPercentage > 1000 * 60 && WiFi.status() == WL_CONNECTED && distance1 != 0 && distance2 != 0 && distance3 != 0){
    float percentage1 = ((15.0f - (float)distance1) / 15.0f) * 100.0f;
    percentage1 = constrain(percentage1, 0, 100);

    float percentage2 = ((15.0f - (float)distance2) / 15.0f) * 100.0f;
    percentage2 = constrain(percentage2, 0, 100);

    float percentage3 = ((15.0f - (float)distance3) / 15.0f) * 100.0f;
    percentage3 = constrain(percentage3, 0, 100);
    sendTrashPercentage(percentage1, percentage2, percentage3);
    if (percentage1 >= 100 || percentage2 >= 100 || percentage3 >= 100) {
      sendQuickAlert();
    }
    lastSendTrashPercentage = millis();
  }
}

long getDistance(int TRIG_PIN, int ECHO_PIN){
  long duration, distance;
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  duration = pulseIn(ECHO_PIN, HIGH);
  distance = (duration * 0.034) / 2;
  return distance;
}

void wifiConnect() {
  Serial.begin(115200);

  // Khởi tạo một đối tượng WiFiManager
  WiFiManager wifiManager;

  // Nếu bạn muốn xóa thông tin WiFi đã lưu để test lại từ đầu, hãy bỏ comment dòng dưới.
  // wifiManager.resetSettings();

  // Đặt tên cho Điểm Truy Cập (Access Point) mà ESP32-CAM sẽ tạo ra
  const char *apName = "Smart Bin";

  // Khi vào chế độ cấu hình, chúng ta sẽ cho đèn Flash nhấp nháy để báo hiệu
  wifiManager.setAPCallback([](WiFiManager *myWiFiManager) {
    Serial.println("Đang trong chế độ cấu hình WiFi...");
    Serial.print("Mở WiFi trên điện thoại và kết nối vào mạng: ");
    Serial.println(myWiFiManager->getConfigPortalSSID());
  });

  // Bắt đầu quá trình tự động kết nối.
  if (!wifiManager.autoConnect(apName)) {
    Serial.println("Không thể kết nối WiFi và đã hết thời gian chờ.");
    Serial.println("Đang khởi động lại...");
    ESP.restart();
    delay(1000);
  }

  // Nếu code chạy đến đây, nghĩa là đã kết nối WiFi thành công!
  Serial.println("");
  Serial.println("=============================================");
  Serial.println("ĐÃ KẾT NỐI WIFI THÀNH CÔNG!");
  Serial.print("Tên WiFi (SSID): ");
  Serial.println(WiFi.SSID());
  Serial.print("Địa chỉ IP của ESP32-CAM: ");
  Serial.println(WiFi.localIP());
  Serial.println("=============================================");
}

void sendTrashPercentage(float p1, float p2, float p3) {
  WiFiClient client;

  // Kiểm tra kết nối tới server trước khi gửi
  if (!client.connect(host, port)) {
    Serial.println("❌ Cannot connect to host:port");
    return;
  }

  // Tạo JSON từ số random
  String jsonData = "{";
  jsonData += "\"percentage1\": " + String(p1, 2) + ",";
  jsonData += "\"percentage2\": " + String(p2, 2) + ",";
  jsonData += "\"percentage3\": " + String(p3, 2);
  jsonData += "}";

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

void getOpenCanRequest() {
  WiFiClient client;
  String response = "";

  if (!client.connect(host, port)) {
    Serial.println("❌ Cannot connect to host:port");
    return;
  }

  client.print(String("GET ") + "/can/get-req" + " HTTP/1.1\r\n"
              + "Host: " + host + "\r\n"
              + "Connection: close\r\n\r\n");

  // Đọc toàn bộ response
  while (client.connected() || client.available()) {
    while (client.available()) {
      char c = client.read();
      response += c;
    }
  }

  client.stop();

  int bodyIndex = response.indexOf("\r\n\r\n");
  if (bodyIndex == -1) {
    Serial.println("❌ Không tìm thấy phần body trong phản hồi");
    return;
  }

  String body = response.substring(bodyIndex + 4);

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, body);

  if (error) {
    Serial.print(F("❌ deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }

  const char* code = doc["code"] | "";
  const char* message = doc["message"] | "";
  int id = doc["id"] | 0;

  if (strcmp(code, "success") == 0 && id != 0) {
    switch (id) {
      case 1:
        myservo1.write(90);
        delay(5000);
        myservo1.write(0);
        break;
      case 2:
        myservo2.write(90);
        delay(5000);
        myservo2.write(0);
        break;
      case 3:
        myservo3.write(90);
        delay(5000);
        myservo3.write(0);
        break;
      case 4:
        myservo1.write(90);
        myservo2.write(90);
        myservo3.write(90);
        delay(5000);
        myservo1.write(0);
        myservo2.write(0);
        myservo3.write(0);
        break;
      default:
        Serial.println("❌ Unknown servo id");
        break;
    }
  }
}

void sendTrashWeightPost(float w1, float w2, float w3){
  WiFiClient client;

  if (!client.connect(host, port)) {
    Serial.println("❌ Cannot connect to host:port");
    return;
  }

  String jsonData = "{";
  jsonData += "\"w1\": " + String(w1, 2) + ",";
  jsonData += "\"w2\": " + String(w2, 2) + ",";
  jsonData += "\"w3\": " + String(w3, 2);
  jsonData += "}";

  Serial.print("✅ Sending JSON: ");
  Serial.println(jsonData);

  client.println("POST /trash/trash-weight HTTP/1.1");
  client.println("Host: " + String(host));
  client.println("Content-Type: application/json");
  client.println("Connection: close");
  client.print("Content-Length: ");
  client.println(jsonData.length());
  client.println();
  client.println(jsonData);

  while (client.connected()) {
    while (client.available()) {
      String line = client.readStringUntil('\n');
      Serial.println(line);
    }
  }

  client.stop();
}

void sendQuickAlert() {
  const char* alertHost = "www.pushsafer.com";
  const int httpsPort = 443;
  const char* request = "/api?k=TocWNUNTEXwJHxjwRK0z&m=%5Bsize%3D24%5DC%E1%BA%A3nh%20b%C3%A1o%20th%C3%B9ng%20r%C3%A1c%20%C4%91%E1%BA%A7y%5B%2Fsize%5D%0AH%E1%BB%87%20th%E1%BB%91ng%20ph%C3%A1t%20hi%E1%BB%87n%20th%C3%B9ng%20r%C3%A1c%20b%E1%BA%A1n%20%C4%91%C3%A3%20%C4%91%E1%BA%A7y.%C2%A0%0AVui%20l%C3%B2ng%20d%E1%BB%8Dn%20d%E1%BA%B9p%20th%C3%B9ng%20r%C3%A1c%20c%E1%BB%A7a%20b%E1%BA%A1n";

  WiFiClientSecure client;
  client.setInsecure();
  Serial.print("Connecting to ");
  Serial.println(alertHost);

  if (!client.connect(alertHost, httpsPort)) {
    Serial.println("❌ HTTPS connection failed!");
    return;
  }

  client.print(String("GET ") + request + " HTTP/1.1\r\n" +
               "Host: " + alertHost + "\r\n" +
               "User-Agent: ESP32\r\n" +
               "Connection: close\r\n\r\n");

  while (client.connected()) {
    String line = client.readStringUntil('\n');
    Serial.println(line);
  }

  client.stop();
}
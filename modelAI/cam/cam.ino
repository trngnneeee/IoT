#include <WebServer.h>
#include <WiFi.h>
#include <esp32cam.h>
#include <WiFiManager.h>

 
const char* WIFI_SSID = "HCMUS-Thuvien";
const char* WIFI_PASS = "123456789";
 
WebServer server(80);
 
 
static auto loRes = esp32cam::Resolution::find(320, 240);
static auto midRes = esp32cam::Resolution::find(350, 530);
static auto hiRes = esp32cam::Resolution::find(800, 600);
void serveJpg()
{
  auto frame = esp32cam::capture();
  if (frame == nullptr) {
    Serial.println("CAPTURE FAIL");
    server.send(503, "", "");
    return;
  }
  Serial.printf("CAPTURE OK %dx%d %dbn", frame->getWidth(), frame->getHeight(),
                static_cast<int>(frame->size()));
 
  server.setContentLength(frame->size());
  server.send(200, "image/jpeg");
  WiFiClient client = server.client();
  frame->writeTo(client);
}
 
void handleJpgLo()
{
  if (!esp32cam::Camera.changeResolution(loRes)) {
    Serial.println("SET-LO-RES FAIL");
  }
  serveJpg();
}
 
void handleJpgHi()
{
  if (!esp32cam::Camera.changeResolution(hiRes)) {
    Serial.println("SET-HI-RES FAIL");
  }
  serveJpg();
}
 
void handleJpgMid()
{
  if (!esp32cam::Camera.changeResolution(midRes)) {
    Serial.println("SET-MID-RES FAIL");
  }
  serveJpg();
}
 

void  setup(){
  Serial.begin(115200);
  Serial.println();
  {
    using namespace esp32cam;
    Config cfg;
    cfg.setPins(pins::AiThinker);
    cfg.setResolution(hiRes);
    cfg.setBufferCount(2);
    cfg.setJpeg(80);
 
    bool ok = Camera.begin(cfg);
    Serial.println(ok ? "CAMERA OK" : "CAMERA FAIL");
  }
  wifiConnect();
  // Serial.print("http://");
  // Serial.println(WiFi.localIP());
  // Serial.println("  /cam-lo.jpg");
  // Serial.println("  /cam-hi.jpg");
  // Serial.println("  /cam-mid.jpg");
 
  server.on("/cam-lo.jpg", handleJpgLo);
  server.on("/cam-hi.jpg", handleJpgHi);
  server.on("/cam-mid.jpg", handleJpgMid);
 
  server.begin();
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

 
void loop()
{
  server.handleClient();
}
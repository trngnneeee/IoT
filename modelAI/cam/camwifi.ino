#include <WebServer.h>
#include <WiFi.h>
#include <esp32cam.h>
#include <WiFiManager.h>

WebServer server(80);

static auto loRes  = esp32cam::Resolution::find(320, 240);
static auto midRes = esp32cam::Resolution::find(640, 480);  // VGA ổn định hơn
static auto hiRes  = esp32cam::Resolution::find(800, 600);  // hoặc 1024x768 nếu lib hỗ trợ

void serveJpg(){
  auto frame = esp32cam::capture();
  if (!frame){
    Serial.println("CAPTURE FAIL");
    server.send(503, "text/plain", "CAPTURE FAIL");
    return;
  }
  server.setContentLength(frame->size());
  server.send(200, "image/jpeg");
  WiFiClient c = server.client();
  frame->writeTo(c);
}

void handleJpgLo (){ if (!esp32cam::Camera.changeResolution(loRes )) Serial.println("SET-LO-RES FAIL");  serveJpg(); }
void handleJpgMid(){ if (!esp32cam::Camera.changeResolution(midRes)) Serial.println("SET-MID-RES FAIL"); serveJpg(); }
void handleJpgHi (){ if (!esp32cam::Camera.changeResolution(hiRes )) Serial.println("SET-HI-RES FAIL");  serveJpg(); }

bool wifiConnect(){
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.setHostname("smart-bin-cam");

  WiFiManager wm;
  wm.setDebugOutput(true);
  wm.setMinimumSignalQuality(8);
  wm.setConfigPortalTimeout(120);

  const char* apName = "Smart Bin Cam";
  // ⚠️ ĐỪNG xoá cấu hình mỗi lần boot
  wm.resetSettings();

  if (!wm.autoConnect(apName)){
    Serial.println("WiFi config portal timeout. Restarting...");
    delay(100);
    ESP.restart();
    return false;
  }

  Serial.println("\n===== CONNECTED =====");
  Serial.printf("SSID: %s\n", WiFi.SSID().c_str());
  Serial.printf("IP  : %s\n", WiFi.localIP().toString().c_str());
  Serial.println("=====================");
  return true;
}

void setup(){
  Serial.begin(115200);
  delay(200);

  // 1) Kết nối Wi-Fi TRƯỚC
  if (!wifiConnect()) return;

  // 2) Sau khi có IP rồi mới bật camera
  using namespace esp32cam;
  Config cfg;
  cfg.setPins(pins::AiThinker);
  cfg.setResolution(midRes);   // khởi động bằng mid để nhẹ nguồn
  cfg.setBufferCount(2);
  cfg.setJpeg(75);             // nhẹ hơn 80
  bool ok = Camera.begin(cfg);
  Serial.println(ok ? "CAMERA OK" : "CAMERA FAIL");

  // 3) Router
  server.on("/cam-lo.jpg",  handleJpgLo);
  server.on("/cam-mid.jpg", handleJpgMid);
  server.on("/cam-hi.jpg",  handleJpgHi);
  server.begin();

  Serial.print("Open: http://");
  Serial.print(WiFi.localIP());
  Serial.println("/cam-mid.jpg");
}

void loop(){
  server.handleClient();
}

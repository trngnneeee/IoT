# This app ussing camera iot

import cv2
import numpy as np
import urllib.request
import torch
from PIL import Image
from my_model import CustomCNN  
from mongodb import MongoDBHandler
import time
from datetime import datetime
# Link MongoDB
MONGO_URL="mongodb+srv://23127438:23127438@cluster0.azne9nl.mongodb.net/IoT-Web?retryWrites=true&w=majority&appName=Cluster0"
collection = MongoDBHandler(MONGO_URL)

# ============================= Cấu hình Camera ======================
ESP32_URL = 'http://192.168.1.5/cam-hi.jpg'   # có thể là /capture hoặc /jpg tùy firmware

# ============================= Label product ==========================
LABELS = ['battery','biological','cardboard','clothes','glass',
          'metal','paper','plastic','shoes','trash']
ID_GROUPS = {
    "1": {"biological"},
    "2": {"paper","cardboard","plastic","glass","metal","clothes"},
    "3": {"trash","battery", "shoes"},
}

GROUPS = {
    "0": "Unknown",
    "1": "Organic",
    "2": "Recyclables",
    "3": "LANDFILL"
}

def map_label_to_group(label: str) -> str:
    for g, items in ID_GROUPS.items():
        if label in items:
            return g
    return "0"
def color_group(group: str) -> tuple:
    color = (255, 255, 255)  # mặc định xám nếu không tìm thấy nhóm
    # chọn màu theo nhóm
    if group == "Recyclables":
        color = (40, 220, 10)      # xanh lá
    elif group == "Organic":
        color = (100, 200, 200)    # xanh ngọc
    elif group == "LANDFILL":
        color = (0, 0, 255)        # đỏ đậm (BGR)
    else:
        color = (200, 200, 200)    # xám
    return color

# =============================================================
# ==================================MODEL======================
# Load model 1 lần
MODEL_PATH = 'model/model.pth'               
device = torch.device('cpu')
model = CustomCNN()
state = torch.load(MODEL_PATH, map_location=device)
model.load_state_dict(state)
model.eval()
CONF_THRESHOLD = 0.6                         # ngưỡng “Không rõ”: giúp model tự tin khi ra quyết định.
INFER_EVERY = 2                               # suy luận mỗi frame (đặt 2–5 nếu muốn giảm tải CPU)

# Chuẩn hóa ImageNet theo Training model
MEAN = torch.tensor([0.485, 0.456, 0.406]).view(1,3,1,1)
STD  = torch.tensor([0.229, 0.224, 0.225]).view(1,3,1,1)

# Setup time to insert data and threshold to send
MIN_INSERT_INTERVAL = 10  # seconds
MIN_DISPLAY_INTERVAL = 2  # seconds
MAX_SET_UP = 30  # seconds
last_insert_time = 0
last_pre = None

pre_time_start = 0
last_sent_label = None  # nếu muốn chống gửi trùng nhãn

# =======================================================

def grab_frame(url, timeout=5):
    resp = urllib.request.urlopen(url, timeout=timeout)
    data = resp.read()
    arr = np.frombuffer(data, dtype=np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise RuntimeError("Không decode được frame (cv2.imdecode trả None)")
    return frame

def preprocess_bgr(frame_bgr):
    # cv2 BGR -> RGB
    img_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    # resize về 224x224 (khớp với model)
    img_rgb = cv2.resize(img_rgb, (224, 224), interpolation=cv2.INTER_LINEAR)
    # [H,W,C] -> float32 [0..1]
    arr = img_rgb.astype(np.float32) / 255.0
    # -> [C,H,W]
    arr = np.transpose(arr, (2,0,1))
    x = torch.from_numpy(arr).unsqueeze(0)  # [1,3,224,224]
    # Chuẩn hóa
    x = (x - MEAN) / STD
    return x

@torch.no_grad()
def predict_topk(frame_bgr, k=3):
    x = preprocess_bgr(frame_bgr)
    logits = model(x)
    probs = torch.softmax(logits, dim=1)[0]  # [10]
    topk_vals, topk_idx = torch.topk(probs, k)
    topk = [(LABELS[i.item()], float(topk_vals[j])) for j,i in enumerate(topk_idx)]
    pred_idx = int(torch.argmax(logits, dim=1))
    pred_conf = float(probs[pred_idx])
    pred_label = LABELS[pred_idx] if pred_conf >= CONF_THRESHOLD else "No predict"
    return pred_label, pred_conf, topk

def draw_overlay(frame, pred_label, pred_conf, topk):
    global last_insert_time, pre_time_start, last_pre

    h = 28
    y0 = 30
    group_label = map_label_to_group(pred_label)
    color = color_group(GROUPS[group_label])
    cv2.putText(frame, f"Predict_group:{GROUPS[group_label]}", (15, y0),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2, cv2.LINE_AA)

    y = y0 + h
    cv2.putText(frame, f"Predict: {pred_label} ({pred_conf:.2f})", (15, y),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (40, 220, 40), 1, cv2.LINE_AA)
    y += h
    for i, (lbl, p) in enumerate(topk, start=1):
        cv2.putText(frame, f"Top{i}: {lbl} ({p:.2f})", (15, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255,255,255), 1, cv2.LINE_AA)
        y += h

    # -------------------------------- Gửi Mongo------------------
    global last_insert_time, last_sent_label


    now = time.time()
    group_label = map_label_to_group(pred_label)
    if last_pre is None or pred_label != last_pre:
        last_pre = pred_label
        pre_time_start = time.time()
    if group_label != "0" and (now - last_insert_time) > MIN_INSERT_INTERVAL and (now - pre_time_start) > MIN_DISPLAY_INTERVAL:
        # Chỉ gửi khi nhãn khác lần trước tránh gửi trùng và setup lại sau 30s
        if pred_label != last_sent_label:
            doc = {
                "id": int(group_label),
                "pressedBy": "",       
                "pressed": False,
                "date": datetime.utcnow()  # BSON Date
            }
            try:
                collection.insert_one(doc)
                last_insert_time = now
                last_sent_label = pred_label
                print("Đã lưu vào MongoDB:", doc)
                cv2.putText(frame, f"Save {group_label} successful", (15, y),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255,255,255), 1, cv2.LINE_AA)
            except Exception as e:
                print("Mongo insert error:", e)
        else:
            if now - last_insert_time < MAX_SET_UP:
                last_sent_label = None  # reset lại khi object khác nhưng cùng label.

    return frame


def main():
    cv2.namedWindow("ESP32-CAM - Waste Classification", cv2.WINDOW_AUTOSIZE)
    frame_count = 0
    pred_label, pred_conf, topk = "—", 0.0, []

    while True:
        try:
            frame = grab_frame(ESP32_URL)
        except Exception as e:
            print("Lỗi đọc ESP32:", e)
            # hiển thị màn lỗi nhẹ nhàng
            frame = np.zeros((360,640,3), dtype=np.uint8)
            cv2.putText(frame, "ESP32-CAM fetch error...", (20, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0,0,255), 2, cv2.LINE_AA)
            cv2.imshow("ESP32-CAM - Waste Classification", frame)
            if (cv2.waitKey(300) & 0xFF) in (27, ord('q')):
                break
            continue

        # Giới hạn tần suất suy luận (tiết kiệm CPU)
        if frame_count % INFER_EVERY == 0:
            pred_label, pred_conf, topk = predict_topk(frame)
        
        frame = draw_overlay(frame, pred_label, pred_conf, topk)
        cv2.imshow("ESP32-CAM - Waste Classification", frame)

        key = cv2.waitKey(1) & 0xFF
        if key in (27, ord('q')):  # ESC hoặc Q để thoát
            break

        frame_count += 1

    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()

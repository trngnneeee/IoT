# This is app ussing for camera of your laptop
from PIL import Image
import io
import base64
import torch
import numpy as np
from flask import Flask, request, jsonify, render_template
from my_model import CustomCNN  # Đảm bảo rằng bạn import đúng mô hình CustomCNN

app = Flask(__name__)

# Khôi phục mô hình từ file .pth
model = CustomCNN()
model.load_state_dict(torch.load('model/model.pth', map_location=torch.device('cpu')))
model.eval()  # Chuyển mô hình về chế độ inference

# Danh sách các loại rác
text = {0: 'battery',
1: 'biological',
2: 'cardboard',
3: 'clothes',
4: 'glass',
5: 'metal',
6: 'paper',
7: 'plastic',
8: 'shoes',
9: 'trash'}
labels = ['battery', 'biological', 'cardboard', 'clothes', 'glass', 
          'metal', 'paper', 'plastic', 'shoes', 'trash']

# Hàm xử lý hình ảnh
def preprocess_image(image_data):
    try:
        # Kiểm tra dữ liệu đầu vào
        if not image_data:
            raise ValueError("No image data provided")
        
        # Giải mã chuỗi base64 thành bytes
        try:
            img_bytes = base64.b64decode(image_data)
        except Exception as e:
            raise ValueError(f"Invalid base64 data: {e}")
        
        # Kiểm tra độ dài dữ liệu
        if len(img_bytes) == 0:
            raise ValueError("Empty image data after base64 decode")
        
        print(f"Image bytes length: {len(img_bytes)}")
        print(f"First few bytes: {img_bytes[:20]}")
        
        # Mở ảnh từ dữ liệu byte
        try:
            # Tạo BytesIO object
            img_io = io.BytesIO(img_bytes)
            img_io.seek(0)  # Đảm bảo con trỏ ở đầu file
            
            img = Image.open(img_io)
            # Verify image để đảm bảo ảnh hợp lệ
            img.verify()
            
            # Mở lại vì verify() đóng file
            img_io.seek(0)
            img = Image.open(img_io)
            
            # Chuyển đổi sang RGB nếu cần thiết (xử lý các định dạng khác nhau)
            if img.mode != 'RGB':
                img = img.convert('RGB')
                
            print(f"Image format: {img.format}, mode: {img.mode}, size: {img.size}")
        except Exception as e:
            raise ValueError(f"Cannot open image: {e}")
        
        # Thay đổi kích thước ảnh theo yêu cầu của mô hình
        img = img.resize((224, 224))

        # Chuyển đổi ảnh thành numpy array 
        img_array = np.array(img)
        
        # Đảm bảo ảnh có 3 channels (RGB)
        if len(img_array.shape) != 3 or img_array.shape[2] != 3:
            raise ValueError(f"Invalid image shape: {img_array.shape}. Expected (224, 224, 3)")
        
        # Chuyển sang tensor PyTorch trước
        img_array = np.transpose(img_array, (2, 0, 1))  # (H, W, C) -> (C, H, W)
        img_array = np.expand_dims(img_array, axis=0)  # Thêm batch dimension
        tensor = torch.tensor(img_array, dtype=torch.float32) / 255.0  # Normalize to [0,1]
        
        # Áp dụng ImageNet normalization như trong training
        mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1)
        std = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1)
        tensor = (tensor - mean) / std
        
        # Debug: kiểm tra giá trị pixel
        print(f"Final tensor shape: {tensor.shape}")
        print(f"Final tensor min: {tensor.min()}, max: {tensor.max()}")
        print(f"Final tensor mean: {tensor.mean()}")
        
        return tensor
    except Exception as e:
        print(f"Error processing image: {e}")
        raise

# Route hiển thị trang chủ
@app.route('/')
def index():
    return render_template('index.html')  # Không cần 'templates/'

# Route xử lý nhận diện từ camera
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # Kiểm tra dữ liệu request
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
            
        image_data = data['image']
        print(f"Received image data length: {len(image_data) if image_data else 0}")
        
        image_array = preprocess_image(image_data)

        # Dự đoán với mô hình
        with torch.no_grad():
            prediction = model(image_array)
            
        # Debug: In ra các giá trị prediction
        print(f"Raw prediction values: {prediction}")
        print(f"Prediction shape: {prediction.shape}")
        
        # Tính softmax để xem xác suất
        probabilities = torch.nn.functional.softmax(prediction, dim=1)
        print(f"Probabilities: {probabilities}")
        
        # In ra top 3 predictions
        top3_values, top3_indices = torch.topk(probabilities, 3, dim=1)
        print("Top 3 predictions:")
        for i in range(3):
            idx = top3_indices[0][i].item()
            prob = top3_values[0][i].item()
            print(f"  {i+1}. {labels[idx]}: {prob:.4f}")

        # Chọn loại rác có xác suất cao nhất
        predicted_class = torch.argmax(prediction, dim=1).item()
        max_probability = probabilities[0][predicted_class].item()
        
        # Kiểm tra confidence threshold
        if max_probability < 0.4:  # Nếu xác suất thấp hơn 0.5
            predicted_label = "Không rõ"
        else:
            predicted_label = labels[predicted_class]
            
        print(f"Predicted class index: {predicted_class}, label: {predicted_label}, confidence: {max_probability:.4f}")
        return jsonify({'result': predicted_label})

    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

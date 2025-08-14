npm install -g npm@11.5.2
# intall fetch
npm install node-fetch@2 @types/node-fetch@2
# Cần tải OLLMA
https://ollama.com/download
# Install zod
npm install zod
# Cách cài đặt & chạy:
npm i
npm run dev   # (dev bằng ts-node)

# Build:
npm run build
npm start

# Mongo đảm bảo bạn đã tạo index:
db.bin_readings.createIndex({ binId: 1, createdAt: -1 })
db.commands.createIndex({ deviceId: 1, status: 1, createdAt: -1 })
# LLM đang sử dụng
**ollama pull qwen2.5:0.5b-instruct     # nhanh nhất trên CPU**
### Hoặc:
ollama pull llama3.2:1b
### Hoặc:
ollama pull phi3:mini


# TEST NHANH
“khối lượng thùng nhựa?”

“thùng hữu cơ đầy bao nhiêu %?”

“tình trạng cả 3 thùng”

“tổng rác hôm nay”

“lịch sử 6h thùng kim loại”

“mở thùng nhựa”


# CÁCH chạy chatbot:

## Mở 1 ter và chạy

+ ollama serve

++ Nếu không được thì thực hiện:
+ 1) Đảm bảo không còn tiến trình treo
taskkill /IM ollama.exe /F 2>$null

+ 2) Ép Ollama nghe đúng cổng 11434
$env:OLLAMA_HOST = "127.0.0.1:11434"
+ 3)  Chạy ollama
+ ollama serve

## Mở ter 2 và chạy
npm run dev

# Xem owr
http://127.0.0.1:3000/widget.html
from mongodb import MongoDBHandler # nếu cần lưu kết quả vào MongoDB
import time
from datetime import datetime
# Link MongoDB
MONGO_URL="mongodb+srv://23127438:23127438@cluster0.azne9nl.mongodb.net/IoT-Web?retryWrites=true&w=majority&appName=Cluster0"
collection = MongoDBHandler(MONGO_URL)

print(collection.find_one({"id": 2}))  # ví dụ tìm một tài liệu với id = 1
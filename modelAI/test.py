from mongodb_4G import MongoDBHandler # nếu cần lưu kết quả vào MongoDB
from mongodb_wifi import MongoDBHandler2
import time
from datetime import datetime
# Link MongoDB
# MONGO_URL="mongodb+srv://23127438:23127438@cluster0.azne9nl.mongodb.net/IoT-Web?retryWrites=true&w=majority&appName=Cluster0"
# collection1 = MongoDBHandler2(MONGO_URL)

# print(collection1.find_one({"id": 7}))  # ví dụ tìm một tài liệu với id = 1

NON_SRV_URI = (
  "mongodb://23127438:23127438@"
  "ac-82rops1-shard-00-00.azne9nl.mongodb.net:27017,"
  "ac-82rops1-shard-00-01.azne9nl.mongodb.net:27017,"
  "ac-82rops1-shard-00-02.azne9nl.mongodb.net:27017/"
  "?replicaSet=atlas-l5z4g6-shard-0&authSource=admin"
  "&retryWrites=true&w=majority&tls=true&appName=Cluster0"
)
collection = MongoDBHandler(user="23127438", password="23127438", uri=NON_SRV_URI)

doc = collection.find_one({"id": 7})  # ví dụ tìm một tài liệu với id = 2
print(doc)

doc = {
    "id": 5,
    "pressedBy": "",
    "pressed": False,
    "date": datetime.utcnow()  # BSON Date
}


print("[DBG] Writing to:",
      collection._client.address,            # (host, port) hiện tại
      collection._db.name,                   # "IoT-Web"
      collection.collection.name)            # "open-can"


res = collection.collection.insert_one(doc)  # chèn tài liệu mới vào MongoDB
print("[DBG] Inserted _id:", res.inserted_id)

from pymongo import MongoClient, errors

class MongoDBHandler:
    def __init__(self, uri):
        self.connection = MongoClient(
            uri,
            serverSelectionTimeoutMS=5000,  # fail nhanh nếu không kết nối được
            connectTimeoutMS=5000
        )
        # test kết nối sớm (tuỳ chọn)
        try:
            self.connection.admin.command("ping")
        except errors.ServerSelectionTimeoutError as e:
            print("Mongo connect error:", e)
            raise
        self.collection = self.connection["IoT-Web"]["open-can"]

    def find_one(self, query):
        return self.collection.find_one(query)

    def insert_one(self, document):
        return self.collection.insert_one(document)

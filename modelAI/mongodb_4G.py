# This app using camera iot using ESP32 connect 4G from iphone
from pymongo import MongoClient, errors
import urllib.parse
import os

def build_non_srv_uri(
    user: str,
    password: str,
    hosts: list[str],   # Host to link database
    replica_set: str,   # Help known primary in hosts to write, when primary not connect is connect secondary in hosts
    auth_source: str = "admin",
    app_name: str = "Cluster0",
) -> str:
    """
    Tạo non-SRV URI từ seed list hosts.
    - user/password sẽ được URL-encode.
    - hosts dạng: ["hostA:27017", "hostB:27017", "hostC:27017"]
    """
    user_enc = urllib.parse.quote(user)
    pwd_enc  = urllib.parse.quote(password)
    seedlist = ",".join(hosts)

    # tls=true cho Atlas: TLS (Transport Layer Security) -> mã hoá kên truyền; retryWrites & majority là thiết lập phổ biến/ổn định
    return (
        f"mongodb://{user_enc}:{pwd_enc}@{seedlist}"
        f"/?replicaSet={replica_set}"
        f"&authSource={auth_source}"
        f"&retryWrites=true&w=majority"
        f"&tls=true"
        f"&appName={urllib.parse.quote(app_name)}"
    )

class MongoDBHandler:
    def __init__(
        self,
        uri: str = None,  # Non-SRV URI
        *,
        user: str,
        password: str,
        hosts: list[str] = None,
        replica_set: str  = None,
        db_name: str = "IoT-Web",
        coll_name: str = "open-can",
        server_selection_timeout_ms: int = 15000,
        connect_timeout_ms: int = 10000,
        socket_timeout_ms: int = 20000,
    ):
        """
        Có cách khởi tạo:
        1) Truyền sẵn non-SRV `uri=...`
        2) Truyền `user`, `password`, `hosts`, `replica_set` để tự build URI.

        Ví dụ hosts Atlas là:
        [
          "ac-82rops1-shard-00-00.azne9nl.mongodb.net:27017",
          "ac-82rops1-shard-00-01.azne9nl.mongodb.net:27017",
          "ac-82rops1-shard-00-02.azne9nl.mongodb.net:27017",
        ]
        replica_set = "atlas-l5z4g6-shard-0"
        """
        if uri is None:
            # Cho phép đọc từ ENV nếu muốn “clean code”
            user = user or os.getenv("MONGO_USER", "")
            password = password or os.getenv("MONGO_PASS", "")
            if not hosts:
                env_hosts = os.getenv("MONGO_HOSTS", "")
                # Chuỗi env ngăn cách bằng dấu phẩy
                hosts = [h.strip() for h in env_hosts.split(",") if h.strip()]
            replica_set = replica_set or os.getenv("MONGO_REPLICA_SET", "")
            print(f"[DBG] Building non-SRV URI từ: user={user}, hosts={hosts}, replica_set={replica_set}")
            if not (user and password and hosts and replica_set):
                raise ValueError("Thiếu thông tin để build non-SRV URI (user/password/hosts/replica_set).")
            uri = build_non_srv_uri(user, password, hosts, replica_set)

        self._client = MongoClient(
            uri,
            serverSelectionTimeoutMS=server_selection_timeout_ms,
            connectTimeoutMS=connect_timeout_ms,
            socketTimeoutMS=socket_timeout_ms,
        )

        # Ping sớm để báo lỗi rõ ràng nếu không kết nối được
        try:
            self._client.admin.command("ping")
        except (errors.ServerSelectionTimeoutError, errors.ConfigurationError) as e:
            raise RuntimeError(f"Không kết nối được MongoDB (non-SRV). Kiểm tra mạng/URI/replicaSet. Chi tiết: {e}") from e

        self._db = self._client[db_name]
        self.collection = self._db[coll_name]

    # --- API mini giống bản cũ ---
    def find_one(self, query, *args, **kwargs):
        return self.collection.find_one(query, *args, **kwargs)

    def insert_one(self, document, *args, **kwargs):
        return self.collection.insert_one(document, *args, **kwargs)

    # Tiện ích thêm (tuỳ dùng):
    def close(self):
        self._client.close()

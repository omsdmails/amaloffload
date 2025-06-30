# peer_discovery.py

import socket, threading, time, zeroconf

SERVICE = "_tasknode._tcp.local."
PORT = 7520
PEERS = set()  # مجموعة URLs الجاهزة /run


# 🟢 دالة موثوقة لحساب IP المحلي (LAN)
def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip


# ❶ تسجيل الخدمة في LAN
def register_service():
    zc = zeroconf.Zeroconf()
    local_ip = get_local_ip()
    print(f"🟢 Local IP for registration: {local_ip}")

    info = zeroconf.ServiceInfo(
        SERVICE,
        f"{socket.gethostname()}.{SERVICE}",
        addresses=[socket.inet_aton(local_ip)],
        port=PORT,
        properties={b'load': b'0'}
    )

    try:
        zc.register_service(info)
        print(f"✅ Service registered: {SERVICE} on {local_ip}:{PORT}")
    except Exception as e:
        print(f"❌ Failed to register service: {e}")


# ❷ Listener لاكتشاف الأجهزة
class Listener:
    def _add(self, zc, t, name):
        info = zc.get_service_info(t, name)
        if info and info.addresses:
            ip = socket.inet_ntoa(info.addresses[0])
            peer_url = f"http://{ip}:{info.port}/run"
            PEERS.add(peer_url)
            print(f"🔗 Peer discovered: {peer_url}")

    add_service = _add

    # ✅ هذه الدالة تمنع FutureWarning
    def update_service(self, zc, t, name):
        pass  # يمكن تعديلها لاحقًا لو أردت

    # (اختياري) لو أردت التعامل مع إزالة خدمة
    def remove_service(self, zc, t, name):
        print(f"❌ Service removed: {name}")


def discover_loop():
    zc = zeroconf.Zeroconf()
    zeroconf.ServiceBrowser(zc, SERVICE, Listener())
    print(f"🔍 Started LAN discovery loop for {SERVICE}")
    while True:
        time.sleep(5)


# ❸ قائمة WAN ثابتة
STATIC_WAN = [
    # يمكن إضافة أجهزة معروفة للاختبار:
    # "http://your-vps-ip:7520/run",
]


def scan_internet_peers():
    """البحث عن أجهزة DTS على الإنترنت"""
    import requests

    try:
        response = requests.get("https://httpbin.org/ip", timeout=5)
        public_ip = response.json().get("origin", "").split(",")[0]
        print(f"🌐 Public IP: {public_ip}")

        ip_parts = public_ip.split(".")
        if len(ip_parts) == 4:
            base_ip = ".".join(ip_parts[:3])
            print(f"🔎 Scanning subnet: {base_ip}.x")

            found = 0

            for i in range(1, 255):
                potential_peer = f"http://{base_ip}.{i}:7520/run"
                health_url = potential_peer.replace("/run", "/health")
                try:
                    test_response = requests.get(health_url, timeout=1)

                    if test_response.status_code == 200:
                        project_url = potential_peer.replace("/run", "/project_info")
                        project_response = requests.get(project_url, timeout=1)

                        if project_response.status_code == 200:
                            project_data = project_response.json()
                            if (project_data.get("project_name") == "distributed-task-system"
                                and project_data.get("version") == "1.0"):
                                PEERS.add(potential_peer)
                                print(f"✅ Valid DTS node found: {potential_peer}")
                                found += 1
                            else:
                                print(f"⚠️ Different project: {potential_peer}")
                except Exception:
                    continue

            if found == 0:
                print("⚠️ لم يتم اكتشاف أي جهاز DTS متوافق في النطاق الحالي.")

    except Exception as e:
        print(f"⚠️ Internet discovery failed: {e}")


def wan_loop():
    while True:
        PEERS.update(STATIC_WAN)
        if STATIC_WAN:
            print(f"🔄 Added STATIC_WAN nodes: {STATIC_WAN}")

        if threading.active_count() < 10:
            threading.Thread(target=scan_internet_peers, daemon=True).start()
        else:
            print(f"⏸️ Too many threads active: {threading.active_count()}")

        time.sleep(300)  # كل 5 دقائق


# 🚀 تشغيل كل شيء
print("🚀 Peer Discovery System starting...")
threading.Thread(target=register_service, daemon=True).start()
threading.Thread(target=discover_loop, daemon=True).start()
threading.Thread(target=wan_loop, daemon=True).start()

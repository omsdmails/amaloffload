# peer_discovery.py
import socket, threading, time, zeroconf

SERVICE = "_tasknode._tcp.local."
PORT    = 7520
PEERS   = set()           # مجموعة URLs الجاهزة /run

# ❶ يسجّل الجهاز في LAN مع خاصيّة load=0
def register_service():
    zc = zeroconf.Zeroconf()
    info = zeroconf.ServiceInfo(
        SERVICE, f"{socket.gethostname()}.{SERVICE}",
        addresses=[socket.inet_aton(socket.gethostbyname(socket.gethostname()))],
        port=PORT, properties={b'load': b'0'}
    )
    zc.register_service(info)

# ❷ يكتشف الأجهزة الأخرى
class Listener:
    def _add(self, zc, t, name):
        info = zc.get_service_info(t, name)
        if info and info.addresses:
            ip  = socket.inet_ntoa(info.addresses[0])
            PEERS.add(f"http://{ip}:{info.port}/run")
    add_service    = _add
    update_service = _add     # ↞ حل مشكلة update_service

def discover_loop():
    zc = zeroconf.Zeroconf()
    zeroconf.ServiceBrowser(zc, SERVICE, Listener())
    while True: time.sleep(5)

# ❸ قائمة WAN ثابتة وخوادم اكتشاف عامة
STATIC_WAN = [
    # خوادم معروفة (يمكن إضافة المزيد)
    # "http://your-vps-ip:7520/run",
]

# خوادم اكتشاف عامة للبحث عن أجهزة جديدة
DISCOVERY_SERVERS = [
    "https://api.github.com/users",  # مثال - يمكن استبداله
    "https://httpbin.org/ip",        # للحصول على IP العام
]

def scan_internet_peers():
    """البحث عن أجهزة جديدة على الإنترنت"""
    import requests
    try:
        # الحصول على IP العام
        response = requests.get("https://httpbin.org/ip", timeout=5)
        public_ip = response.json().get("origin", "").split(",")[0]
        
        # البحث في نطاق الـ subnet للـ IP العام
        ip_parts = public_ip.split(".")
        if len(ip_parts) == 4:
            base_ip = ".".join(ip_parts[:3])
            for i in range(1, 255):
                potential_peer = f"http://{base_ip}.{i}:7520/run"
                try:
                    # فحص سريع للاتصال
                    test_response = requests.get(
                        potential_peer.replace("/run", "/health"), 
                        timeout=1
                    )
                    if test_response.status_code == 200:
                        PEERS.add(potential_peer)
                        print(f"✅ اكتُشف جهاز جديد: {potential_peer}")
                except:
                    continue
    except Exception as e:
        print(f"⚠️ خطأ في البحث على الإنترنت: {e}")

def wan_loop():
    while True:
        # إضافة الخوادم الثابتة
        PEERS.update(STATIC_WAN)
        
        # البحث عن أجهزة جديدة كل 5 دقائق
        if len(threading.active_count()) < 10:  # تجنب إنشاء خيوط كثيرة
            threading.Thread(target=scan_internet_peers, daemon=True).start()
        
        time.sleep(300)  # 5 دقائق

# إطلاق الخيوط
threading.Thread(target=register_service, daemon=True).start()
threading.Thread(target=discover_loop  , daemon=True).start()
threading.Thread(target=wan_loop       , daemon=True).start()

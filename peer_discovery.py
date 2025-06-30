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

# ❸ قائمة WAN ثابتة (اختياري)
STATIC_WAN = [
    # "http://your-vps-ip:7520/run",
]

def wan_loop():
    while True:
        PEERS.update(STATIC_WAN)
        time.sleep(60)

# إطلاق الخيوط
threading.Thread(target=register_service, daemon=True).start()
threading.Thread(target=discover_loop  , daemon=True).start()
threading.Thread(target=wan_loop       , daemon=True).start()

import psutil
import socket
import time
import requests

CPU_THRESHOLD = 50  # النسبة اللي بعدها يبدأ يوزّع المهام
LAN_PEERS = ['192.168.100.37']  # مثال
WAN_PEERS = ['89.111.171.92']  # مثال

def internet_available():
    try:
        socket.create_connection(("8.8.8.8", 53), timeout=2)
        return True
    except:
        return False

def find_available_peers(peers):
    available = []
    for ip in peers:
        try:
            r = requests.get(f"http://{ip}:7520/ping", timeout=2)
            if r.status_code == 200:
                available.append(ip)
        except:
            continue
    return available

def offload_task(peer_ip, task_data):
    try:
        r = requests.post(f"http://{peer_ip}:7520/process", json=task_data, timeout=10)
        return r.json()
    except:
        return None

while True:
    cpu = psutil.cpu_percent(interval=1)
    print(f"[INFO] Current CPU: {cpu}%")

    if cpu > CPU_THRESHOLD:
        print("[INFO] CPU high, checking peers...")

        if internet_available():
            print("[INFO] Internet available, searching LAN first...")
            peers = find_available_peers(LAN_PEERS)
            if not peers:
                print("[WARN] No LAN peers, checking WAN peers...")
                peers = find_available_peers(WAN_PEERS)
        else:
            print("[WARN] Internet unavailable, LAN only mode.")
            peers = find_available_peers(LAN_PEERS)

        if peers:
            print(f"[INFO] Available peers: {peers}")
            task = {"data": "Some heavy task"}
            result = offload_task(peers[0], task)
            print("[RESULT] ", result)
        else:
            print("[INFO] No peers available, processing locally...")

    else:
        print("[INFO] CPU normal, working locally.")

    time.sleep(5)


# load_balancer.py
import peer_discovery, requests, time, smart_tasks, psutil, socket

def send(peer, func, *args, **kw):
    try:
        r = requests.post(peer, json={"func": func,
                                      "args": list(args),
                                      "kwargs": kw}, timeout=12)
        return r.json()
    except Exception as e:
        return {"error": str(e)}

def choose_peer():
    best = None
    for p in list(peer_discovery.PEERS):
        try:
            cpu = requests.get(p.replace("/run", "/cpu"), timeout=2).json()["usage"]
            best = (p, cpu) if best is None or cpu < best[1] else best
        except: pass
    return best[0] if best else None

while True:
    peer = choose_peer()
    if peer:
        print(f"\n🛰️  إرسال إلى {peer}")
        res = send(peer, "prime_calculation", 30000)
    else:
        print("\n⚙️  لا أقران؛ العمل محليّ على", socket.gethostname())
        res = smart_tasks.prime_calculation(30000)
    print("🔹 النتيجة (جزئية):", str(res)[:120])
    time.sleep(10)

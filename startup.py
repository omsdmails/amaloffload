startup.py (نسخة شاملة تشغّل كل الخدمات تلقائيًا)
============================================================
• يقرأ auto‑start config
• يطلق peer_server + rpc_server + server (واجهة REST) + load_balancer
• يُبقي العمليات حيّة ويكتب السجلّات إلى autostart.log
============================================================
import subprocess import time import logging import sys from autostart_config import AutoStartManager from distributed_executor import DistributedExecutor
PY = sys.executable # مسار بايثون الحالي
SERVICES = [ ("peer_server.py", "Peer‑Server"), ("rpc_server.py", "RPC‑Server"), ("server.py", "REST‑Server"), # يعمل على 7521 حاليًا ("load_balancer.py", "Load‑Balancer"), ]
def launch_services(): procs = [] for script, name in SERVICES: try: p = subprocess.Popen([PY, script]) logging.info(f"✅ {name} قيد التشغيل (PID={p.pid})") procs.append(p) except FileNotFoundError: logging.error(f"❌ لم يُعثَر على {script}; تخطَّيته") return procs
def main(): logging.basicConfig( filename="autostart.log", level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s", )
try: cfg = AutoStartManager().config if not cfg.get("enabled", True): logging.info("التشغيل التلقائي مُعطل في الإعدادات") return # 1) تشغيل الخدمات الخلفيّة procs = launch_services() # 2) تهيئة نظام التنفيذ الموزع (ليتعرّف على هذا الجهاز كعقدة) executor = DistributedExecutor("my_shared_secret_123") executor.peer_registry.register_service("auto_node", 7520) logging.info("🚀 العقدة auto_node مُسجّلة في الـRegistry على 7520") # 3) حلقة إبقاء حيّة مع فحص العمليات while True: time.sleep(30) for p, (script, name) in zip(procs, SERVICES): if p.poll() is not None: logging.warning(f"⚠️ الخدمة {name} توقفت بشكل غير متوقع… إعادة تشغيل") new_p = subprocess.Popen([PY, script]) procs[procs.index(p)] = new_p logging.info(f"✅ {name} أُعيد تشغيلها (PID={new_p.pid})") except KeyboardInterrupt: logging.info("📴 إيقاف الخدمات يدويًا") except Exception as e: logging.error(f"خطأ في التشغيل التلقائي: {e}") finally: for p in procs: p.terminate() 
if name == "main": main()

# main.py – نسخة مصحَّحة نهائيّة

import sys
import time
import json
import subprocess
import logging

from your_tasks import data_processing, matrix_multiply, prime_calculation  # استورد الدوال صراحةً
from distributed_executor import DistributedExecutor

CPU_PORT   = 7520
PYTHON_EXE = sys.executable  # python أو python3 حسب البيئة

# ─── مهام مساعدة ─────────────────────────
def example_task(x):
    return x * x + complex_operation(x)  # تأكد من تعريف complex_operation في مكان آخر

def benchmark(fn, *args):
    start = time.time()
    res   = fn(*args)
    return time.time() - start, res

def start_background():
    """تشغيل Load Balancer و Peer Server كعمليّتين خلفيّتين"""
    subprocess.Popen([PYTHON_EXE, "peer_server.py"])
    subprocess.Popen([PYTHON_EXE, "load_balancer.py"])
    logging.info("✅ تم تشغيل الخدمات الخلفيّة (peer_server & load_balancer)")

def menu(exec_):
    tasks = {
        "1": ("ضرب المصفوفات",       matrix_multiply,         500),
        "2": ("حساب الأعداد الأولية", prime_calculation,    100000),
        "3": ("معالجة البيانات",     data_processing,        10000),
        # تأكد من تعريف image_processing_emulation أو احذف السطر التالي إن لم تكن معرّفة
        # "4": ("محاكاة معالجة الصور", image_processing_emulation, 100),
        "5": ("مهمة موزعة معقدة",   example_task,               42)
    }

    while True:
        print("\n🚀 نظام توزيع المهام الذكي")
        for k, v in tasks.items():
            print(f"{k}: {v[0]}")
        ch = input("اختر المهمة (أو q للخروج): ").strip().lower()
        if ch == 'q':
            break
        if ch not in tasks:
            print("⚠️ اختيار غير صحيح!")
            continue

        name, fn, arg = tasks[ch]
        print(f"\nتشغيل: {name} …")

        # تشغيل المهام مع المعاملات المناسبة
        try:
            if ch == "9":  # المهمة الموزعة المعقدة
                print("📡 إرسال المهمة إلى العقدة الموزعة…")
                result = exec_.submit(fn, arg).result()
                print(f"✅ النتيجة (موزعة): {result}")
            elif isinstance(arg, tuple):  # مهام بمعاملات متعددة
                dur, res = benchmark(fn, *arg)
                print(f"✅ النتيجة: {res}")
                print(f"⏱️ الوقت: {dur:.3f} ثانية")
            else:  # مهام بمعامل واحد
                dur, res = benchmark(fn, arg)
                print(f"✅ النتيجة: {res}")
                print(f"⏱️ الوقت: {dur:.3f} ثانية")
        except Exception as e:
            print(f"❌ خطأ في تنفيذ المهمة: {str(e)}")

# ─── نقطة الدخُول ─────────────────────────
def main():
    logging.basicConfig(level=logging.INFO)
    try:
        start_background()
        executor = DistributedExecutor("my_shared_secret_123")
        executor.peer_registry.register_service("node_main", CPU_PORT, load=0.2)
        logging.info("✅ النظام جاهز للعمل")
        menu(executor)
    except Exception as e:
        logging.error(f"🚫 خطأ رئيسي: {e}")

if __name__ == "__main__":
    try:
        # تفعيل ماسح الإنترنت
        from internet_scanner import internet_scanner
        internet_scanner.start_continuous_scan()

        # تشغيل الخادم في خيط منفصل
        import threading
        # Assuming 'app' and 'control' are defined elsewhere
        # You might need to import or define them based on your project structure
        # For example:
        # from your_app import app
        # from your_control import control

        # Dummy implementations to avoid errors if app and control are not available
        class DummyApp:
            def run(self, host, port, debug):
                print(f"Dummy App running on {host}:{port} (debug={debug})")
        class DummyControl:
            def start(self):
                print("Dummy Control started")

        app = DummyApp()
        control = DummyControl()

        server_thread = threading.Thread(target=lambda: app.run(host="0.0.0.0", port=7520, debug=False))
        server_thread.daemon = True
        server_thread.start()

        print("🔥 نظام المهام الموزعة نشط!")
        print("📡 جاري البحث عن الأجهزة المجاورة...")
        print("🌐 ماسح الإنترنت نشط - البحث عن خوادم عامة...")

        # تشغيل واجهة التحكم
        control.start()
    except KeyboardInterrupt:
        print("\n🛑 إيقاف النظام...")
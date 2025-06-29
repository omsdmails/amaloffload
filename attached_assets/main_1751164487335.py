# main.py
import time
import json
import subprocess
import logging
import sys                      # ← NEW
from distributed_executor import DistributedExecutor
from your_tasks import *

CPU_PORT   = "7520"              # ثَبّت البورت في متغيّر واحد
PYTHON_EXE = sys.executable      # ← سيستخدم python3 أو python.exe حسب بيئتك

def example_task(x):
    return x * x + complex_operation(x)

def benchmark(task_func, *args):
    start = time.time()
    result = task_func(*args)
    duration = time.time() - start
    return duration, result

def start_background_services():
    """تشغّل الـ Load Balancer و Peer Server كعمليات خلفيّة"""
    lb_proc   = subprocess.Popen([PYTHON_EXE, "load_balancer.py"])
    peer_proc = subprocess.Popen([PYTHON_EXE, "peer_server.py"])
    logging.info(f"✅ Load Balancer و Peer Server شغَّالان على البورت {CPU_PORT}")
    return lb_proc, peer_proc

def interactive_menu(executor):
    tasks = {
        "1": ("ضرب المصفوفات", matrix_multiply, 500),
        "2": ("حساب الأعداد الأولية", prime_calculation, 100000),
        "3": ("معالجة البيانات", data_processing, 10000),
        "4": ("محاكاة معالجة الصور", image_processing_emulation, 100),
        "5": ("مهمة موزعة معقدة", example_task, 42)
    }
    while True:
        print("\n🚀 نظام توزيع المهام الذكي")
        for k, v in tasks.items():
            print(f"{k}: {v[0]}")
        choice = input("اختر المهمة (أو 'q' للخروج): ").strip()
        if choice.lower() == 'q':
            break
        if choice in tasks:
            name, func, arg = tasks[choice]
            print(f"\nتشغيل: {name}...")
            if choice == "5":
                print("📡 إرسال المهمة إلى العقدة الموزعة…")
                result = executor.submit(func, arg).result()
                print(f"✅ النتيجة (موزعة): {result}")
            else:
                duration, result = benchmark(func, arg)
                print(f"✅ النتيجة: {json.dumps(result, indent=2)[:200]}...")
                print(f"⏱️ الزمن: {duration:.2f} ثانية")
        else:
            print("⚠️ اختيار غير صحيح!")

def main():
    logging.basicConfig(level=logging.INFO)
    try:
        # 1) تشغيل الخدمات الخلفيّة
        lb_proc, peer_proc = start_background_services()

        # 2) تهيئة منظومة التنفيذ الموزَّع
        executor = DistributedExecutor("my_shared_secret_123")
        executor.peer_registry.register_service("node_main", int(CPU_PORT), load=0.2)

        logging.info("✅ نظام توزيع المهام يعمل…")
        interactive_menu(executor)

    except Exception as e:
        logging.error(f"🚫 خطأ رئيسي: {e}")

if __name__ == "__main__":
    main()


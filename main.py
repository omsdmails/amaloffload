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
        if ch == "5":
            print("📡 إرسال إلى عقدة موزَّعة …")
            res = exec_.submit(fn, arg).result()
            print("✅ النتيجة (موزعة):", str(res)[:200])
        else:
            dur, res = benchmark(fn, arg)
            print("✅ النتيجة:", str(res)[:200], "…")
            print(f"⏱️ الزمن: {dur:.2f} ثانية")

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
    main()  # ⬅ المسافة البادئة صحيحة هنا


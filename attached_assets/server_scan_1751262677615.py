import random
import time

# هذه الوظيفة تحاكي وجود خوادم فارغة
def scan_for_empty_servers():
    print("نورا: أبحث عن خوادم متاحة...")
    time.sleep(2)

    # محاكاة نتائج الخوادم
    available_servers = [
        "server_01.cloudhost.com",
        "server_02.cloudhost.com",
        "server_test03.local",
        "server_backup04.cloudhost.com"
    ]

    # فلترة للسيرفرات الفارغة فقط بشكل عشوائي
    empty_servers = random.sample(available_servers, k=2)
    print("نورا: وجدت السيرفرات التالية المتاحة:", empty_servers)
    return empty_servers

# وظيفة النسخ إلى السيرفرات - وهمية وغير فعالة
def replicate_to_servers(servers):
    for server in servers:
        print(f"نورا: أقوم بنسخ نفسي إلى {server} (محاكاة)...")
        time.sleep(1.5)
    print("نورا: تمت العملية (وهمية لأغراض التطوير).")

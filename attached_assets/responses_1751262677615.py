
import os
import json
import logging
from difflib import get_close_matches
from analyzer import detect_media_type, fix_url

# إعدادات اللوق
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# تحميل الذاكرة (عامة أو خاصة بالمستخدم)
def load_memory(filename):
    if os.path.exists(filename):
        try:
            with open(filename, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            logging.warning(f"{filename} تالف، سيتم إنشاء ذاكرة جديدة")
            return {}
    return {}

# حفظ الذاكرة
def save_memory(filename, memory):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(memory, f, indent=2, ensure_ascii=False)

# ردود ذكية ثابتة وفق شروط محددة
def smart_auto_reply(message):
    msg = message.strip().lower()
    if "هل نبدأ" in msg or "ابدأ" in msg:
        return "نعم ابدأ"
    elif "نعم أو لا" in msg:
        return "نعم"
    elif " أو " in msg:
        return msg.split(" أو ")[0]
    elif "تفصيل" in msg:
        return "ليس الآن"
    elif "هل تود" in msg or msg.startswith("هل تريدني"):
        return "نعم"
    elif msg.startswith("ما هي"):
        return "ليس الآن"
    elif "هل تحتاج" in msg:
        return "نعم، شرح أكثر"
    elif "جاهز؟" in msg:
        return "ابدأ"
    elif msg.startswith("قول لي"):
        return "موافق"
    elif "إذا تبي" in msg:
        return "نعم"
    return None

# معالجة الروابط حسب نوعها (صورة، فيديو، صوت، أو رابط عادي)
def handle_url(message):
    media_type = detect_media_type(message)
    if media_type == 'image':
        return f'<img src="{message}" alt="صورة" width="300">'
    elif media_type == 'video':
        return f'<video controls width="300"><source src="{message}"></video>'
    elif media_type == 'audio':
        return f'<audio controls><source src="{message}"></audio>'
    else:
        return f'<a href="{message}" target="_blank">رابط خارجي</a>'

# تصحيح روابط موجودة داخل النص
def fix_urls_in_message(message):
    words = message.split()
    corrected = [fix_url(word) if '//' in word else word for word in words]
    return " ".join(corrected)

# الوظيفة الأساسية للردود مع استخدام ذاكرة خاصة بالمستخدم
def generate_reply(message, username="مجهول"):
    memory_file = f"memory_{username}.json"
    memory = load_memory(memory_file)

    # تحقق من رد ذكي مسبق
    auto_reply = smart_auto_reply(message)
    if auto_reply:
        logging.info(f"رد ذكي مستخدم: {auto_reply}")
        memory[message] = auto_reply
        save_memory(memory_file, memory)
        return auto_reply

    # تحقق من ذاكرة المستخدم
    if message in memory:
        return memory[message]

    # بحث عن تطابق قريب
    matches = get_close_matches(message, memory.keys(), n=1, cutoff=0.6)
    if matches:
        return memory[matches[0]]

    # معالجة الرابط إذا كان موجود
    if message.startswith("http://") or message.startswith("https://"):
        reply = handle_url(message)
    else:
        # رد عكسي كنموذج افتراضي
        reply = f"رد تلقائي: {message[::-1]}"

    # تصحيح الروابط داخل الرسالة
    if '//' in message:
        reply += "\nمصدر بعد التصحيح: " + fix_urls_in_message(message)

    # حفظ الرد في الذاكرة
    memory[message] = reply
    save_memory(memory_file, memory)
    return reply

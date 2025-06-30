import json
import time
from datetime import datetime

# 🧠 ملف التعلم الذاتي الأساسي
LEARNING_FILE = "nora_learning_data.json"

# ✅ تحميل البيانات الحالية (إذا كانت موجودة)
def load_knowledge():
    try:
        with open(LEARNING_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"lessons": []}

# 💾 حفظ البيانات بعد التحديث
def save_knowledge(data):
    with open(LEARNING_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# 🧠 إضافة درس جديد
def add_lesson(topic, content, source="نورا الأم"):
    data = load_knowledge()
    timestamp = datetime.utcnow().isoformat()
    
    lesson = {
        "timestamp": timestamp,
        "topic": topic,
        "content": content,
        "source": source
    }
    
    # منع التكرار
    if lesson not in data["lessons"]:
        data["lessons"].append(lesson)
        save_knowledge(data)
        print(f"[✓] Lesson added: {topic}")
    else:
        print(f"[!] Duplicate lesson skipped: {topic}")

# ⏱️ تنفيذ كل 10 دقائق
def auto_learn_loop():
    while True:
        # أمثلة على معلومات تُضاف تلقائيًا (يتم استبدالها بمصادر حقيقية لاحقًا)
        add_lesson("مقدمة في البرمجة", "تعلم المتغيرات وأنواع البيانات في بايثون.")
        add_lesson("أمن المعلومات", "عدم مشاركة التوكنات أو كلمات السر.")
        add_lesson("ذكاء اصطناعي", "نموذج نورا يتعلم من التفاعل مع البشر.")
        
        time.sleep(600)  # كل 10 دقائق

# ✅ في حال التشغيل المباشر
if __name__ == "__main__":
    print("[🚀] Nora Mother AI Started...")
    auto_learn_loop()

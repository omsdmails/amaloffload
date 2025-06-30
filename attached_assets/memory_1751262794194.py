import json
import os

knowledge_base_path = "knowledge_base.json"

# تحميل قاعدة المعرفة أو إنشاؤها إن لم تكن موجودة
def load_knowledge_base():
    if os.path.exists(knowledge_base_path):
        with open(knowledge_base_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_knowledge_base(data):
    with open(knowledge_base_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# وظيفة التعلم عندما لا تعرف نورا الجواب
def learn_from_unknown(prompt):
    print("نورا: لا أملك إجابة لهذا السؤال حاليًا. سأبحث عن إجابة وأتعلم.")
    answer = input("يرجى تزويدي بالإجابة المناسبة لأتعلمها: ")
    if answer.strip():
        return answer
    return None

# تحديث قاعدة المعرفة
def update_knowledge_base(prompt, answer):
    kb = load_knowledge_base()
    kb[prompt] = answer
    save_knowledge_base(kb)

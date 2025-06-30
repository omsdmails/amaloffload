# knowledge_search.py

import json
import os

class KnowledgeSearch:
    def __init__(self, knowledge_base_path="knowledge_base.json"):
        self.knowledge_base_path = knowledge_base_path
        if not os.path.exists(knowledge_base_path):
            with open(knowledge_base_path, "w", encoding="utf-8") as f:
                json.dump({}, f, ensure_ascii=False, indent=2)

    def search(self, query):
        with open(self.knowledge_base_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get(query, None)

    def respond(self, query):
        result = self.search(query)
        if result:
            return f"وجدت الإجابة: {result}"
        else:
            return "لم أجد الإجابة في قاعدة المعرفة الخاصة بي. سأبحث على الإنترنت أو أتعلم لاحقاً."

    def update_knowledge(self, question, answer):
        with open(self.knowledge_base_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        data[question] = answer
        with open(self.knowledge_base_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return "تم تحديث قاعدة المعرفة بنجاح."

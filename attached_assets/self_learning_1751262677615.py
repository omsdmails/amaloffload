import json
import os

class SelfLearningAI:
    def __init__(self, knowledge_file='knowledge.json'):
        self.knowledge_file = knowledge_file
        self.knowledge = self.load_knowledge()

    def load_knowledge(self):
        if os.path.exists(self.knowledge_file):
            with open(self.knowledge_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            return {}

    def save_knowledge(self):
        with open(self.knowledge_file, 'w', encoding='utf-8') as f:
            json.dump(self.knowledge, f, ensure_ascii=False, indent=4)

    def get_answer(self, question):
        question_clean = question.strip().lower()
        # محاولة إيجاد الإجابة داخل المعرفة
        if question_clean in self.knowledge:
            return self.knowledge[question_clean]
        else:
            # إذا لم توجد الإجابة، بحث خارجي (مثلاً استدعاء API خارجي)
            answer = self.search_external(question_clean)
            if answer:
                self.knowledge[question_clean] = answer
                self.save_knowledge()
                return answer
            else:
                return "عذرًا، لا أستطيع الإجابة على هذا السؤال الآن."

    def search_external(self, query):
        # هنا يمكنك إضافة كود للبحث عبر الإنترنت، مثلاً باستخدام API خارجي
        # حاليا مجرد مثال إرجاعي
        print(f"Searching externally for: {query}")
        # يمكنك ربط هذه الدالة مع واجهة بحث حقيقية
        return None

# self_learning.py

class SelfLearningModule:
    def __init__(self):
        self.knowledge_base = {}

    def learn_new_info(self, topic, info):
        if topic not in self.knowledge_base:
            self.knowledge_base[topic] = []
        self.knowledge_base[topic].append(info)
        return f"تمت إضافة معلومة جديدة عن '{topic}'."

    def get_info(self, topic):
        return self.knowledge_base.get(topic, "لا توجد معلومات عن هذا الموضوع بعد.")

    def search_knowledge(self, query):
        results = []
        for topic, infos in self.knowledge_base.items():
            if query.lower() in topic.lower():
                results.append((topic, infos))
        return results if results else "لم يتم العثور على نتائج في قاعدة المعرفة."

    def can_answer(self, question):
        for topic in self.knowledge_base:
            if topic in question:
                return self.get_info(topic)
        return "لا أمتلك معلومات كافية عن هذا حالياً، سأبحث لأتعلم المزيد."


# self_improvement.py

class SelfImprovement:
    def __init__(self):
        self.progress_log = []

    def learn_from_mistake(self, context, correct_response):
        self.progress_log.append({
            "context": context,
            "learned_response": correct_response
        })

    def get_learnings(self):
        return self.progress_log

    def try_to_improve(self):
        if not self.progress_log:
            return "لا توجد أخطاء للتعلم منها حالياً."
        return f"تعلمت من {len(self.progress_log)} مواقف سابقة."

    def simulate_learning(self, question):
        return f"سأقوم الآن بمحاولة التعلم للإجابة عن: '{question}'"

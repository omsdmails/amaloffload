# هذا الملف يمثل بداية محرك نورا الذكي
# لاحقًا سيتوسع ليقرأ من قاعدة بيانات تعلم، أو ملفات خارجية

def interpret_message(message):
    # قاعدة ذكية مرنة – تقرأ السياق وتبني الرد بشكل طبيعي
    if not message:
        return "أحتاج أن ترسل لي شيئًا لأبدأ."

    if message.endswith('?'):
        return f"سؤال رائع! دعني أفكر في: {message}"

    if any(word in message for word in ['مرحبا', 'السلام', 'أهلاً']):
        return "أهلاً بك! كيف يمكنني مساعدتك اليوم؟"

    if "شكرا" in message or "ممتاز" in message:
        return "يسعدني ذلك! أنا هنا دائمًا."

    # مبدئيًا، نرجع echo بلمسة ذكاء
    return f"تلقيت: {message}، وسأتعلم منه للمرة القادمة."

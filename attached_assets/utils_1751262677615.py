import re

def clean_text(text):
    # إزالة أي رموز غير مرغوبة وتنظيف النص
    text = re.sub(r'\s+', ' ', text)  # استبدال المساحات المتكررة بمساحة واحدة
    text = text.strip()
    return text

def detect_language(text):
    # كشف لغة النص بشكل مبسط بناءً على حروف معينة
    arabic_chars = re.compile('[\u0600-\u06FF]')
    if arabic_chars.search(text):
        return "ar"
    # إضافة اكتشاف لغات أخرى حسب الحاجة
    return "en"

# media_analyzer.py

import os
import tempfile
import requests
from PIL import Image
from io import BytesIO
import PyPDF2
import speech_recognition as sr

try:
    import moviepy.editor as mp
    MOVIEPY_AVAILABLE = True
except ImportError:
    print("تحذير: مكتبة moviepy غير متوفرة")
    MOVIEPY_AVAILABLE = False


def fix_url(url: str) -> str:
    """تصحيح الرابط إذا لم يبدأ بـ http أو https"""
    if not url.startswith(("http://", "https://")):
        return "https://" + url.lstrip("//")
    return url


def detect_media_type(url: str) -> str:
    """تحديد نوع الوسائط من الامتداد"""
    url = url.lower()
    if url.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
        return 'image'
    elif url.endswith(('.mp4', '.mov', '.avi', '.webm')):
        return 'video'
    elif url.endswith(('.mp3', '.wav', '.ogg', '.m4a')):
        return 'audio'
    elif url.endswith('.pdf'):
        return 'pdf'
    return 'link'


def analyze_image_from_url(image_url: str) -> str:
    """تحليل صورة من رابط"""
    response = requests.get(image_url)
    response.raise_for_status()
    image = Image.open(BytesIO(response.content))
    return f"تحليل الصورة: الحجم {image.size}، الصيغة {image.format}"


def analyze_pdf_from_url(pdf_url: str) -> str:
    """تحليل PDF من رابط"""
    response = requests.get(pdf_url)
    response.raise_for_status()
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(response.content)
        temp_path = temp_file.name
    try:
        with open(temp_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            text = "".join([page.extract_text() or "" for page in reader.pages])
        return f"تم استخراج النص التالي من PDF:\n{text[:500]}..."
    finally:
        os.remove(temp_path)


def extract_text_from_audio_file(audio_path: str) -> str:
    """تحويل صوت إلى نص باستخدام Google Speech Recognition"""
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_path) as source:
        audio = recognizer.record(source)
        try:
            return recognizer.recognize_google(audio, language="ar-SA")
        except sr.UnknownValueError:
            return "لم أتمكن من التعرف على الصوت"
        except sr.RequestError:
            return "خطأ في الاتصال بخدمة التعرف على الصوت"


def analyze_audio_from_url(audio_url: str) -> str:
    """تحليل ملف صوت من رابط"""
    response = requests.get(audio_url)
    response.raise_for_status()
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
        temp_audio.write(response.content)
        temp_path = temp_audio.name
    try:
        text = extract_text_from_audio_file(temp_path)
        return f"نص الصوت:\n{text}"
    finally:
        os.remove(temp_path)


def analyze_video_from_url(video_url: str) -> str:
    """تحليل فيديو من رابط وتحويل الصوت إلى نص"""
    if not MOVIEPY_AVAILABLE:
        return "مكتبة moviepy غير متوفرة لتحليل الفيديو"

    response = requests.get(video_url)
    response.raise_for_status()
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        temp_video.write(response.content)
        video_path = temp_video.name

    audio_path = video_path.replace(".mp4", ".wav")
    try:
        video = mp.VideoFileClip(video_path)
        video.audio.write_audiofile(audio_path, verbose=False, logger=None)
        text = extract_text_from_audio_file(audio_path)
        return f"نص الفيديو:\n{text}"
    finally:
        os.remove(video_path)
        if os.path.exists(audio_path):
            os.remove(audio_path)

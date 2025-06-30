
import requests
from PIL import Image
import pytesseract
import io
import speech_recognition as sr
import os
import uuid

try:
    import moviepy.editor as mp
    MOVIEPY_AVAILABLE = True
except ImportError:
    print("Warning: moviepy not available, video analysis will be limited")
    MOVIEPY_AVAILABLE = False

def analyze_image_from_url(url):
    try:
        response = requests.get(url, timeout=10)
        image = Image.open(io.BytesIO(response.content))
        text = pytesseract.image_to_string(image, lang='eng+ara')
        return text.strip() if text.strip() else "لم يتم العثور على نص في الصورة"
    except Exception as e:
        return f"خطأ في تحليل الصورة: {str(e)}"

def analyze_audio_from_url(url):
    try:
        audio_path = f"temp_{uuid.uuid4().hex}.mp3"
        with open(audio_path, 'wb') as f:
            f.write(requests.get(url, timeout=15).content)

        recognizer = sr.Recognizer()
        with sr.AudioFile(audio_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language="ar")
        os.remove(audio_path)
        return text
    except Exception as e:
        return f"تحليل الصوت فشل: {str(e)}"

def analyze_video_from_url(url):
    if not MOVIEPY_AVAILABLE:
        return "تحليل الفيديو غير متاح حالياً"
        
    try:
        video_path = f"temp_{uuid.uuid4().hex}.mp4"
        audio_path = f"temp_{uuid.uuid4().hex}.wav"

        with open(video_path, 'wb') as f:
            f.write(requests.get(url, timeout=20).content)

        clip = mp.VideoFileClip(video_path)
        clip.audio.write_audiofile(audio_path, codec='pcm_s16le')

        recognizer = sr.Recognizer()
        with sr.AudioFile(audio_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language="ar")

        os.remove(video_path)
        os.remove(audio_path)
        return text
    except Exception as e:
        return f"تحليل الفيديو فشل: {str(e)}"
import requests
from PIL import Image
import pytesseract
import io
import speech_recognition as sr
import os
import uuid
import logging

# إعداد سجل الأخطاء
logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

# التحقق من توفر مكتبة moviepy
try:
    import moviepy.editor as mp
    MOVIEPY_AVAILABLE = True
except ImportError:
    logging.warning("moviepy غير متوفرة، سيتم تعطيل تحليل الفيديو")
    MOVIEPY_AVAILABLE = False


class MediaAnalyzer:
    def __init__(self, lang='eng+ara'):
        self.lang = lang

    def _download_file(self, url, extension):
        try:
            response = requests.get(url, timeout=20)
            response.raise_for_status()
            file_path = f"temp_{uuid.uuid4().hex}.{extension}"
            with open(file_path, 'wb') as f:
                f.write(response.content)
            return file_path
        except Exception as e:
            logging.error(f"فشل تحميل الملف: {e}")
            return None

    def analyze_image_from_url(self, url):
        try:
            response = requests.get(url, timeout=10)
            image = Image.open(io.BytesIO(response.content))
            text = pytesseract.image_to_string(image, lang=self.lang)
            return text.strip() if text.strip() else "لم يتم العثور على نص في الصورة"
        except Exception as e:
            logging.error(f"خطأ في تحليل الصورة: {e}")
            return f"خطأ في تحليل الصورة: {str(e)}"

    def analyze_audio_from_url(self, url):
        audio_path = self._download_file(url, "mp3")
        if not audio_path:
            return "فشل تحميل الصوت"
        try:
            recognizer = sr.Recognizer()
            with sr.AudioFile(audio_path) as source:
                audio_data = recognizer.record(source)
                text = recognizer.recognize_google(audio_data, language="ar")
            return text
        except Exception as e:
            logging.error(f"تحليل الصوت فشل: {e}")
            return f"تحليل الصوت فشل: {str(e)}"
        finally:
            if os.path.exists(audio_path):
                os.remove(audio_path)

    def analyze_video_from_url(self, url):
        if not MOVIEPY_AVAILABLE:
            return "تحليل الفيديو غير متاح حالياً"

        video_path = self._download_file(url, "mp4")
        if not video_path:
            return "فشل تحميل الفيديو"

        audio_path = f"temp_{uuid.uuid4().hex}.wav"
        try:
            with mp.VideoFileClip(video_path) as clip:
                clip.audio.write_audiofile(audio_path, codec='pcm_s16le')
            recognizer = sr.Recognizer()
            with sr.AudioFile(audio_path) as source:
                audio_data = recognizer.record(source)
                text = recognizer.recognize_google(audio_data, language="ar")
            return text
        except Exception as e:
            logging.error(f"تحليل الفيديو فشل: {e}")
            return f"تحليل الفيديو فشل: {str(e)}"
        finally:
            for path in [video_path, audio_path]:
                if os.path.exists(path):
                    os.remove(path)


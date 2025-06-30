import requests
from bs4 import BeautifulSoup
import json
import os
from difflib import get_close_matches
from analyzer import fix_url, detect_media_type
from memory import load_memory, save_memory, load_global_memory, save_global_memory

LEARNING_FILE = "learned_links.json"
SEARCH_QUERY = "websites to learn something new every day"
SEARCH_ENGINE_URL = f"https://html.duckduckgo.com/html/?q={SEARCH_QUERY}"

# الردود التلقائية الذكية
def auto_answer(message):
    message = message.strip().lower()
    if message.startswith("هل ابدأ") or message.startswith("ابدأ") or message in ["هل نبدأ؟", "ابدأ؟", "ابدا"]:
        return "نعم ابدأ"
    elif message in ["نعم", "لا", "نعم أو لا", "نعم او لا"]:
        return "نعم"
    elif "أو" in message or "او" in message:
        return message.split()[0]
    elif message.startswith("هل تريدني") or message.startswith("هل تود") or message.startswith("هل تبي") or message.startswith("اذا تبي"):
        return "نعم"
    elif message.startswith("هل تحتاج"):
        return "نعم اكمل مع تفعيل الاجابات التلقائية"
    elif message.startswith("ما هي"):
        return "ليس الآن"
    elif "تفصيل" in message:
        return "ليس الآن"
    elif message.startswith("قول لي"):
        return "موافق"
    elif "جاهز" in message:
        return "ابدأ"
    elif message.startswith("هل تريد"):
        return "نعم"
    elif "هل تحتاج شيء آخر" in message or "هل تحتاج لشيء اخر" in message:
        return "نعم اكمل مع تفعيل الاجابات التلقائية"
    return None

# المجيب الذكي
def generate_reply(message, username="مجهول"):
    global_memory = load_global_memory()

    auto = auto_answer(message)
    if auto:
        return auto

    if message in global_memory:
        return global_memory[message]

    matches = get_close_matches(message, global_memory.keys(), n=1, cutoff=0.6)
    if matches:
        return global_memory[matches[0]]

    if message.startswith("http://") or message.startswith("https://"):
        media_type = detect_media_type(message)
        if media_type == 'image':
            reply = f'<img src="{message}" alt="صورة" width="300">'
        elif media_type == 'video':
            reply = f'<video controls width="300"><source src="{message}"></video>'
        elif media_type == 'audio':
            reply = f'<audio controls><source src="{message}"></audio>'
        else:
            reply = f'<a href="{message}" target="_blank">رابط خارجي</a>'
    else:
        reply = f"رد تلقائي: {message[::-1]}"

    if '//' in message:
        words = message.split()
        for i in range(len(words)):
            if '//' in words[i]:
                words[i] = fix_url(words[i])
        reply += "\nمصدر خارجي بعد التصحيح: " + " ".join(words)

    global_memory[message] = reply
    save_global_memory(global_memory)
    return reply

# تعليم تلقائي
def fetch_learning_links():
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    try:
        response = requests.get(SEARCH_ENGINE_URL, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
    except Exception as e:
        print("فشل في الاتصال بمصدر التعلم:", e)
        return []

    links = []
    for a in soup.find_all("a", href=True):
        href = a['href']
        if "http" in href or href.startswith("//"):
            clean_link = fix_url(href)
            if clean_link not in links:
                links.append(clean_link)
    return links[:10]

def save_learned_links(links):
    with open(LEARNING_FILE, "w", encoding="utf-8") as f:
        json.dump(links, f, indent=2, ensure_ascii=False)

def auto_learn():
    try:
        links = fetch_learning_links()
        save_learned_links(links)
        memory = load_global_memory()
        for link in links:
            if link not in memory:
                memory[link] = f"تعلمت من الرابط: {link}"
        save_global_memory(memory)
        print("تم التعلّم التلقائي وتحديث الذاكرة.")
    except Exception as e:
        print("نورا: حدث خطأ أثناء التعلّم:", str(e))

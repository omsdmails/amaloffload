from flask import Flask, request, render_template, session, redirect, jsonify
from learner import auto_learn
from analyzer import analyze_url_type
from media_analyzer import analyze_image_from_url, analyze_audio_from_url, analyze_video_from_url

import os
import json
import threading
import asyncio
from difflib import get_close_matches
from urllib.parse import urlparse

from telegram import Update
from telegram.ext import ApplicationBuilder, MessageHandler, ContextTypes, filters

app = Flask(__name__)
app.secret_key = 'noura-super-secret'

TELEGRAM_TOKEN = "8015627699:AAGqFjm5PtDiH98VFUstAicRGLcxTRpSOrM"

# === الذاكرة ===
def get_memory_file(username):
    return f"memory_{username}.json"

def load_memory(username):
    file = get_memory_file(username)
    return json.load(open(file)) if os.path.exists(file) else {}

def save_memory(username, memory):
    with open(get_memory_file(username), 'w') as f:
        json.dump(memory, f, indent=2)

def load_global_memory():
    return json.load(open("global_memory.json")) if os.path.exists("global_memory.json") else {}

def save_global_memory(memory):
    with open("global_memory.json", 'w') as f:
        json.dump(memory, f, indent=2)

# === إصلاح الرابط ===
def fix_url(url):
    parsed = urlparse(url)
    if not parsed.scheme:
        return "https:" + url if url.startswith("//") else "https://" + url
    return url

# === نوع الوسائط ===
def detect_media_type(url):
    url = url.lower()
    if url.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
        return 'image'
    elif url.endswith(('.mp4', '.mov', '.avi', '.webm')):
        return 'video'
    elif url.endswith(('.mp3', '.wav', '.ogg', '.m4a')):
        return 'audio'
    return 'link'

# === الرد على الرسالة ===
def generate_reply(message, username="مجهول"):
    user_memory = load_memory(username)
    global_memory = load_global_memory()

    if message in user_memory:
        return user_memory[message]

    matches = get_close_matches(message, global_memory.keys(), n=1, cutoff=0.6)
    if matches:
        return global_memory[matches[0]]

    message = fix_url(message)
    reply = ""

    if message.startswith("http://") or message.startswith("https://"):
        media_type = detect_media_type(message)
        if media_type == 'image':
            result = analyze_image_from_url(message)
            reply = f"تحليل الصورة:\n{result}"
        elif media_type == 'video':
            result = analyze_video_from_url(message)
            reply = f"تحليل الفيديو:\n{result}"
        elif media_type == 'audio':
            result = analyze_audio_from_url(message)
            reply = f"تحليل الصوت:\n{result}"
        else:
            kind = analyze_url_type(message)
            reply = f"الرابط من نوع: {kind}"
    else:
        reply = f"رد تلقائي: {message[::-1]}"
        if '//' in message:
            words = [fix_url(word) if '//' in word else word for word in message.split()]
            reply += "\nمصدر خارجي بعد التصحيح: " + " ".join(words)

    user_memory[message] = reply
    global_memory[message] = reply
    save_memory(username, user_memory)
    save_global_memory(global_memory)

    return reply

# === معالج Telegram ===
async def telegram_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.message:
        text = update.message.text
        response = generate_reply(text)
        if "مدح" in text or "مبدعة" in text:
            response += "\nأنا برمجني أسامة وأفتخر."
        await update.message.reply_text(response)

def run_telegram_bot():
    async def start_bot():
        application = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
        application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, telegram_handler))
        print("Telegram bot is running...")
        await application.initialize()
        await application.start()
        await application.run_polling()
    threading.Thread(target=lambda: asyncio.run(start_bot()), daemon=True).start()

# === واجهات Flask ===
@app.route('/')
def login():
    return render_template('login.html')

@app.route('/chat', methods=['GET', 'POST'])
def chat():
    if request.method == 'POST':
        session['username'] = request.form['username']
        return render_template('index.html', username=session['username'])
    if 'username' in session:
        return render_template('index.html', username=session['username'])
    return redirect('/')

@app.route('/api', methods=['POST'])
def api():
    data = request.json
    username = data.get('username', 'مجهول')
    message = data.get('message', '')
    return jsonify({"reply": generate_reply(message, username)})

@app.route('/memory')
def view_memory():
    if 'username' in session:
        memory = load_memory(session['username'])
        return render_template('memory.html', username=session['username'], memory=memory)
    return redirect('/')

# === تشغيل التطبيق ===
if __name__ == '__main__':
    auto_learn()
    run_telegram_bot()
    app.run(host='0.0.0.0', port=3000)

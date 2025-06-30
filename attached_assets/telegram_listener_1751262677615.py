# telegram_listener.py

import os
import logging
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import (
    ApplicationBuilder,
    MessageHandler,
    ContextTypes,
    filters,
)
from responses import auto_reply

# تحميل المتغيرات من ملف .env
load_dotenv()
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")

# إعداد اللوق لتسهيل التتبع والتحليل
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# الدالة الأساسية لمعالجة الرسائل
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        user_message = update.message.text
        user_id = update.effective_user.id
        logging.info(f"📩 رسالة من {user_id}: {user_message}")

        # الرد الأساسي
        reply = auto_reply(user_message)

        # إضافة عرض خاص عند كلمات معينة
        if "مكمل" in user_message or "iHerb" in user_message:
            reply += "\n\n💚 لا تفوّت عرض iHerb الخرافي! استخدم كود الخصم:\n\n`ZPJ555`\n\n[اضغط هنا للعرض](https://www.iherb.com?rcode=ZPJ555)"

        await update.message.reply_text(reply, parse_mode="Markdown")

    except Exception as e:
        logging.error(f"❌ خطأ أثناء معالجة الرسالة: {e}")
        await update.message.reply_text("حدث خطأ تقني، حاول مرة ثانية.")

# دالة تشغيل البوت
def start_bot():
    if not TELEGRAM_TOKEN:
        logging.critical("❌ لم يتم العثور على TELEGRAM_TOKEN في ملف .env!")
        return

    app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()

    message_handler = MessageHandler(filters.TEXT & (~filters.COMMAND), handle_message)
    app.add_handler(message_handler)

    logging.info("✅ البوت اشتغل وينتظر الرسائل...")
    app.run_polling()

# نقطة تشغيل السكربت
if __name__ == "__main__":
    start_bot()

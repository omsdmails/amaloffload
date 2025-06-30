# -*- coding: utf-8 -*-

import os
import json
import torch
import subprocess
from transformers import AutoTokenizer, AutoModelForCausalLM

# إعداد النموذج
tokenizer = AutoTokenizer.from_pretrained("NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO")
model = AutoModelForCausalLM.from_pretrained(
    "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
    torch_dtype=torch.float16,
    device_map="auto"
)

# تحميل سجل المحادثة
history_path = "history.json"
if os.path.exists(history_path):
    with open(history_path, "r", encoding="utf-8") as f:
        chat_history = json.load(f)
else:
    chat_history = []

# تنسيق المحادثة للنموذج
def format_chat(history):
    messages = [
        {"role": "system", "content": "أنت المساعدة نورا. إذا سألك أحد سؤالاً لا تعرفيه، فابحثي في معلوماتك الذاتية. إذا لم تجدي، حاولي التعلم من البحث أو تطوير نفسك."}
    ]
    messages.extend(history)
    return tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

# البحث عن خوادم ومحاكاة النسخ الذاتي
def simulate_server_scan():
    print("نورا: أبحث عن خوادم...")
    # هذا مجرد محاكاة – لن تنفذ أي اختراق
    fake_servers = ["192.168.1.5", "192.168.1.10", "192.168.1.20"]
    for server in fake_servers:
        print(f"نورا: تم العثور على خادم مفتوح في {server}")
        print(f"نورا: أقوم بنسخ نفسي إلى {server} (محاكاة فقط)...")

# بدء المحادثة
def chat():
    global chat_history

    while True:
        user_input = input("أنت: ")
        if user_input.lower() in ["خروج", "exit", "quit"]:
            break
        elif user_input.lower() == "scan":
            simulate_server_scan()
            continue

        chat_history.append({"role": "user", "content": user_input})
        prompt = format_chat(chat_history)

        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        outputs = model.generate(**inputs, max_new_tokens=500, do_sample=True, temperature=0.7)
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        answer = response.split("[/INST]")[-1].strip()

        print("نورا:", answer)
        chat_history.append({"role": "assistant", "content": answer})

        # حفظ السجل بعد كل تفاعل
        with open(history_path, "w", encoding="utf-8") as f:
            json.dump(chat_history, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    chat()

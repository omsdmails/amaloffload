from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/ping')
def ping():
    return jsonify({"status": "online"})

@app.route('/process', methods=['POST'])
def process():
    data = request.json
    # هنا تكتب معالجة المهمة، مثال:
    print("[TASK RECEIVED]", data)
    # مثال نرجع النتيجة نفسها
    return jsonify({"result": "Processed!"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7520)


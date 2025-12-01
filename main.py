from flask import Flask, request
import requests, random, json, time
from bs4 import BeautifulSoup

TOKEN = "8285732668:AAGXaDR3m1HA5GSDq1LEs5Cn4CSKcxnZDO0"
API = f"https://api.telegram.org/bot{TOKEN}"
GROUP_ID = -1003473546168

app = Flask(__name__)

used_name = []
g_name = b_name = 0
last_sent = 0
letters = "abcdefghijklmnopqrstuvwxyz"

# ======================== CEK FRAGMENT ========================
def fragment_check(uname):
    try:
        res = requests.get(
            "https://fragment-vercel-beta.vercel.app/username?",
            params={"username": uname},
            timeout=5
        )
        return res.status_code == 200 and res.json().get("status") == "Unavailable"
    except:
        return False

# ======================== CEK TELEGRAM WEB ========================
def get_telegram_web_user(username):
    try:
        resp = requests.get(f'https://t.me/{username}', timeout=5)
        text = BeautifulSoup(resp.content, 'html.parser').get_text(" ", strip=True)
        return not ("If you have Telegram" in text and "you can view and join" in text)
    except:
        return False

# ======================== KIRIM KE GRUP + BUTTON ========================
def send_good_to_group(username):
    global last_sent
    now = time.time()
    if now - last_sent < 1:
        time.sleep(1 - (now - last_sent))

    pesan = f"\n\n\nusername anda berhasil dibuat oleh bot zime\n✅ GOOD: ||`{username}`||"
    keyboard = {"inline_keyboard": [[
        {"text": "👤 Owner", "url": "https://t.me/yaeetim"},
        {"text": "📢 Channel", "url": "https://t.me/usnlogin"},
    ]]}
    try:
        requests.get(
            f"{API}/sendMessage",
            params={
                "chat_id": GROUP_ID,
                "text": pesan,
                "parse_mode": "MarkdownV2",
                "reply_markup": json.dumps(keyboard)
            },
            timeout=5
        )
    except:
        pass
    last_sent = time.time()

# ======================== GENERATE USERNAME ========================
def generate_username():
    while True:
        username = "".join(random.choice(letters) for _ in range(5))
        if username in used_name:
            continue
        used_name.append(username)
        if fragment_check(username) and get_telegram_web_user(username):
            send_good_to_group(username)
            return username

# ======================== WEBHOOK HANDLER ========================
@app.route(f"/{TOKEN}", methods=["POST"])
def webhook():
    data = request.json
    chat_id = data["message"]["chat"]["id"]
    text = data["message"].get("text", "")

    if text == "/start":
        requests.get(f"{API}/sendMessage", params={
            "chat_id": chat_id,
            "text": "Bot aktif! Sedang generate username..."
        })
        uname = generate_username()
        requests.get(f"{API}/sendMessage", params={
            "chat_id": chat_id,
            "text": f"Username generated: {uname}"
        })
    return {"ok": True}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

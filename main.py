import requests, os, random, time, json
from bs4 import BeautifulSoup

# ======================== CONFIG ========================
TOKEN = os.environ['TOKEN']         # Token bot dari Environment Variable
GROUP_ID = int(os.environ['GROUP_ID'])  # ID grup dari Environment Variable
API = f"https://api.telegram.org/bot{TOKEN}"

used_name = []
g_name = b_name = 0
last_sent = 0  # kontrol delay 1 detik

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

# ======================== STATUS TERMINAL ========================
def status(uname):
    os.system("clear" if os.name != "nt" else "cls")
    print(f"Good Name : {g_name}")
    print(f"Bad Name  : {b_name}")
    print(f"Username  : {uname}")
    print("By @yaeetim")

# ======================== GENERATE USERNAME ========================
def generate_usernames():
    global g_name, b_name
    letters = "abcdefghijklmnopqrstuvwxyz"  # alfabet only

    while True:
        username = "".join(random.choice(letters) for _ in range(5))
        status(username)

        if username in used_name:
            continue
        used_name.append(username)

        if fragment_check(username):
            if get_telegram_web_user(username):
                g_name += 1
                send_good_to_group(username)
            else:
                b_name += 1
        else:
            b_name += 1

# ======================== RUN ========================
generate_usernames()

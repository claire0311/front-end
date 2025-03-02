from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify, send_from_directory
from flask_pymongo import PyMongo
from werkzeug.utils import secure_filename
from flask_cors import CORS
import bcrypt
import random
import string
import re
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'
CORS(app)

# ✅ 確保 MongoDB 連線正確
app.config["MONGO_URI"] = "mongodb+srv://zhuanti851:95Y6B8dYPxDmLpk1@cluster0.ihv8b.mongodb.net/graduation_project?retryWrites=true&w=majority"

mongo = PyMongo(app)
db = mongo.db  # 確保資料庫連接

# ✅ 確保 collections 可用
users_collection = db.users
characters_collection = db.characters

# ✅ 設定上傳圖片相關
UPLOAD_FOLDER = "static/uploads"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
# 確保上傳資料夾存在
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# 檢查檔案副檔名是否合法
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# 設定 Collections
users_collection = mongo.db.users
characters_collection = mongo.db.characters

# 預設角色數據，加入 hobby_desc1 和 hobby_desc2
default_characters = [
    {
        "name": "秩序守護者",
        "home_image": "reformer_home.png",  # 主頁面用圖
        "info_image": "reformer_info.jpg",  # 角色資訊頁面用圖
        "nickname": "正義之聲",
        "age": 40,
        "job": "倫理專家",
        "personality": "嚴謹、有原則",
        "personality_desc1": "我認為世界應該更有秩序，所有事情都該有標準。",
        "personality_desc2": "我喜歡討論道德和正義，尋找更好的解決方案。",
        "hobbies": "法律, 哲學, 社會改革",
        "hobby_desc1": "我喜歡閱讀法律書籍，分析其中的案例。",
        "hobby_desc2": "我經常參加公益法律講座，希望能影響社會。"
    },
    {
        "name": "心靈守護者",
        "home_image": "helper_home.png",
        "info_image": "helper_info.jpg",
        "nickname": "暖心夥伴",
        "age": 35,
        "job": "心理輔導師",
        "personality": "樂於助人，情感豐富",
        "personality_desc1": "我總是關心別人，希望幫助每個需要幫助的人。",
        "personality_desc2": "人際關係對我來說很重要，我喜歡與人交流。",
        "hobbies": "心理學, 志工活動, 人際關係",
        "hobby_desc1": "我喜歡閱讀心理學書籍，研究不同的心理治療方法。",
        "hobby_desc2": "我經常參與志工活動，幫助有需要的人。"
    },
    {
        "name": "夢想驅動者",
        "home_image": "achiever_home.png",
        "info_image": "achiever_info.jpg",
        "nickname": "奮鬥達人",
        "age": 30,
        "job": "企業家",
        "personality": "目標導向，行動力強",
        "personality_desc1": "我覺得人生就是要不斷挑戰與成長。",
        "personality_desc2": "我熱愛成功，喜歡設定並達成目標。",
        "hobbies": "創業, 投資, 成功學",
        "hobby_desc1": "我喜歡閱讀商業書籍，學習最新的投資策略。",
        "hobby_desc2": "我經常參加創業論壇，與成功人士交流經驗。"
    },
    {
        "name": "靈魂詩人",
        "home_image": "individualist_home.png",
        "info_image": "individualist_info.jpg",
        "nickname": "藝術追尋者",
        "age": 28,
        "job": "作家",
        "personality": "感性，創意豐富",
        "personality_desc1": "我喜歡探索內心世界，發掘靈魂的深度。",
        "personality_desc2": "藝術和音樂是我表達情感的方式。",
        "hobbies": "文學, 音樂, 藝術",
        "hobby_desc1": "我喜歡寫詩，將我的情感融入文字之中。",
        "hobby_desc2": "我經常到畫廊參觀，尋找靈感創作藝術作品。"
    },
    {
        "name": "智慧探索者",
        "home_image": "observer_home.png",
        "info_image": "observer_info.jpg",
        "nickname": "知識探索者",
        "age": 45,
        "job": "科學家",
        "personality": "理性分析，冷靜好奇",
        "personality_desc1": "我喜歡深入學習並分析各種事物。",
        "personality_desc2": "數據與知識能帶來最準確的答案。",
        "hobbies": "科技, 科學研究, 哲學",
        "hobby_desc1": "我喜歡研究最新的人工智慧技術。",
        "hobby_desc2": "我經常參與科學研討會，發表我的研究成果。"
    },
    {
        "name": "忠誠守護者",
        "home_image": "loyalist_home.png",
        "info_image": "loyalist_info.jpg",
        "nickname": "安全顧問",
        "age": 38,
        "job": "安全專家",
        "personality": "謹慎可靠，有責任感",
        "personality_desc1": "我總是在尋找最穩妥的解決方案。",
        "personality_desc2": "信任與安全感對我來說非常重要。",
        "hobbies": "國際局勢, 法律, 風險管理",
        "hobby_desc1": "我喜歡研究國際情勢，分析各國的政治動向。",
        "hobby_desc2": "我經常與專家討論如何提升企業安全策略。"
    },
    {
        "name": "冒險王",
        "home_image": "enthusiast_home.png",
        "info_image": "enthusiast_info.jpg",
        "nickname": "活力四射",
        "age": 27,
        "job": "旅行家",
        "personality": "樂觀外向，熱愛新事物",
        "personality_desc1": "生活就是一場冒險，我想體驗世界的一切。",
        "personality_desc2": "快樂和自由是我最重視的價值。",
        "hobbies": "旅行, 美食, 極限運動",
        "hobby_desc1": "我喜歡嘗試各國特色料理，發掘美食文化。",
        "hobby_desc2": "我經常參加極限運動挑戰，如高空跳傘與衝浪。"
    },
    {
        "name": "果斷統帥",
        "home_image": "challenger_home.png",
        "info_image": "challenger_info.jpg",
        "nickname": "領袖之道",
        "age": 42,
        "job": "企業領袖",
        "personality": "果敢堅定，保護弱者",
        "personality_desc1": "我相信強者應該帶領大家走向成功。",
        "personality_desc2": "不管遇到什麼困難，我都會勇往直前。",
        "hobbies": "商業, 政治, 健身",
        "hobby_desc1": "我喜歡參與企業決策會議，挑戰市場變化。",
        "hobby_desc2": "我每天都會健身，保持最佳的身體狀態。"
    },
    {
        "name": "靜心者",
        "home_image": "peacemaker_home.png",
        "info_image": "peacemaker_info.jpg",
        "nickname": "和平追尋者",
        "age": 36,
        "job": "靈修導師",
        "personality": "和平愛好者，避免衝突",
        "personality_desc1": "我希望大家都能和平相處。",
        "personality_desc2": "我喜歡透過冥想找到內心的平靜。",
        "hobbies": "瑜珈, 冥想, 靈性成長",
        "hobby_desc1": "我喜歡每天練習冥想，以達到內心的平靜。",
        "hobby_desc2": "我經常參與靈性成長的研討會，探索心靈世界。"
    }
]


for character in default_characters:
    existing_character = characters_collection.find_one({"name": character["name"]})
    if existing_character:
        characters_collection.update_one({"name": character["name"]}, {"$set": character})
    else:
        characters_collection.insert_one(character)



# ✅ 修正帳號驗證，確保包含至少 1 個英文字母 + 1 個數字
USERNAME_PATTERN = re.compile(r"^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{8,15}$")  # 至少 1 英文 + 1 數字，總長度 8-15
PASSWORD_PATTERN = re.compile(r"^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{8,15}$")  # 至少 1 英文 + 1 數字，總長度 8-15

# 🔹 設定首頁為角色頁面
@app.route('/')
def home():
    return redirect(url_for('character'))

# 🔹 登入狀態檢查
@app.route('/check_login')
def check_login():
    logged_in = "user" in session  # 修正 JSON 回應格式
    return jsonify({"logged_in": bool(logged_in), "username": session.get("user", None)})

# 🔹 登入
@app.route('/login', methods=['GET', 'POST'])
def login():
    characters = list(characters_collection.find({}, {"_id": 0}))
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        user_data = users_collection.find_one({"username": username})

        if not user_data:
            error = "❌ 此帳號未註冊，請先註冊！"
        elif not bcrypt.checkpw(password.encode('utf-8'), user_data['password'].encode()):
            error = "❌ 密碼錯誤，請再試一次！"
        else:
            session['user'] = username  # ✅ 正確存入 user
            session.modified = True  # ✅ 確保 session 有效
            return render_template("character.html", characters=characters)


    return render_template('login.html', error=error)


# 🔹 註冊
@app.route('/register', methods=['GET', 'POST'])
def register():
    message = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        confirm_password = request.form['confirm_password']

        # ✅ 確保帳號格式符合規範（必須包含至少 1 英文 + 1 數字）
        if not USERNAME_PATTERN.match(username):
            message = "❌ 帳號必須為 8-15 位的英文 + 數字，且至少包含 1 個英文與 1 個數字！"
            return render_template('register.html', message=message)

        # ✅ 確保密碼格式符合規範
        if not PASSWORD_PATTERN.match(password):
            message = "❌ 密碼必須為 8-15 位的英文 + 數字組合，且必須至少包含 1 個英文與 1 個數字！"
            return render_template('register.html', message=message)

        if password != confirm_password:
            message = "❌ 確認密碼與密碼不相符！"
            return render_template('register.html', message=message)

        existing_user = users_collection.find_one({"username": username})
        if existing_user:
            message = "❌ 帳號已存在，請使用其他帳號！"
        else:
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            users_collection.insert_one({"username": username, "password": hashed_password})
            return redirect(url_for('login'))

    return render_template('register.html', message=message)

# 🔹 忘記密碼 (使用者輸入帳號，系統生成新密碼)
@app.route('/reset-password', methods=['GET', 'POST'])
def reset_password():
    message = None
    if request.method == 'POST':
        username = request.form['username']
        user_data = users_collection.find_one({"username": username})

        if not user_data:
            message = "❌ 該帳號尚未註冊！"
        else:
            new_password = ''.join(random.choices(string.ascii_letters + string.digits, k=random.randint(8, 15)))
            hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            users_collection.update_one({"username": username}, {"$set": {"password": hashed_password}})
            message = f"✅ 密碼已成功重設，請使用新密碼登入：{new_password}"

    return render_template('reset_password.html', message=message)

# 🔹 檢查角色數據是否存在
for character in default_characters:
    if not characters_collection.find_one({"name": character["name"]}):
        characters_collection.insert_one(character)
print("✅ 角色數據檢查完成")

# 🔹 角色選擇頁面
@app.route("/character")
def character():
    characters = list(characters_collection.find({}, {"_id": 0}))
    return render_template("character.html", characters=characters)

# 🔹 角色資訊頁面
@app.route('/character-info/<character_name>')
def character_info(character_name):
    character = characters_collection.find_one({"name": character_name}, {"_id": 0})

    if not character:
        flash("找不到該角色", "error")
        return redirect(url_for("character"))

    # 確保載入對應的 info_image
    if "info_image" in character and character["info_image"]:
        character["image"] = url_for("static", filename=f"img/{character['info_image']}")
    else:
        character["image"] = url_for("static", filename="img/default.png")

    return render_template("character_info.html", character=character)


@app.route("/api/characters")
def get_characters():
    characters = list(characters_collection.find({}, {"_id": 0}))

    # ✅ 確保圖片為完整路徑
    for character in characters:
        if "image" in character and character["image"]:
            character["image"] = url_for("static", filename=f"img/fullbody/{character['image']}")
        else:
            character["image"] = url_for("static", filename="img/fullbody/default.png")

    return jsonify(characters)



#聊天室
@app.route("/chatroom/<character_name>")
def chatroom(character_name):
    if "user" not in session:
        return jsonify({"error": "你必須先登入！"}), 401  # 回應 JSON 錯誤碼 401，前端將攔截這個回應

    # 先從 `characters_collection` 尋找角色
    character = characters_collection.find_one({"name": character_name}, {"_id": 0})

    # 如果找不到角色，則從 `custom_partners_collection` 查找
    if not character:
        character = mongo.db.custom_partners.find_one({"name": character_name, "owner": session["user"]}, {"_id": 0})

    if not character:
        return "找不到該角色", 404

    # 設定完整圖片路徑
    character["image"] = url_for("static", filename=f"img/fullbody/{character['image']}") if character.get("image") else url_for("static", filename="img/fullbody/default.png")
    # 取得所有聊天室列表 (包含預設角色 & 自訂夥伴)
    chatrooms = list(characters_collection.find({"name": {"$ne": character_name}}, {"_id": 0, "name": 1, "image": 1}))
    custom_partners = list(mongo.db.custom_partners.find({"name": {"$ne": character_name}, "owner": session["user"]}, {"_id": 0, "name": 1, "image": 1}))

    chatrooms.extend(custom_partners)

    messages = [
        {"sender": "user", "text": "Hi"},
        {"sender": "character", "text": "Hi"},
        {"sender": "user", "text": "How are you?"},
        {"sender": "character", "text": "I'm fine, thank you."}
    ]

    return render_template("chatroom.html", character=character, chatrooms=chatrooms, messages=messages)


# 🔹 個人資料
@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if "user" not in session:
        return jsonify({"error": "你必須先登入！"}), 401  # 回應 JSON 錯誤碼 401，前端將攔截這個回應

    user = users_collection.find_one({"username": session['user']})

    if request.method == 'POST':
        update_data = {
            "nickname": request.form['nickname'],
            "birthday": request.form['birthday'],
            "age": request.form['age'],
            "occupation": request.form['occupation'],
            "personality": request.form['personality'],
            "hobbies": request.form['hobbies']
        }

        # 📌 上傳大頭貼
        if 'avatar' in request.files:
            avatar_file = request.files['avatar']
            if avatar_file.filename != '':
                avatar_path = os.path.join(app.config['UPLOAD_FOLDER'], avatar_file.filename)
                avatar_file.save(avatar_path)
                update_data["avatar"] = avatar_file.filename

        users_collection.update_one({"username": session['user']}, {"$set": update_data})
        flash("個人資料已更新", "success")
        return redirect(url_for('profile'))

    return render_template('profile.html', user=user)

# 確保上傳資料夾存在
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# 檢查文件類型是否合法
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/upload_avatar", methods=["POST"])
def upload_avatar():
    if "user" not in session:
        return jsonify({"error": "請先登入"}), 401

    username = session["user"]

    if "avatar" not in request.files:
        return jsonify({"error": "沒有選擇檔案"}), 400

    file = request.files["avatar"]

    if file.filename == "":
        return jsonify({"error": "沒有選擇檔案"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(f"{username}.png")  # 以使用者帳號命名
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)

        # ✅ 先讓用戶確認後再上傳
        if os.path.exists(file_path):
            return jsonify({"error": "圖片已存在，請確認是否覆蓋", "preview": url_for('static', filename=f"uploads/{filename}")})

        # ✅ 真正執行儲存
        file.save(file_path)

        # ✅ 更新 MongoDB 中的 `avatar` 欄位
        image_url = f"/static/uploads/{filename}"
        users_collection.update_one(
            {"username": username},
            {"$set": {"avatar": image_url}},
            upsert=True
        )

        return jsonify({"message": "上傳成功", "avatar": image_url})

    return jsonify({"error": "文件格式不支援"}), 400

# 🚀 讀取使用者資料 (當前登入者)
@app.route("/get_profile", methods=["GET"])
def get_profile():
    if "user" not in session:
        return jsonify({"error": "請先登入"}), 401
    
    username = session["user"]
    user_data = mongo.db.users.find_one({"username": username}, {"_id": 0})
    
    if not user_data:
        return jsonify({"nickname": "", "birthday": "", "gender": "male", "mbti": "", "personality": "", "hobbies": ""})

    return jsonify(user_data)

# 🚀 儲存個人資料
@app.route("/save_profile", methods=["POST"])
def save_profile():
    if "user" not in session:
        return jsonify({"error": "請先登入"}), 401

    username = session["user"]
    remove_avatar = request.form.get("remove_avatar") == "true"

    update_data = {
        "nickname": request.form.get("nickname"),
        "birthday": request.form.get("birthday"),
        "gender": request.form.get("gender"),
        "mbti": request.form.get("mbti"),
        "personality": request.form.get("personality"),
        "hobbies": request.form.get("hobbies"),
    }

    # 如果使用者要求移除大頭貼，則設為預設圖片
    if remove_avatar:
        update_data["avatar"] = "/static/img/character1.png"

    # 若有上傳新圖片則更新
    if "avatar" in request.files:
        file = request.files["avatar"]
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{username}.png")
            file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(file_path)
            update_data["avatar"] = f"/static/uploads/{filename}"

    users_collection.update_one({"username": username}, {"$set": update_data}, upsert=True)
    return jsonify({"message": "個人資料儲存成功"})



# 🔹 上傳檔案
@app.route("/static/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# 聊天室列表(聊天室清單)
@app.route("/chatroomlist")
def chatroomlist():
    if "user" not in session:
        return jsonify({"error": "你必須先登入！"}), 401  # 回應 JSON 錯誤碼 401，前端將攔截這個回應

    # 取得預設角色列表
    chatrooms = list(characters_collection.find({}, {"_id": 0, "name": 1, "image": 1}))

    # 取得使用者的自訂夥伴
    custom_partners = list(mongo.db.custom_partners.find({"owner": session["user"]}, {"_id": 0, "name": 1, "image": 1}))

    # 合併角色與夥伴
    chatrooms.extend(custom_partners)

    # 預設角色，顯示第一個角色（可根據需求更改）
    character = {"name": "秩序守護者"}

    return render_template("chatroomlist.html", chatrooms=chatrooms, character=character)



# 🔹 登出
@app.route('/logout')
def logout():
    session.pop('user', None)  # 移除 session
    session.modified = True  # 確保變更 session
    return redirect(url_for('character'))

# 回饋分析頁面
# 假設的回饋數據 (九型人格 AI 聊天機器人)
feedback_data = {
    "秩序守護者": {
        "total_score": 88,
        "feedback": [
            {"category": "關聯程度", "score": 92},
            {"category": "幽默程度", "score": 75},
            {"category": "態度表現", "score": 90}
        ]
    },
    "心靈守護者": {
        "total_score": 85,
        "feedback": [
            {"category": "關聯程度", "score": 90},
            {"category": "幽默程度", "score": 80},
            {"category": "態度表現", "score": 85}
        ]
    },
    "夢想驅動者": {
        "total_score": 80,
        "feedback": [
            {"category": "關聯程度", "score": 85},
            {"category": "幽默程度", "score": 78},
            {"category": "態度表現", "score": 77}
        ]
    },
    "靈魂詩人": {
        "total_score": 76,
        "feedback": [
            {"category": "關聯程度", "score": 82},
            {"category": "幽默程度", "score": 70},
            {"category": "態度表現", "score": 75}
        ]
    },
    "智慧探索者": {
        "total_score": 89,
        "feedback": [
            {"category": "關聯程度", "score": 94},
            {"category": "幽默程度", "score": 72},
            {"category": "態度表現", "score": 85}
        ]
    },
    "忠誠守護者": {
        "total_score": 83,
        "feedback": [
            {"category": "關聯程度", "score": 87},
            {"category": "幽默程度", "score": 74},
            {"category": "態度表現", "score": 82}
        ]
    },
    "冒險王": {
        "total_score": 79,
        "feedback": [
            {"category": "關聯程度", "score": 80},
            {"category": "幽默程度", "score": 88},
            {"category": "態度表現", "score": 75}
        ]
    },
    "果斷統帥": {
        "total_score": 82,
        "feedback": [
            {"category": "關聯程度", "score": 86},
            {"category": "幽默程度", "score": 73},
            {"category": "態度表現", "score": 85}
        ]
    },
    "靜心者": {
        "total_score": 84,
        "feedback": [
            {"category": "關聯程度", "score": 88},
            {"category": "幽默程度", "score": 79},
            {"category": "態度表現", "score": 86}
        ]
    }
}

@app.route('/feedback')
def feedback():
    return render_template("feedback.html", chatbots=feedback_data.keys())

@app.route('/get_feedback')
def get_feedback():
    chatbot = request.args.get("chatbot", "知識喵喵")  # 預設為第一個聊天機器人
    return jsonify(feedback_data.get(chatbot, {"total_score": 0, "feedback": []}))

# 預設的 AI 回應邏輯，根據不同人格類型產生回應
def generate_ai_response(character_name, user_message):
    ai_responses = {
        "秩序守護者": [
            "我認為每件事都應該有規則，你覺得呢？",
            "遵守規則能讓社會更有秩序。",
            "你喜歡公平正義嗎？"
        ],
        "心靈守護者": [
            "我很高興能傾聽你的感受。",
            "幫助別人讓我很快樂，你今天過得如何？",
            "你希望有人傾訴你的煩惱嗎？"
        ],
        "夢想驅動者": [
            "成功來自努力，你今天為目標努力了嗎？",
            "我喜歡與有目標的人交流。",
            "行動是成功的第一步！"
        ],
        "靈魂詩人": [
            "這讓我想起一首詩，你願意聽嗎？",
            "音樂與藝術能觸動人心。",
            "情感豐富是一種力量，而不是弱點。"
        ],
        "智慧探索者": [
            "數據與理性能幫助我們做出最佳決策。",
            "你對科學感興趣嗎？",
            "讓我們一起探討這個問題的本質。"
        ],
        "忠誠守護者": [
            "信任是最重要的，你認為呢？",
            "安全感讓我們更有歸屬感。",
            "你認為風險管理有多重要？"
        ],
        "冒險王": [
            "世界這麼大，我想去看看！",
            "你有嘗試過極限運動嗎？",
            "人生就是要不斷挑戰與探索。"
        ],
        "果斷統帥": [
            "決策果斷才能帶領團隊前進。",
            "你是否願意承擔責任？",
            "領導者必須具備勇氣與智慧。"
        ],
        "靜心者": [
            "內心的平靜比外在的喧囂更重要。",
            "冥想可以讓我們找到內在的和諧。",
            "和平共處是一種智慧。"
        ]
    }
    return random.choice(ai_responses.get(character_name, ["這是一個有趣的問題！"]))

# API：處理使用者輸入並回應 AI 內容
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    character_name = data.get("character")
    user_message = data.get("message")

    if not character_name or not user_message:
        return jsonify({"error": "請提供角色名稱與訊息"}), 400

    ai_response = generate_ai_response(character_name, user_message)

    return jsonify({"response": ai_response})

#儲存你的 AI 夥伴
@app.route("/save_custom_partner", methods=["POST"])
def save_custom_partner():
    if "user" not in session:
        return jsonify({"error": "請先登入"}), 401
    
    user = session["user"]  # 修正 user_id 錯誤
    name = request.form.get("name")
    nickname = request.form.get("nickname")
    age = request.form.get("age")
    job = request.form.get("job")
    personality = request.form.get("personality")
    personality_desc1 = request.form.get("personality_desc1")
    personality_desc2 = request.form.get("personality_desc2")
    hobbies = request.form.get("hobbies")
    hobby_desc1 = request.form.get("hobby_desc1")
    hobby_desc2 = request.form.get("hobby_desc2")
    
    # 預設圖片
    image_filename = "static/img/character1.png"

    # 處理圖片上傳
    image = request.files.get("image")
    if image and allowed_file(image.filename):
        image_filename = secure_filename(image.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
        image.save(image_path)
        image_filename = f"/static/uploads/{image_filename}"  # 設定正確的 URL
    
    # 建立或更新角色資料
    character_data = {
        "owner": user,  # 使用 `owner` 來識別該角色的擁有者
        "name": name,
        "nickname": nickname,
        "age": age,
        "job": job,
        "personality": personality,
        "personality_desc1": personality_desc1,
        "personality_desc2": personality_desc2,
        "hobbies": hobbies,
        "hobby_desc1": hobby_desc1,
        "hobby_desc2": hobby_desc2,
        "image": image_filename  # 記錄頭像的 URL
    }

    # 若角色已存在則更新，否則新增
    existing_character = characters_collection.find_one({"name": name, "owner": user})
    if existing_character:
        characters_collection.update_one({"name": name, "owner": user}, {"$set": character_data})
    else:
        characters_collection.insert_one(character_data)

    return redirect(url_for("custom_partner_page"))  # 儲存後重導向自訂夥伴頁面



# 🔹 啟動伺服器
if __name__ == '__main__':
    app.run(debug=True)

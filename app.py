from flask import Flask, render_template, request, redirect, url_for, jsonify
import firebase_admin
from firebase_admin import credentials, auth

app = Flask(__name__)

# 初始化 Firebase Admin SDK
cred = credentials.Certificate("serviceAccountKey.json")  # 替換為你的 Firebase Admin 金鑰檔案名稱
firebase_admin.initialize_app(cred)

# 模擬的本地使用者資料庫（僅用於測試）
users = {
    "admin": "password123",
    "user1": "mypassword",
}

@app.route('/')
def home():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if username in users and users[username] == password:
            return f"<h1>歡迎回來, {username}！</h1>"
        else:
            error = "帳號或密碼錯誤，請再試一次！"
    return render_template('login.html', error=error)

@app.route('/google-login', methods=['POST'])
def google_login():
    id_token = request.json.get('idToken')  # 從前端獲取 ID Token
    if not id_token:
        return jsonify({"error": "缺少 ID Token"}), 400

    try:
        # 驗證 ID Token
        decoded_token = auth.verify_id_token(id_token)
        user_email = decoded_token.get("email", "未知用戶")
        return jsonify({"message": f"歡迎回來, {user_email}！"}), 200
    except Exception as e:
        return jsonify({"error": f"驗證失敗: {str(e)}"}), 401

if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# 模擬的使用者資料庫
users = {
    "admin": "password123",  # 使用者名稱: 密碼
    "user1": "mypassword",   # 測試帳號
}

@app.route('/')
def home():
    # 將首頁重定向到登入頁
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # 驗證使用者名稱和密碼
        if username in users and users[username] == password:
            return f"<h1>歡迎回來, {username}！</h1>"  # 成功登入訊息
        else:
            error = "帳號或密碼錯誤，請再試一次！"  # 錯誤訊息
    
    return render_template('login.html', error=error)

if __name__ == '__main__':
    app.run(debug=True)

# front-end
前端組的畢業專題進度追蹤

# 2025/01/02 進度紀錄
登入頁面
<img width="959" alt="image" src="https://github.com/user-attachments/assets/30dd91f6-736d-4b3a-b9ee-b555c1a7ac4f" />

# Flask Login Page

這是一個使用 Flask 框架製作的簡單登入頁面專案，包含以下功能：

- 登入頁面 UI 設計
- 簡單的帳號密碼驗證邏輯
- 支援 Google 登入按鈕設計（樣式展示）

## 專案結構

```
project/
├── static/
│   ├── google-icon.png    # Google 按鈕圖標
│   ├── icon.png           # 頂部圖標
│   └── style.css          # CSS 樣式表
├── templates/
│   └── login.html         # 登入頁面模板
└── app.py                 # Flask 主程式
```

## 使用方法

### 環境要求
- Python 3.7+
- Flask

### 啟動專案
1. 克隆此專案到本地：
   ```bash
   git clone https://github.com/claire0311/flask-login-page.git
   cd flask-login-page
   ```
2. 安裝依賴：
   ```bash
   pip install flask
   ```
3. 啟動 Flask 應用：
   ```bash
   python app.py
   ```
4. 在瀏覽器中訪問：
   ```
   http://127.0.0.1:5000/login
   ```

[登入頁面程式碼]([目標網址](https://github.com/claire0311/front-end/blob/main/flask-login-page))

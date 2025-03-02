# front-end
前端組的畢業專題進度追蹤

# 2025/01/02 進度紀錄
登入頁面預覽如下
<img width="959" alt="image" src="https://github.com/user-attachments/assets/30dd91f6-736d-4b3a-b9ee-b555c1a7ac4f" />

註冊頁面如下


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
   git clone https://github.com/claire0311/front-end.git
cd front-end
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

[app.py程式碼](https://github.com/claire0311/front-end/blob/main/app.py)

[static資料夾](https://github.com/claire0311/front-end/tree/main/static)

[templates資料夾](https://github.com/claire0311/front-end/tree/main/templates)

# 2025/02/06進度回報
[網頁程式碼](https://github.com/claire0311/front-end/tree/main/0206)  
[0206網頁進度回報](https://www.youtube.com/watch?v=taKSpWH6ZsI)  
## 目前功能 && 需要處理的問題
- 會員系統：註冊、登入、登出、重設密碼。
- 角色選擇：選擇不同的 AI 角色進行聊天。 (還缺少角色大頭貼照與全身照的設計)
- 聊天室：與不同角色進行對話，並保存聊天紀錄。(真正的聊天功能還需要等待 AI 模型串接)
- 自訂夥伴：使用者可創建自訂的 AI 夥伴。 
- 個人資料管理：設定使用者暱稱、生日、性格與 MBTI。 (app.py 大頭貼照 bug 尚須修正)
- 回饋分析：基於 AI 互動表現，提供用戶回饋。(目前僅有頁面，還需要等待 AI 模型串接)

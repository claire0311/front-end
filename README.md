# WingChat - AI 社交教練

WingChat 是一個使用 React 和 Ollama 构建的 AI 社交教練 Web 應用程式。旨在透過與使用者自訂的 AI 角色進行互動，幫助使用者在不同的社交情境下練習溝通技巧，並提供回饋以促進個人成長。

[![WingChat 截圖](圖片連結)](![image](https://github.com/user-attachments/assets/ee7d4133-8d9e-4423-a4ac-56aed4d82074)) <!-- 建議放一張應用截圖 -->

## ✨ 主要功能

*   **訓練室:**
    *   與 AI 進行情境式對話練習。
    *   自由設定本次對話的**社交目標**。
    *   **角色選擇:** 直接在訓練室界面切換不同的 AI 角色進行互動。
    *   **即時回饋:** 提供「我說得如何？」按鈕，立即請求 AI 對當前對話表現進行評估。
    *   **對話記錄:** 根據「角色」和「目標」自動保存和加載聊天記錄 (使用瀏覽器 `localStorage`)。
    *   同步刪除：清除聊天記錄時，相關的回饋記錄也會一併刪除。
*   **角色館:**
    *   **自訂 AI 角色:** 新增、編輯、刪除具有特定名稱和詳細描述的角色。AI 的回應會基於此描述。
    *   **數據持久化:** 角色列表保存在瀏覽器 `localStorage` 中。
    *   **重複檢查:** 防止新增名稱重複的角色。
    *   **角色評估:** 查看與特定角色過往對話的回饋總覽和趨勢。
*   **回饋牆:**
    *   **固定佈局:** 標題、描述和篩選區域固定在上方。
    *   **數據視覺化:**
        *   點擊按鈕彈出**折線圖**，顯示最近練習的表現趨勢。
        *   點擊按鈕彈出**雷達圖**，顯示基於當前篩選條件的各項能力平均分數。
    *   **篩選與搜尋:**
        *   可根據**角色名稱**或**對話目標關鍵字**篩選回饋記錄。
        *   篩選區域可**收起/展開**。
    *   **詳細記錄:** 顯示包含使用者當時發言上下文的歷史回饋記錄。
    *   **管理:** 可單獨刪除某筆回饋記錄。
*   **本地 LLM 集成:**
    *   通過 API 與本地運行的 **Ollama** 連接，實現 AI 對話和回饋生成。
    *   可通過 `.env` 文件配置使用的 Ollama 模型。

## 🛠️ 技術棧

*   **前端:** React, React Bootstrap, Bootstrap 5
*   **圖表:** Chart.js, react-chartjs-2
*   **API 請求:** Axios
*   **Markdown 處理:** Marked, DOMPurify
*   **本地儲存:** Browser `localStorage` API
*   **LLM 後端:** Ollama (本地運行)
*   **版本控制:** Git, GitHub

## 🚀 環境要求

開始之前，請確保你的系統已安裝：

1.  **Node.js & npm (或 yarn):** [官網下載](https://nodejs.org/) (推薦 LTS 版本)
    *   確認版本: `node -v` 和 `npm -v` (或 `yarn -v`)
2.  **Git:** [官網下載](https://git-scm.com/)
    *   確認版本: `git --version`
3.  **Ollama:** [官網下載](https://ollama.ai/)
    *   確保 Ollama 服務正在運行。
    *   **必須**下載應用所需的 LLM 模型 (見下方 Ollama 設定)。

## ⚙️ 本地設置與啟動

1.  **Clone 儲存庫:**
    ```bash
    git clone <你的 GitHub 儲存庫 URL>
    cd wingchat-app # 或者你的專案文件夾名稱
    ```

2.  **安裝依賴:**
    ```bash
    npm install
    # 或 yarn install
    ```

3.  **配置環境變數:**
    *   在專案根目錄創建一個名為 `.env` 的文件。
    *   複製以下內容並根據你的設置修改：
        ```env
        # Ollama API 位址 (通常無需修改)
        REACT_APP_OLLAMA_API_URL=http://localhost:11434

        # 主要聊天使用的 Ollama 模型名稱 (必須已下載到 Ollama)
        REACT_APP_OLLAMA_CHAT_MODEL=huayi-llama3:latest # <<<--- 替換為你導入的模型名

        # (可選) 請求回饋使用的 Ollama 模型名稱 (若留空則同上)
        REACT_APP_OLLAMA_FEEDBACK_MODEL=huayi-llama3:latest # <<<--- 替換為你導入的模型名
        ```
    *   **重要:** `.env` 文件不應提交到 Git。

4.  **Ollama 設定:**
    *   **啟動 Ollama:** 確保 Ollama Desktop 應用或其後台服務正在運行。
    *   **下載模型:** 在終端機執行 `ollama pull <模型名稱>`。你**至少**需要下載在 `.env` 文件中指定的模型。例如：
        ```bash
        ollama pull huayi-llama3:latest
        # 或者，如果你想用預設模型測試
        # ollama pull llama3.2:latest
        ```

5.  **啟動應用:**
    ```bash
    npm start
    # 或 yarn start
    ```
    應用程式將在 `http://localhost:3000` 開啟。

## 💡 提示與排錯

*   **Ollama 連接失敗 (`ECONNREFUSED`, `model not found`)**: 請確認 Ollama 服務是否正在運行，以及 `.env` 中的 API URL 和模型名稱是否正確且模型已通過 `ollama pull` 下載。
*   **`.env` 修改後未生效**: 需要停止 (`Ctrl+C`) 並重新啟動 (`npm start`) React 應用。
*   **安裝錯誤**: 檢查網路連接，嘗試刪除 `node_modules` 和 `package-lock.json` (或 `yarn.lock`) 後重新 `npm install`。

---

歡迎為 WingChat 做出貢獻！

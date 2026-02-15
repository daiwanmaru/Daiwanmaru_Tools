# 功能開發與除錯全記錄：PDF 合併工具（非同步工作者模式）

這份文件詳細記錄了「PDF 合併工具」的完整開發過程。我們採用了 **非同步工作者（Workers）模式** 來確保處理大檔案時的效能與穩定性。

---

## 🏗️ 1. 架構設計思維（為什麼這樣做？）

我們選擇將檔案處理邏輯移出 Next.js API，交給獨立的 Worker 處理，原因如下：

*   **避免超時（Timeouts）**：Next.js API（特別是部署在 Vercel 時）通常有 10~60 秒的執行限制。合併大型 PDF 很可能超過這個時間導致請求失敗。
*   **效能與擴展性（Scalability）**：密集的 CPU 運算（PDF 合併）不應該佔用網頁伺服器的資源，否則會影響其他使用者的瀏覽速度。
*   **職責分離（Separation of Concerns）**：前端負責接收使用者請求，後端 Worker 專注於執行重度任務。

### 🔄 完整的工作流程
1.  **前端 (Next.js)**：使用者上傳檔案 -> 呼叫 `/api/jobs/create` 建立任務。
2.  **API**：在資料庫建立一筆 `Job` 記錄（狀態：`PENDING`）。
3.  **儲存 (Storage)**：將檔案上傳至 AWS S3 / Backblaze B2。
    *   *關鍵決策*：為了解決瀏覽器的 CORS 問題，我們採用了 **Proxy Upload** 模式（前端傳給 Next.js API，再由 API 轉傳給 B2）。
4.  **佇列 (Queue)**：將 `jobId` 推入 Redis 佇列，通知 Worker 有新任務。
5.  **工作者 (Worker)**：
    *   從 Redis 取出 `jobId`。
    *   從 B2 下載原始檔案。
    *   執行 `pdf-merge` 邏輯。
    *   將結果上傳回 B2。
    *   更新 `Job` 狀態為 `COMPLETED`。
6.  **前端**：持續輪詢（Poll） `/api/jobs/[id]`，直到狀態變更完成，並顯示下載連結。

---

## 🛠️ 2. 開發步驟與與除錯歷程

### 第一階段：基礎建設（資料庫與 API）

**目標**：建立任務記錄並定義資料結構。

*   **行動**：修改 `prisma/schema.prisma`，加入 `Tool`（含分類）與 `Job` 模型。
*   **挑戰**：程式碼中出現型別錯誤（`status`、`inputs` 欄位不符）。
*   **解決**：執行 `prisma generate` 並確認 `prisma db push` 成功，讓 Prisma Client 跟資料庫結構同步。
*   **行動**：建立 `apps/web/src/app/api/jobs/create/route.ts` 處理任務建立。

### 第二階段：檔案上傳與儲存（關鍵卡關點）

**目標**：將使用者檔案安全地上傳到雲端儲存（B2）。

*   **初始方案**：使用 **Presigned URL** 讓瀏覽器直接上傳到 B2（節省伺服器流量）。
*   **Bug #1（邏輯順序錯誤）**：我們原本是「先存 Job 到資料庫，再產生上傳網址」。
    *   *這會導致什麼問題？* Job 存入資料庫時沒有包含檔案的 Key（因為還沒產生），導致 Worker 後來根本找不到檔案下載。
    *   *修正*：重構 API 邏輯，改為「先產生上傳網址與 Key，再存入資料庫」。
*   **Bug #2（CORS 高牆）**：瀏覽器噴出錯誤 `Access to fetch ... has been blocked by CORS policy`。
    *   *原因*：瀏覽器的安全機制禁止網頁直接對第三方網域（B2）發送 PUT 請求，除非對方伺服器明確允許。
    *   *嘗試 A*：寫了一個腳本 `scripts/set-cors.ts` 嘗試修改 B2 的 CORS 設定。
        *   *結果*：由於權限或 API 相容性問題，設定一直失敗。
    *   *解決方案（Proxy 模式）*：改寫上傳邏輯，新增 `api/upload/route.ts`。現在瀏覽器把檔案傳給我們的 Next.js 後端，後端再轉傳給 B2。伺服器對伺服器溝通不受 CORS 限制，完美解決！

### 第三階段：工作者開發（後端處理核心）

**目標**：讓背景 Worker 真正能夠執行任務。

*   **架構**：建立了 `apps/worker` 並導入模組化設計（`processors/` 目錄）。
    *   實作了 `processors/pdf-merge/index.ts`（使用 `pdf-lib` 套件）。
*   **實作**：在 `StorageAdapter` 中補上了 `downloadFile` 與 `uploadFile` 方法，支援串流處理。
*   **Bug #3（沉默的工人）**：Worker 雖然啟動了，但一直收不到任務。
    *   *診斷*：查看 Log 發現 Worker 一直在 `Polling for jobs...` 但沒有反應。
    *   *原因*：API 雖然建立了資料庫記錄，但**忘記把任務 ID 推入 Redis 佇列**！就像去餐廳點餐，單子寫好了卻沒送進廚房。
    *   *修正*：在前端上傳完成後，補上呼叫 `/api/jobs/[id]/process`（這支 API 會執行 `queue.enqueue(id)`）。

### 第四階段：前端串接與整合

**目標**：將所有流程串起來，提供流暢的使用者體驗。

*   **實作**：開發 `UploadZone.tsx` 元件。
*   **邏輯**：
    1.  呼叫 Create API -> 取得 Job ID。
    2.  透過 Proxy API 上傳檔案。
    3.  呼叫 Process API -> 觸發 Worker 開始工作。
    4.  啟動 `setInterval` 輪詢狀態。
*   **成果**：介面狀態從「處理中」順利變更為「完成」，並顯示綠色下載按鈕。

---

## 🧩 核心學習與總結

### 1. 資料庫 Schema 的同步至關重要
當你修改 `prisma.schema` 後，務必重新生成 Client。很多莫名其妙的型別錯誤都是因為 Client 過舊造成的。

### 2. Presigned URL vs. Proxy Upload
直傳（Presigned URL）效能最好，但 **CORS 設定非常麻煩**。
*   **直傳優點**：快、省伺服器資源。
*   **直傳缺點**：設定複雜、權限管理不易。
*   **Proxy 優點**：開發簡單、無 CORS 問題。
*   **Proxy 缺點**：檔案會經過你的伺服器，流量與 CPU 負擔較重。對於 MVP（最小可行性產品）或初期專案，Proxy 是最穩健的選擇。

### 3. 非同步任務的「膠水」代碼
如果背景任務沒跑，通常是因為「接合處」出了問題。API 有沒有發送訊息？佇列有沒有收到？Worker 有沒有崩潰？這時候看 Log 是最快的方法。

### 4. 模組化設計的好處
我們把 Worker 的邏輯拆分成獨立的 `processors/`。未來如果要加「圖片壓縮」或「影片轉檔」，只需要新增一個資料夾，完全不需要動到核心架構。這就是**可擴展性**。

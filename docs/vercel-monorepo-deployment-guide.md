# Vercel Monorepo 部署完整指南

> 記錄時間: 2026-02-17  
> 專案: Daiwanmaru Tools Monorepo  
> 成功版本: v1.0.0-successful-deployment

---

## 📋 目錄

1. [專案結構](#專案結構)
2. [部署失敗歷程](#部署失敗歷程)
3. [最終成功配置](#最終成功配置)
4. [核心概念解析](#核心概念解析)
5. [故障排除指南](#故障排除指南)

---

## 專案結構

```
monorepo/
├── apps/
│   ├── web/                    # Next.js 應用
│   │   ├── package.json        # 包含 Next.js 依賴
│   │   ├── vercel.json         # ⭐ Vercel 配置檔（關鍵）
│   │   └── .next/              # 構建輸出
│   └── worker/                 # Worker 應用
├── packages/
│   └── core/                   # 共享核心套件
│       ├── package.json        # 包含 Prisma
│       └── dist/               # TypeScript 編譯輸出
├── package.json                # Monorepo 根配置
├── pnpm-workspace.yaml         # pnpm workspace 定義
├── turbo.json                  # Turborepo 配置
└── vercel.json                 # ⚠️ 當 Root Directory = apps/web 時會被忽略
```

---

## 部署失敗歷程

### 🔴 失敗 #1: 無法識別 Next.js 版本

**錯誤訊息:**
```
Error: No Next.js version detected. Make sure your package.json has "next" 
in either "dependencies" or "devDependencies".
```

**配置:**
- Root Directory: `.` (monorepo 根目錄)
- vercel.json 位置: 根目錄

**問題分析:**
```
Vercel 檢測流程:
1. 讀取 Root Directory 的 package.json
2. 尋找 "next" 依賴 → ❌ 根目錄沒有 Next.js
3. 框架檢測失敗 → 停止部署
```

**根本原因:**
- Vercel 在 **框架檢測階段** 就需要找到 Next.js
- 根目錄的 `package.json` 只有 monorepo 管理工具（turbo, pnpm）
- Next.js 實際在 `apps/web/package.json` 中

---

### 🔴 失敗 #2: Workspace 套件找不到

**錯誤訊息:**
```
ERR_PNPM_WORKSPACE_PKG_NOT_FOUND
In : "@daiwanmaru/core@workspace:*" is in the dependencies but no package 
named "@daiwanmaru/core" is present in the workspace
```

**配置:**
```json
// vercel.json (根目錄)
{
  "installCommand": "pnpm install --filter=web...",
  "buildCommand": "pnpm turbo build --filter=web"
}
```

**問題分析:**
```
執行流程:
1. Vercel 在根目錄執行: pnpm install --filter=web...
2. pnpm 尋找 pnpm-workspace.yaml → ✅ 找到
3. pnpm 嘗試解析 workspace 依賴 → ❌ 上下文錯誤
4. 無法正確識別 @daiwanmaru/core
```

**根本原因:**
- `--filter` 參數在某些情況下會導致 workspace 解析問題
- Vercel 的執行環境可能影響 pnpm workspace 的上下文

---

### 🔴 失敗 #3: 安裝成功但仍找不到 Next.js

**錯誤訊息:**
```
Warning: Could not identify Next.js version
Error: No Next.js version detected.
```

**配置:**
```json
// vercel.json (根目錄)
{
  "installCommand": "pnpm install",
  "buildCommand": "pnpm turbo build --filter=web",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs"
}
```

**構建日誌顯示:**
```
✅ pnpm install 成功
✅ @daiwanmaru/core 構建成功
✅ Prisma Client 生成成功
❌ 框架檢測失敗
```

**問題分析:**
```
Vercel 執行順序:
1. 框架檢測 (在 Root Directory) → ❌ 找不到 Next.js
2. 執行 installCommand → (永遠不會執行到這裡)
3. 執行 buildCommand
```

**根本原因:**
- **框架檢測在安裝之前執行**
- 即使設定 `"framework": "nextjs"`，Vercel 仍需要在 Root Directory 找到 Next.js
- 這是 Vercel 的設計邏輯，無法繞過

---

### 🟡 失敗 #4: Root Directory 設定後配置檔位置錯誤

**配置:**
- Vercel Dashboard: Root Directory = `apps/web`
- vercel.json 位置: **根目錄** (錯誤位置)

**錯誤訊息:**
```
ERR_PNPM_WORKSPACE_PKG_NOT_FOUND
This error happened while installing a direct dependency of /vercel/path0/apps/web
```

**問題分析:**
```
Vercel 配置讀取邏輯:
1. Root Directory = apps/web
2. Vercel 讀取: apps/web/vercel.json → ❌ 不存在
3. 使用預設配置: pnpm install (在 apps/web 執行)
4. pnpm 在 /vercel/path0/apps/web 尋找 pnpm-workspace.yaml → ❌ 找不到
5. workspace 解析失敗
```

**關鍵發現:**
```
⭐ Vercel 配置檔讀取規則:
   配置檔位置 = Root Directory + vercel.json
   
   如果 Root Directory = apps/web
   → Vercel 讀取 apps/web/vercel.json
   → 根目錄的 vercel.json 會被忽略！
```

**根本原因:**
- 配置檔放錯位置
- 根目錄的 `vercel.json` 在 Root Directory = `apps/web` 時不會被讀取

---

### 🟢 成功 #5: 正確配置 apps/web/vercel.json

**最終配置:**

**Vercel Dashboard:**
```
Root Directory: apps/web
Output Directory: .next
```

**apps/web/vercel.json:**
```json
{
  "installCommand": "cd ../.. && pnpm install",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=web",
  "outputDirectory": ".next"
}
```

**執行流程:**
```
1. 框架檢測階段:
   - Vercel 在 /vercel/path0/apps/web
   - 讀取 apps/web/package.json
   - 找到 "next": "16.1.6" → ✅ 檢測成功

2. 安裝階段:
   - 執行: cd ../.. && pnpm install
   - 切換到: /vercel/path0
   - pnpm 找到 pnpm-workspace.yaml → ✅ workspace 識別成功
   - 安裝所有套件，包括 @daiwanmaru/core → ✅

3. 構建階段:
   - 執行: cd ../.. && pnpm turbo build --filter=web
   - 在 /vercel/path0 執行 Turbo
   - Turbo 根據 dependsOn: ["^build"] 先構建 @daiwanmaru/core → ✅
   - 再構建 web 應用 → ✅

4. 輸出階段:
   - outputDirectory: ".next" (相對於 Root Directory)
   - Vercel 在 /vercel/path0/apps/web/.next 找到輸出 → ✅
   - 部署成功 🎉
```

---

## 最終成功配置

### Vercel Dashboard 設定

進入專案 → Settings → General:

```
Root Directory: apps/web
```

進入 Build & Development Settings:

```
Framework Preset: Next.js
Build Command: (使用 vercel.json 的設定)
Output Directory: .next
Install Command: (使用 vercel.json 的設定)
```

### apps/web/vercel.json

```json
{
  "installCommand": "cd ../.. && pnpm install",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=web",
  "outputDirectory": ".next"
}
```

### turbo.json (確保依賴順序)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        "dist/**",
        ".next/**",
        "!.next/cache/**"
      ]
    }
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

---

## 核心概念解析

### 1. Vercel 配置檔讀取規則

```
規則: Vercel 讀取配置的位置 = Root Directory + vercel.json

範例:
- Root Directory = "." → 讀取 ./vercel.json
- Root Directory = "apps/web" → 讀取 apps/web/vercel.json
```

**重要提醒:**
- ⚠️ 當設定 Root Directory 後，根目錄的 vercel.json 會被忽略
- ✅ 必須在 Root Directory 指定的目錄下創建 vercel.json

### 2. Monorepo 的兩難困境

```
困境 1: 框架檢測
- Vercel 需要在 Root Directory 找到框架（如 Next.js）
- 但 monorepo 根目錄通常沒有框架依賴

困境 2: Workspace 管理
- pnpm/yarn workspace 需要在根目錄執行
- 但 Vercel 的 Root Directory 可能不在根目錄

解決方案:
- Root Directory 設為應用目錄（apps/web）→ 解決框架檢測
- 使用 cd ../.. 切回根目錄 → 解決 workspace 管理
```

### 3. Vercel 執行順序

```
1. 框架檢測 (Framework Detection)
   - 在 Root Directory 執行
   - 讀取 package.json 尋找框架依賴
   - ⚠️ 此階段失敗會直接停止部署

2. 安裝依賴 (Install)
   - 執行 installCommand
   - 預設: npm install / yarn install / pnpm install

3. 構建專案 (Build)
   - 執行 buildCommand
   - 預設: npm run build / yarn build / pnpm build

4. 尋找輸出 (Output)
   - 在 outputDirectory 尋找構建結果
   - 路徑相對於 Root Directory
```

### 4. 路徑解析規則

```
假設 Root Directory = apps/web

相對路徑解析:
- outputDirectory: ".next"
  → 實際路徑: /vercel/path0/apps/web/.next

- outputDirectory: "apps/web/.next"
  → 實際路徑: /vercel/path0/apps/web/apps/web/.next (錯誤!)

目錄切換:
- cd ../.. 
  → 從 /vercel/path0/apps/web 切換到 /vercel/path0
```

### 5. Turborepo 依賴管理

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]  // ⭐ 關鍵設定
    }
  }
}
```

**`"dependsOn": ["^build"]` 的作用:**
```
當執行: pnpm turbo build --filter=web

Turbo 會:
1. 分析 web 的依賴 → 發現依賴 @daiwanmaru/core
2. 檢查 dependsOn: ["^build"]
3. 先執行 @daiwanmaru/core 的 build
4. 再執行 web 的 build

這確保了依賴順序正確！
```

---

## 故障排除指南

### 問題 1: "No Next.js version detected"

**症狀:**
```
Error: No Next.js version detected. Make sure your package.json has "next" 
in either "dependencies" or "devDependencies".
```

**檢查清單:**
- [ ] Root Directory 是否設定為包含 Next.js 的目錄？
- [ ] 該目錄的 package.json 是否包含 Next.js 依賴？
- [ ] Vercel Dashboard 的 Root Directory 設定是否正確？

**解決方案:**
```
1. 進入 Vercel Dashboard → Settings → General
2. 設定 Root Directory 為 apps/web (或你的 Next.js 應用目錄)
3. 確保 apps/web/package.json 包含 Next.js
```

---

### 問題 2: "ERR_PNPM_WORKSPACE_PKG_NOT_FOUND"

**症狀:**
```
ERR_PNPM_WORKSPACE_PKG_NOT_FOUND
In : "@daiwanmaru/core@workspace:*" is in the dependencies but no package 
named "@daiwanmaru/core" is present in the workspace
```

**檢查清單:**
- [ ] pnpm install 是否在 monorepo 根目錄執行？
- [ ] pnpm-workspace.yaml 是否存在於根目錄？
- [ ] workspace 套件是否正確定義？

**解決方案:**
```json
// apps/web/vercel.json
{
  "installCommand": "cd ../.. && pnpm install"
}
```

**說明:**
- `cd ../..` 確保切換到 monorepo 根目錄
- pnpm 可以找到 pnpm-workspace.yaml
- workspace 依賴解析成功

---

### 問題 3: "Output directory not found"

**症狀:**
```
The Next.js output directory "apps/web/.next" was not found at 
"/vercel/path0/apps/web/apps/web/.next"
```

**問題分析:**
```
路徑被重複了:
- Root Directory: apps/web
- Output Directory: apps/web/.next
- 實際尋找: apps/web + apps/web/.next = apps/web/apps/web/.next (錯誤!)
```

**解決方案:**
```json
// apps/web/vercel.json
{
  "outputDirectory": ".next"  // 相對於 Root Directory
}
```

---

### 問題 4: 配置檔不生效

**症狀:**
- 明明設定了 vercel.json，但 Vercel 似乎沒有使用

**檢查清單:**
- [ ] vercel.json 是否在正確的位置？
- [ ] Root Directory 設定是什麼？
- [ ] 是否有 Vercel Dashboard 的 Override 設定？

**配置檔位置規則:**
```
Root Directory = "." 
→ 讀取 ./vercel.json

Root Directory = "apps/web" 
→ 讀取 apps/web/vercel.json
→ 根目錄的 vercel.json 會被忽略！
```

**解決方案:**
1. 確認 Root Directory 設定
2. 將 vercel.json 放在正確位置
3. 檢查 Vercel Dashboard 是否有 Override 設定

---

### 問題 5: 依賴套件沒有先構建

**症狀:**
```
Error: Cannot find module '@daiwanmaru/core'
或
Module not found: Can't resolve '@daiwanmaru/core'
```

**檢查清單:**
- [ ] turbo.json 是否設定 dependsOn？
- [ ] 依賴套件是否有 build script？
- [ ] build 命令是否使用 turbo？

**解決方案:**

1. **確保 turbo.json 設定正確:**
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]  // ⭐ 必須設定
    }
  }
}
```

2. **確保依賴套件有 build script:**
```json
// packages/core/package.json
{
  "scripts": {
    "build": "prisma generate && tsc"
  }
}
```

3. **使用 turbo 執行構建:**
```json
// apps/web/vercel.json
{
  "buildCommand": "cd ../.. && pnpm turbo build --filter=web"
}
```

---

## 最佳實踐建議

### 1. 目錄結構建議

```
monorepo/
├── apps/
│   └── web/
│       ├── vercel.json          ✅ 配置檔放這裡
│       └── package.json         ✅ 包含 Next.js
├── packages/
│   └── core/
│       ├── package.json         ✅ 包含 build script
│       └── tsconfig.json
├── pnpm-workspace.yaml          ✅ workspace 定義
├── turbo.json                   ✅ 依賴管理
└── package.json                 ✅ monorepo 根配置
```

### 2. vercel.json 模板

```json
{
  "installCommand": "cd ../.. && pnpm install",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=web",
  "outputDirectory": ".next"
}
```

**說明:**
- `cd ../..`: 切換到 monorepo 根目錄（根據你的層級調整）
- `pnpm install`: 安裝所有 workspace 套件
- `pnpm turbo build --filter=web`: 使用 Turbo 構建，自動處理依賴順序
- `outputDirectory: ".next"`: 相對於 Root Directory

### 3. Vercel Dashboard 設定檢查表

進入專案設定前，準備以下資訊:

- [ ] Next.js 應用的目錄路徑（如 `apps/web`）
- [ ] 構建輸出目錄（通常是 `.next`）
- [ ] Monorepo 根目錄相對於應用目錄的路徑（如 `../..`）

設定步驟:

1. **General Settings:**
   - Root Directory: `apps/web`

2. **Build & Development Settings:**
   - Framework Preset: Next.js
   - Build Command: Override (使用 vercel.json)
   - Output Directory: `.next`
   - Install Command: Override (使用 vercel.json)

3. **Environment Variables:**
   - 設定必要的環境變數（如 DATABASE_URL）

### 4. 本地測試建議

在推送到 Vercel 前，先在本地測試:

```bash
# 1. 清理所有構建產物
pnpm clean  # 如果有定義

# 2. 安裝依賴
pnpm install

# 3. 構建所有套件
pnpm turbo build

# 4. 檢查構建輸出
ls apps/web/.next  # 應該看到構建結果

# 5. 本地運行
cd apps/web
pnpm start
```

### 5. 環境變數管理

**建議結構:**
```
.env.example          # 範例檔案，提交到 Git
.env.local            # 本地開發，不提交
.env.production       # 生產環境，不提交
```

**Vercel 設定:**
1. 進入 Settings → Environment Variables
2. 為每個環境設定變數:
   - Production
   - Preview
   - Development

**重要變數範例:**
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-domain.com
```

---

## 常見錯誤速查表

| 錯誤訊息 | 可能原因 | 解決方案 |
|---------|---------|---------|
| No Next.js version detected | Root Directory 設定錯誤 | 設定為 Next.js 應用目錄 |
| ERR_PNPM_WORKSPACE_PKG_NOT_FOUND | workspace 上下文錯誤 | 使用 `cd ../..` 切換到根目錄 |
| Output directory not found | 路徑設定錯誤 | 使用相對路徑 `.next` |
| Cannot find module '@daiwanmaru/core' | 依賴未構建 | 檢查 turbo.json 的 dependsOn |
| vercel.json 不生效 | 配置檔位置錯誤 | 放在 Root Directory 下 |

---

## 參考資源

### 官方文檔

- [Vercel Monorepo 指南](https://vercel.com/docs/concepts/monorepos)
- [Turborepo 文檔](https://turbo.build/repo/docs)
- [pnpm Workspace](https://pnpm.io/workspaces)
- [Next.js 部署](https://nextjs.org/docs/deployment)

### 相關配置檔

- `apps/web/vercel.json` - Vercel 部署配置
- `turbo.json` - Turborepo 任務配置
- `pnpm-workspace.yaml` - pnpm workspace 定義
- `package.json` - 套件依賴管理

---

## 版本歷史

### v1.0.0-successful-deployment (2026-02-17)
- ✅ 成功部署到 Vercel
- ✅ 修復 monorepo 配置問題
- ✅ 正確處理 workspace 依賴
- ✅ 實現自動依賴構建順序

### 失敗嘗試記錄
- 嘗試 #1: Root Directory 設定錯誤
- 嘗試 #2: workspace 解析失敗
- 嘗試 #3: 框架檢測失敗
- 嘗試 #4: 配置檔位置錯誤
- 嘗試 #5: ✅ 成功

---

## 總結

### 成功的關鍵要素

1. **Root Directory**: 設定為 Next.js 應用目錄（`apps/web`）
2. **配置檔位置**: 在 Root Directory 下創建 `vercel.json`
3. **目錄切換**: 使用 `cd ../..` 回到 monorepo 根目錄
4. **依賴管理**: 使用 Turborepo 的 `dependsOn` 確保構建順序
5. **相對路徑**: `outputDirectory` 使用相對於 Root Directory 的路徑

### 核心理解

```
Vercel Monorepo 部署的本質是平衡兩個需求:

1. 框架檢測: 需要在應用目錄（有 Next.js 的地方）
2. Workspace 管理: 需要在 monorepo 根目錄（有 workspace 配置的地方）

解決方案:
- Root Directory 設為應用目錄 → 滿足框架檢測
- 命令中使用 cd ../.. → 滿足 workspace 管理
```

### 學到的教訓

1. **Vercel 配置檔的讀取位置很重要** - 必須放在 Root Directory 下
2. **框架檢測在安裝之前執行** - 無法透過 build 命令繞過
3. **路徑都是相對於 Root Directory** - 避免使用絕對路徑
4. **Turborepo 的 dependsOn 很強大** - 自動處理依賴構建順序
5. **本地測試很重要** - 在推送前確保構建成功

---

**文檔維護者**: Daiwanmaru  
**最後更新**: 2026-02-17  
**專案**: Daiwanmaru Tools Monorepo

# AccessMemory 路忆 · AI 动态无障碍地图

> **Insta360 黑客松 · 公益赛道** 参赛作品
> 用影像看见真实空间，用 AI 判断道路能不能走，用地图为行动不便者规划真正可通行的路线。
> **每一次真实出行，都在帮助下一次出行。**

面向轮椅使用者与行动不便人群的 AI 动态无障碍地图：使用 **Insta360 X5** 拍摄园区，经 **AHOLO** 三维重建生成可浏览的真实空间；多模态 AI 持续理解道路 / 坡道 / 台阶 / 施工 / 临时障碍，结合用户上报与 **GO Ultra** 出行影像，让地图状态随真实使用持续更新，规划"现在真正能走"的无障碍路线。

产品需求详见 👉 [AccessMemory_MVP_SPEC.md](./AccessMemory_MVP_SPEC.md)

---

## 目录结构

```text
【保研】人机交互系统/               ← 仓库根目录（AccessMemory 项目）
├── AccessMemory_MVP_SPEC.md        # MVP 产品需求文档（唯一需求事实源）
├── README.md                       # 本文件
├── .gitattributes                  # Git LFS 规则（*.splat/*.ply/*.glb/*.mp4 等大文件）
│
├── cloud-nanjing-university-tour/  # 产品展示落地页（React 19 + Vite + Tailwind CDN + framer-motion）
│   │                               #   前身为"云上南雍"南大导览展示页，正改造为 AccessMemory 展示页
│   ├── App.tsx / index.tsx / index.html
│   ├── components/                 #   Navbar / Hero / Features / About / Footer
│   └── public/                     #   静态图片资源
│
├── gs_campus/                      # 3D 高斯泼溅地图引擎（gaussian-splats-3d 定制 fork）
│   │                               #   前身为"小蓝鲸"南大鼓楼校区 3D 地图，将改造为无障碍地图 Demo
│   ├── src/                        #   引擎源码（loader / viewer / 渲染）
│   ├── demo/                       #   Demo 页面与业务层（BlueWhale.js、buildings.js、navigation-system.js、i18n.js）
│   │   └── assets/data/campus/     #   南大校园 splat/ply 模型
│   └── proxy-server.js             #   本地代理（Dify API 等）
│
└── *.splat                         # Demo 场景素材：南京·栖霞某酒店园区（Insta360 X5 拍摄 + AHOLO 重建）
    ├── 1现代建筑园区入口与景观步道.splat   # 园区入口与景观步道（约 43MB）
    ├── 2新中式酒店走廊(1).splat           # 新中式酒店走廊（约 11MB）
    ├── 3.splat                            # 场景 3（约 19MB）
    └── 4湖畔度假区入口与园林.splat         # 湖畔度假区入口与园林（约 48MB）
```

## 快速开始

### 展示落地页（cloud-nanjing-university-tour）

```bash
cd cloud-nanjing-university-tour
npm install        # 首次
npm run dev        # 开发预览（Vite 默认 http://localhost:5173）
npm run build      # 构建产物输出至 dist/
```

### 3D 地图 Demo（gs_campus）

展示页中的"进入系统"按钮指向 `http://127.0.0.1:8080`，即 gs_campus 的 demo 目录：

```bash
cd gs_campus/demo
python -m http.server 8080     # 或 npx serve -l 8080
# 浏览器打开 http://127.0.0.1:8080
```

如需 AI 对话等后端能力，另见 `gs_campus/proxy-server.js`。

## 版本管理约定

- **分支**：`main` 为可演示的稳定版本；功能开发走 `feat/*` 分支，验证通过后合并回 `main`。
- **提交信息**：Conventional Commits 风格（`feat:` / `fix:` / `chore:` / `docs:` / `style:` / `refactor:`）。
- **大文件**：`*.splat` `*.ply` `*.glb` `*.mp4` `*.mp3` 等一律走 **Git LFS**（规则见 `.gitattributes`），新增大体积素材类型时请同步补充规则。
- **不入库**：`node_modules/`、`dist/`、`build/`、`.env*`、`*.local`、IDE 配置（见 `.gitignore`）。
- **历史沿革**：`gs_campus/` 原为独立 git 仓库（远端 `git.nju.edu.cn/hci2025/gs_campus.git`，"小蓝鲸"南大 3D 校园地图课程项目），其原有 `.git` 历史已完整备份至仓库外 `../_archive_gs_campus_git/`，工作区文件已并入本仓库统一维护。

## 改造路线（复用 → 新产品）

| 模块 | 前身（小蓝鲸/云上南雍） | 目标（AccessMemory） |
| --- | --- | --- |
| 展示页 | 南大校园导览落地页 | Insta360 公益赛道产品页：路忆品牌 + 南京·栖霞试点元素 |
| 3D 场景 | 南大鼓楼校区 splat | 酒店园区 splat（根目录 4 个 X5+AHOLO 重建素材） |
| 导航系统 | 校园建筑导航 | 无障碍路线规划（台阶/坡道/施工感知，OPEN/CAUTION/BLOCKED/UNKNOWN 状态） |
| AI 助手 | Dify 校园问答 | 路况识别（Mock 优先，统一接口 `analyzeRoadMedia()` 可替换真实 VLM） |
| 新增 | — | 道路详情/上报页、风险巡检、状态变化自动重新规划 |

## 技术栈

- **落地页**：React 19 · Vite 6 · Tailwind CSS (CDN) · framer-motion · lucide-react · TypeScript
- **3D 地图**：gaussian-splats-3d（定制 fork）· Three.js · 原生 JS 业务层
- **三维重建**：Insta360 X5 采集 → AHOLO 重建 → `.splat` Web 端渲染
- **AI**：多模态 VLM 路况识别（MVP 阶段 Mock，接口层隔离）

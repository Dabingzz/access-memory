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
│   │                               #   前身为"云上南雍"南大导览展示页，现已改造为 AccessMemory 展示页
│   ├── App.tsx / index.tsx / index.html
│   ├── components/                 #   Navbar / Hero / Features / About / Footer
│   └── public/                     #   静态图片资源
│
├── gs_campus/                      # 3D 高斯泼溅地图引擎（gaussian-splats-3d 定制 fork）
│   │                               #   前身为"小蓝鲸"南大鼓楼校区 3D 地图，现已改造为无障碍地图 Demo
│   ├── src/                        #   引擎源码（loader / viewer / 渲染）
│   ├── demo/                       #   Demo 页面与业务层（BlueWhale.js、buildings.js、navigation-system.js、i18n.js）
│   │   └── assets/data/campus/     #   南大校园 splat/ply 模型
│   └── proxy-server.js             #   本地代理（Dify API 等）
│
└── *.splat                         # Demo 场景素材：南京·栖霞某酒店园区（Insta360 X5 拍摄 + AHOLO 重建）
    ├── 1现代建筑园区入口与景观步道.splat   # 园区入口与景观步道（约 43MB）
    ├── 2新中式酒店走廊(1).splat           # 新中式酒店走廊（约 11MB）
    ├── 3.splat                            # 酒店内庭与连接空间（约 19MB）
    └── 4湖畔度假区入口与园林.splat         # 湖畔度假区入口与园林（约 48MB）
```

## 快速开始

### 展示落地页（cloud-nanjing-university-tour）

```bash
cd cloud-nanjing-university-tour
npm install        # 首次
npm run dev        # 开发预览（项目配置为 http://127.0.0.1:3000）
npm run build      # 构建产物输出至 dist/
```

### 3D 地图 Demo（gs_campus）

展示页中的“打开 3D 空间”按钮指向 AccessMemory 场景选择页。由于场景页需要同时访问 `gs_campus/` 和仓库根目录的 4 个 `.splat`，静态服务器必须从**仓库根目录**启动：

```bash
# 在仓库根目录执行
python -m http.server 8080 --bind 127.0.0.1
# 浏览器打开：
# http://127.0.0.1:8080/gs_campus/demo/accessmemory.html
```

如需 AI 对话等后端能力，另见 `gs_campus/proxy-server.js`。

当前 3D 产品页采用独立业务模块维护：

```text
gs_campus/demo/
├── accessmemory.html              # 产品页面骨架
├── accessmemory.css               # 桌面 / 移动 / 关怀模式视觉系统
└── js/accessmemory/
    ├── app.js                     # 产品状态与完整交互链路
    ├── data.js                    # 场景、道路、设施与风险样本
    ├── route-planner.js           # 带无障碍约束的 Dijkstra 路由
    ├── road-analyzer.js           # 可替换为真实 VLM 的影像分析接口
    ├── first-person-explorer.js   # 沿已核验道路的第一视角移动与连续转场
    └── scene-overlay.js           # 3D 路线、POI 与 2D 拓扑图
```

### 比赛 Demo 建议流程

1. 在顶部切换入口园区、酒店连廊、酒店内庭、湖畔园林四个独立实景；每个场景拥有自己的地点集、设施、风险和道路图。
2. 使用数字键 `1`–`4` 平滑定位场景细节；入口与湖畔场景可按 `M` 进入第一视角，使用 `W/S` 沿道路前后移动、`A/D` 在道路内微调、`Shift` 加速、鼠标环视，或点击沿途设施标志连续前往。
3. 查看设施 POI 和当前场景的默认无台阶路线，再切换轮椅 / 低视力 / 全盲档案。点击“开始导航”会进入路线起点的第一视角；使用底部“下一节点”按钮逐段模拟真实行走与语音指引，抵达后可结束导航返回全景。
4. 打开“影像分析”，分析预置 GO Ultra 出行影像；AI 将对应道路更新为 `BLOCKED`，并自动切换到仍可通行的绕行路线。
5. 打开“巡检”查看同步新增的高优先级风险，再演示用户主动上报。
6. 切换 2D 路网与关怀模式，说明同一份动态道路状态驱动 2D、3D 和巡检视图。

影像分析当前使用稳定 Mock，但页面只依赖统一的 `analyzeRoadMedia(file, profile, context, onProgress)` 接口，后续可直接替换真实多模态服务。

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

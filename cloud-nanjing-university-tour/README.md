# AccessMemory 展示页

路忆 AccessMemory 的比赛展示页，前身为“云上南雍”校园导览落地页。当前页面已替换为 Insta360 黑客松公益赛道内容，并使用南京栖霞酒店园区的真实 `.splat` 数据生成场景预览。

## 页面内容

- AccessMemory 品牌首屏与南京栖霞试点信息
- X5 采集、AHOLO 重建、AI 路况理解、动态路线规划产品闭环
- “道路 B 施工前 / AI 检测施工后”交互式自动改道演示
- 3 个酒店园区点云场景入口
- 公益价值与技术链路说明

## 本地开发

```bash
npm install
npm run dev
```

项目 Vite 配置使用 `http://127.0.0.1:3000`。

页面中的 3D 链接指向 `http://127.0.0.1:8080/gs_campus/demo/accessmemory.html`。请另开终端，在仓库根目录启动静态服务器：

```bash
python -m http.server 8080 --bind 127.0.0.1
```

## 构建

```bash
npm run build
npm run preview
```

构建产物输出到 `dist/`，不纳入 Git。

# 3D校园导览系统 - PowerShell 启动脚本
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  3D校园导览系统 - 一键启动 (PS版)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[错误] 未检测到 Node.js，请先安装 Node.js" -ForegroundColor Red
    exit
}

Write-Host "[1/4] 检查依赖..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    npm install
}

Write-Host "[2/4] 正在执行项目构建 (确保最佳性能)..." -ForegroundColor Yellow
# 强制执行构建以确保使用的是 Rollup 打包后的压缩库文件
npm run build-windows
Write-Host "[完成] 项目构建成功" -ForegroundColor Green

Write-Host "[3/4] 检查端口..." -ForegroundColor Yellow
$PORT = 8080
while ($true) {
    $check = netstat -an | Select-String ":$PORT\s+.*LISTENING"
    if ($check) { $PORT++ } else { break }
}

Write-Host "[4/4] 启动服务器..." -ForegroundColor Yellow
Write-Host "[提示] 地址: http://127.0.0.1:$PORT/index.html" -ForegroundColor Cyan

Start-Process "http://127.0.0.1:$PORT/index.html"
node util/server.js -d ./build/demo -p $PORT

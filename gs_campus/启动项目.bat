@echo off
chcp 65001 >nul
echo ========================================
echo   3D校园导览系统 - 一键启动
echo ========================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] 检查依赖是否已安装...
if not exist "node_modules" (
    echo [提示] 检测到首次运行，正在安装依赖...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 依赖安装失败，请检查网络连接和 Node.js 版本
        pause
        exit /b 1
    )
    echo [完成] 依赖安装成功
) else (
    echo [完成] 依赖已安装
)

echo.
echo [2/4] 检查项目是否已构建...
if not exist "build\demo\index.html" (
    echo [提示] 项目尚未构建，正在构建...
    call npm run build-windows
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 构建失败，请检查错误信息
        pause
        exit /b 1
    )
    echo [完成] 项目构建成功
) else (
    echo [完成] 项目已构建
)

echo.
echo [3/4] 检查服务器端口...
set PORT=8080
netstat -an | find ":8080" | find "LISTENING" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [警告] 端口 8080 已被占用，将尝试使用端口 8081...
    set PORT=8081
    netstat -an | find ":8081" | find "LISTENING" >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [警告] 端口 8081 也被占用，将尝试使用端口 8082...
        set PORT=8082
    )
) else (
    echo [完成] 端口 8080 可用
)

echo.
echo [4/4] 启动本地服务器...
echo [提示] 服务器将在 http://127.0.0.1:%PORT% 启动
echo [提示] 按 Ctrl+C 可以停止服务器
echo.

REM 启动服务器并自动打开浏览器
start "" "http://127.0.0.1:%PORT%/index.html"
timeout /t 2 /nobreak >nul
node util/server.js -d ./build/demo -p %PORT%

pause


@echo off
chcp 65001 >nul
echo ========================================
echo   3D校园导览系统 - 打包项目
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

echo [1/2] 正在构建项目...
call npm run build-windows
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 构建失败，请检查错误信息
    pause
    exit /b 1
)
echo [完成] 项目构建成功

echo.
echo [2/3] 正在创建打包目录...
set PACKAGE_DIR=打包文件
if exist "%PACKAGE_DIR%" (
    echo [提示] 删除旧的打包目录...
    rmdir /s /q "%PACKAGE_DIR%"
)

mkdir "%PACKAGE_DIR%"
mkdir "%PACKAGE_DIR%\build"
mkdir "%PACKAGE_DIR%\util"

echo [提示] 复制项目文件...
xcopy /E /I /Y "build\demo" "%PACKAGE_DIR%\build\demo"
xcopy /E /I /Y "util" "%PACKAGE_DIR%\util"
copy /Y "package.json" "%PACKAGE_DIR%\"
copy /Y "启动项目.bat" "%PACKAGE_DIR%\"

echo [3/3] 创建说明文件...
(
echo ========================================
echo   3D校园导览系统 - 使用说明
echo ========================================
echo.
echo 系统要求:
echo - 需要安装 Node.js ^(推荐版本 16 或更高^)
echo - 下载地址: https://nodejs.org/
echo.
echo 使用方法:
echo 1. 确保已安装 Node.js
echo 2. 双击 "启动项目.bat" 文件
echo 3. 等待浏览器自动打开
echo.
echo 注意事项:
echo - 首次运行需要执行: npm install
echo - 如果遇到端口占用，可以修改启动脚本中的端口号
echo - 关闭命令行窗口即可停止服务器
echo.
echo ========================================
) > "%PACKAGE_DIR%\使用说明.txt"

echo.
echo ========================================
echo   打包完成！
echo ========================================
echo.
echo 打包文件位置: %CD%\%PACKAGE_DIR%
echo.
echo 重要提示:
echo 1. 首次在目标电脑运行时，需要先执行: npm install
echo 2. 将 "%PACKAGE_DIR%" 文件夹复制到任何位置
echo 3. 双击 "启动项目.bat" 即可运行
echo 4. 详细说明请查看 "使用说明.txt"
echo.
pause


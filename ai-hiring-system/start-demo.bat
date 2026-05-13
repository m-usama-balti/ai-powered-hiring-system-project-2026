@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ============================================================
REM  AI Hiring System - One-Click Demo Launcher (Windows)
REM  Services:
REM   - Node Backend    : http://localhost:5000
REM   - React Frontend  : http://localhost:5173
REM   - FastAPI Service : http://localhost:8000
REM ============================================================

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%server"
set "FRONTEND_DIR=%ROOT_DIR%client"
set "AI_DIR=%ROOT_DIR%ai-service"

set "PORTS=5000 5173 8000"

echo.
echo [1/4] Running environment audit...

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm is not available in PATH. Install Node.js LTS and retry.
  goto :abort
)

if not exist "%BACKEND_DIR%\package.json" (
  echo [ERROR] Backend package.json not found at: %BACKEND_DIR%
  goto :abort
)

if not exist "%FRONTEND_DIR%\package.json" (
  echo [ERROR] Frontend package.json not found at: %FRONTEND_DIR%
  goto :abort
)

if not exist "%AI_DIR%\main.py" (
  echo [ERROR] AI service main.py not found at: %AI_DIR%
  goto :abort
)

if not exist "%BACKEND_DIR%\node_modules" (
  echo [INFO] Backend dependencies missing. Installing...
  pushd "%BACKEND_DIR%"
  call npm install
  if errorlevel 1 (
    popd
    echo [ERROR] Backend npm install failed.
    goto :abort
  )
  popd
)

if not exist "%FRONTEND_DIR%\node_modules" (
  echo [INFO] Frontend dependencies missing. Installing...
  pushd "%FRONTEND_DIR%"
  call npm install
  if errorlevel 1 (
    popd
    echo [ERROR] Frontend npm install failed.
    goto :abort
  )
  popd
)

if not exist "%AI_DIR%\venv\Scripts\activate.bat" (
  echo [ERROR] Python venv activate script not found at: %AI_DIR%\venv\Scripts\activate.bat
  echo [HINT] Create it once with: python -m venv ai-service\venv
  goto :abort
)

if exist "%AI_DIR%\requirements.txt" (
  echo [INFO] Verifying AI Python dependencies...
  pushd "%AI_DIR%"
  call "%AI_DIR%\venv\Scripts\python.exe" -m pip install -r requirements.txt >nul
  if errorlevel 1 (
    popd
    echo [ERROR] Python dependency install failed for AI service.
    goto :abort
  )
  popd
)

echo.
echo [2/4] Releasing required ports (5000, 5173, 8000)...
for %%P in (%PORTS%) do call :kill_port %%P

echo.
echo [3/4] Launching services in separate windows...

start "AI-Hiring Backend :5000" cmd /k "cd /d "%BACKEND_DIR%" && npm run dev"
start "AI-Hiring AI Service :8000" cmd /k "cd /d "%AI_DIR%" && call venv\Scripts\activate.bat && uvicorn main:app --reload --port 8000"
start "AI-Hiring Frontend :5173" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

echo.
echo [4/4] Startup commands sent.
echo Open these URLs after services are ready:
echo   - Frontend : http://localhost:5173
echo   - Backend  : http://localhost:5000
echo   - AI API   : http://localhost:8000/docs
echo.
echo Demo launcher completed.
goto :eof

:kill_port
set "TARGET_PORT=%~1"
set "FOUND_PID=0"
for /f "tokens=5" %%A in ('netstat -ano ^| findstr /R /C:":%TARGET_PORT% .*LISTENING"') do (
  set "FOUND_PID=1"
  echo [INFO] Port %TARGET_PORT% in use by PID %%A. Stopping process...
  taskkill /PID %%A /F >nul 2>&1
)
if "%FOUND_PID%"=="0" (
  echo [OK] Port %TARGET_PORT% is free.
) else (
  echo [OK] Port %TARGET_PORT% cleared.
)
goto :eof

:abort
echo.
echo Startup aborted due to failed pre-flight checks.
exit /b 1

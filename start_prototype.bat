@echo off
title CYCLONESHIELD AI - Prototype Launcher
color 0B
echo ======================================================================
echo                 CYCLONESHIELD AI - PROTOTYPE LAUNCHER
echo          From Cyclone Track to Infrastructure Action
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python virtual environment...
if not exist ".venv\Scripts\python.exe" (
    echo Virtual environment not found. Please run setup first.
    pause
    exit /b 1
)

echo [2/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "CycloneShield Backend (FastAPI)" cmd /k ".\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"

echo [3/3] Starting Vite Frontend on http://127.0.0.1:5173 ...
cd frontend
start "CycloneShield Frontend (Vite)" cmd /k "npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo ======================================================================
echo CycloneShield AI is launching!
echo Backend API:  http://127.0.0.1:8000/docs
echo Frontend App: http://127.0.0.1:5173
echo ======================================================================
echo.
timeout /t 3 >nul
start http://localhost:5173
exit /b 0

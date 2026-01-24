@echo off
echo Starting Code Review AI Application...
echo.

echo Installing dependencies...
cd /d "C:\code-review-ai\backend"
call npm install
if %errorlevel% neq 0 (
    echo Backend dependency installation failed!
    pause
    exit /b 1
)

cd /d "C:\code-review-ai\frontend"
call npm install
if %errorlevel% neq 0 (
    echo Frontend dependency installation failed!
    pause
    exit /b 1
)

echo.
echo Starting servers...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.

start "Backend Server" cmd /k "cd /d C:\code-review-ai\backend && npm start"
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "cd /d C:\code-review-ai\frontend && npm start"

echo.
echo Both servers are starting...
echo Wait for both servers to be ready, then visit http://localhost:3000
echo.
pause
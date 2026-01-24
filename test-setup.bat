@echo off
echo Testing GitHub OAuth Configuration...
echo.

echo Checking if GitHub OAuth app is properly configured...
echo.
echo Your current GitHub OAuth settings:
echo Client ID: Ov23litmu42ccp1bes0Z
echo.
echo IMPORTANT: Make sure your GitHub OAuth app has these settings:
echo - Homepage URL: http://localhost:3000
echo - Authorization callback URL: http://localhost:3000/auth/callback
echo.
echo To verify/update your GitHub OAuth app:
echo 1. Go to: https://github.com/settings/developers
echo 2. Find your "Code Review AI" app (or create new one)
echo 3. Update the callback URL to: http://localhost:3000/auth/callback
echo.

echo Testing backend server...
cd /d "C:\code-review-ai\backend"
node -e "console.log('Node.js is working'); process.exit(0)"
if %errorlevel% neq 0 (
    echo Node.js test failed!
    pause
    exit /b 1
)

echo Testing frontend...
cd /d "C:\code-review-ai\frontend"
node -e "console.log('Frontend Node.js is working'); process.exit(0)"
if %errorlevel% neq 0 (
    echo Frontend Node.js test failed!
    pause
    exit /b 1
)

echo.
echo All tests passed! You can now run start.bat to launch the application.
echo.
pause
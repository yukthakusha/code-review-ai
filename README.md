# Code Review AI

AI-powered code review tool that analyzes GitHub repositories for bugs, security issues, and performance problems.

## Quick Start

1. **Run the test script first:**
   ```
   test-setup.bat
   ```

2. **Start the application:**
   ```
   start.bat
   ```

3. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## GitHub OAuth Setup

Your GitHub OAuth app needs these settings:
- **Homepage URL**: `http://localhost:3000`
- **Authorization callback URL**: `http://localhost:3000/auth/callback`

To update your GitHub OAuth app:
1. Go to https://github.com/settings/developers
2. Find your app or create a new one
3. Update the callback URL

## Features

- ✅ GitHub OAuth authentication
- ✅ Repository selection and analysis
- ✅ Code issue detection (bugs, security, performance)
- ✅ Analysis history tracking
- ✅ Multi-user support
- ✅ Works without authentication (demo mode)

## Usage

1. **Connect GitHub** (optional but recommended)
2. **Select a repository** from your GitHub account
3. **Click "Analyze Repository"**
4. **View results** with detailed issue descriptions and solutions
5. **Check history** for previous analyses

## Demo Mode

The app works without GitHub authentication and provides sample analysis results for demonstration purposes.

## Troubleshooting

- If GitHub connection fails, check your OAuth app settings
- If servers don't start, run `npm install` in both frontend and backend folders
- Make sure ports 3000 and 5000 are available
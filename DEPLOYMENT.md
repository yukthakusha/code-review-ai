# 🚀 Code Review AI - Deployment Guide

## Live Demo
- **Frontend**: [Your Vercel URL]
- **Backend**: [Your Railway URL]

## Quick Deploy

### 1. Deploy Backend (Railway - Recommended)
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this repository
5. Choose the `backend` folder
6. Add environment variables:
   ```
   GITHUB_CLIENT_ID=Ov23litmu42ccp1bes0Z
   GITHUB_CLIENT_SECRET=2a6db994c4c322e95915890712cf66fb59e3572b
   NODE_ENV=production
   PORT=5000
   ```
7. Deploy and copy the URL

### 2. Deploy Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set root directory to `frontend`
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-railway-url.railway.app/api
   ```
5. Deploy

### 3. Update GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Update your OAuth app:
   - Homepage URL: `https://your-vercel-url.vercel.app`
   - Callback URL: `https://your-vercel-url.vercel.app/auth/callback`

## Features
- ✅ AI-powered code analysis
- ✅ GitHub integration
- ✅ Multi-user support
- ✅ Free to use
- ✅ No registration required (demo mode)

## Tech Stack
- **Frontend**: React, TypeScript, Vercel
- **Backend**: Node.js, Express, Railway
- **Database**: SQLite
- **AI**: OpenAI, Google Gemini, Hugging Face
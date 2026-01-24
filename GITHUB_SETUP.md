# GitHub OAuth App Setup Instructions

## Step 1: Create GitHub OAuth App

1. Go to GitHub Settings: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Code Review AI
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:3000/auth/callback
   - **Application description**: AI-powered code review tool

## Step 2: Update Environment Variables

After creating the app, GitHub will provide:
- Client ID
- Client Secret

Update your `.env` file with these values.

## Step 3: Test the Setup

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Visit http://localhost:3000
4. Click "Connect GitHub" to test OAuth flow

## Current Configuration Status
- ✅ Backend server configured
- ✅ Frontend API service configured
- ⚠️  GitHub OAuth callback URL needs verification
- ⚠️  OAuth flow needs testing
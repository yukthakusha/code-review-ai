## GitHub OAuth Debug Steps

1. **Check your GitHub OAuth app settings:**
   - Go to: https://github.com/settings/developers
   - Find your "Code Review AI" app
   - Make sure these settings are EXACTLY:
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `http://localhost:3000/auth/callback`

2. **Test the OAuth flow:**
   - Open browser console (F12)
   - Click "Connect GitHub"
   - Check console for any errors
   - See what URL GitHub redirects to

3. **Manual test:**
   - Visit: http://localhost:5000/api/health
   - Should show: {"status":"OK","message":"Backend server is running"}

4. **If still not working, try this URL directly:**
   ```
   https://github.com/login/oauth/authorize?client_id=Ov23litmu42ccp1bes0Z&scope=repo
   ```

## Current Status:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ⚠️ GitHub OAuth callback URL needs verification
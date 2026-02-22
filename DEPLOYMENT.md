# Deployment Guide for VST MIS

This project requires a **Node.js backend** (Express server + Firebase), so it cannot be deployed to GitHub Pages (which only serves static files).

## Deployment Options

### Option 1: Render.com (Recommended - Free & Easy)

**Best for:** Quick deployment with free tier

1. **Create account** at [render.com](https://render.com)

2. **Create a new Web Service:**
   - Connect your GitHub repository
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node

3. **Add Environment Variables:**
   - `FIREBASE_SERVICE_ACCOUNT` = (paste entire JSON content from serviceAccountKey.json)
   - `JWT_SECRET` = (your secret key for JWT tokens)
   - `PORT` = (optional, Render sets this automatically)

4. **Deploy:** Click "Create Web Service"

5. **Your app will be live at:** `https://your-app-name.onrender.com`

**Note:** Free tier spins down after 15 min inactivity (first request may be slow)

---

### Option 2: Railway.app (Free Tier Available)

1. **Sign up** at [railway.app](https://railway.app)
2. **New Project** → Deploy from GitHub
3. **Select your repository**
4. **Add Environment Variables:**
   - `FIREBASE_SERVICE_ACCOUNT` = (JSON content)
   - `JWT_SECRET` = (your secret)
5. **Deploy** - Railway auto-detects Node.js

---

### Option 3: Vercel (Free - Best for Frontend + API Routes)

**Note:** Requires converting Express routes to Vercel serverless functions

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Create `vercel.json`:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Add environment variables** in Vercel dashboard:
   - `FIREBASE_SERVICE_ACCOUNT`
   - `JWT_SECRET`

---

### Option 4: Heroku (Paid after free tier ended)

1. **Install Heroku CLI**
2. **Login:** `heroku login`
3. **Create app:** `heroku create your-app-name`
4. **Set environment variables:**
   ```bash
   heroku config:set FIREBASE_SERVICE_ACCOUNT="$(cat serviceAccountKey.json)"
   heroku config:set JWT_SECRET="your-secret-key"
   ```
5. **Deploy:** `git push heroku main`

---

### Option 5: Firebase Hosting + Cloud Functions

**Best for:** If you're already using Firebase

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase:**
   ```bash
   firebase init hosting
   firebase init functions
   ```

3. **Convert server.js to Cloud Functions** (requires refactoring)

4. **Deploy:**
   ```bash
   firebase deploy
   ```

---

## Quick Deploy Steps (Render.com Example)

### Step 1: Prepare Your Code

1. **Make sure `.gitignore` includes:**
   ```
   serviceAccountKey.json
   node_modules/
   .env
   ```

2. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com) → Sign up/Login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select your repository (`MIS` or whatever it's named)
5. **Configure:**
   - **Name:** `vst-mis` (or your choice)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free (or paid if you want)

6. **Add Environment Variables:**
   - Click **"Environment"** tab
   - Add:
     - **Key:** `FIREBASE_SERVICE_ACCOUNT`
     - **Value:** (Copy entire content from `serviceAccountKey.json` - all JSON)
     - **Key:** `JWT_SECRET`
     - **Value:** (Your secret key, e.g., `vst-mis-secret-key-change-in-production`)

7. **Click "Create Web Service"**

8. **Wait for deployment** (5-10 minutes first time)

9. **Your app is live!** Visit the URL shown (e.g., `https://vst-mis.onrender.com`)

---

## Important Notes

### ⚠️ Security

- **Never commit `serviceAccountKey.json`** to Git
- Use environment variables instead (as shown above)
- The server code already supports `FIREBASE_SERVICE_ACCOUNT` env var

### 🔧 After Deployment

1. **Update `app.js`** - Change `API_BASE` if needed:
   ```javascript
   // For production, you might want:
   const API_BASE = window.location.origin; // Uses same domain
   ```

2. **Test the deployment:**
   - Visit your deployed URL
   - Try login/register
   - Test adding orders, dealers, etc.

3. **Custom Domain (Optional):**
   - In Render/Railway/Vercel dashboard, go to Settings → Custom Domain
   - Add your domain
   - Update DNS records as instructed

---

## Troubleshooting

- **"Cannot find module"** → Make sure all dependencies are in `package.json`
- **"Firebase credentials error"** → Check `FIREBASE_SERVICE_ACCOUNT` env var is set correctly
- **"Port already in use"** → Use `process.env.PORT` (already done in server.js)
- **CORS errors** → Make sure frontend URL matches backend URL

---

## Recommended: Render.com

**Why Render?**
- ✅ Free tier available
- ✅ Easy setup
- ✅ Auto-deploys from GitHub
- ✅ Supports Node.js/Express
- ✅ Environment variables support
- ✅ Custom domain support

**Get started:** [render.com](https://render.com)

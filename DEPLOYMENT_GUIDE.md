# 🚀 Critical AI - Deployment Guide

## Overview
This guide will help you deploy Critical AI to **Render.com** with a cloud MongoDB database.

---

## Prerequisites
1. A [Render.com](https://render.com) account (free tier)
2. A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier)
3. Git installed (to push code)

---

## Step 1: Create MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign up
2. Click **"Build a Database"**
3. Choose **FREE tier** (M0 Sandbox)
4. Select a region closest to you (e.g., Singapore)
5. Create a cluster name (e.g., "criticalai")
6. Under **Security Quickstart**:
   - Create a username and password
   - Click "Create User"
7. Under **Network Access**:
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
8. Wait for cluster to be created (1-2 minutes)
9. Click **"Connect"** on your cluster
10. Choose **"Connect your application"**
11. Copy the connection string:
    ```
    mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/criticalai
    ```
    ⚠️ Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your credentials

---

## Step 2: Prepare Code for Deployment

### 2.1 Update Backend .env file
Create/update `Backend/.env` with:
```env
GEMINI_KEY_1=your_gemini_key_1
GEMINI_KEY_2=your_gemini_key_2
GEMINI_KEY_3=your_gemini_key_3
GEMINI_KEY_4=your_gemini_key_4
GEMINI_KEY_5=your_gemini_key_5
GEMINI_KEY_6=your_gemini_key_6

MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/criticalai

JWT_SECRET=your_random_secret_key_here
```

### 2.2 Update Frontend API URLs
You need to update all frontend files to use your deployed backend URL. Replace `http://localhost:3000` with your Render URL.

**Files to update:**
- `Frontend/authFetch.js`
- `Frontend/Login.html`
- `Frontend/DefineIssue.html`
- `Frontend/Roles.html`
- `Frontend/Debate.html`
- `Frontend/Decision.html`
- `Frontend/SimulationScoring.html`
- `Frontend/History.html`
- `Frontend/Overview.html`

**How to update:**
```javascript
// Before (local development)
const API_BASE = "http://localhost:3000";

// After (production - will be auto-detected)
const API_BASE = ""; // Empty = same origin
```

Or if you want explicit URL, replace with:
```javascript
const API_BASE = "https://criticalai-backend.onrender.com"; // Replace with your actual URL
```

### 2.3 Create Build/Static Folder (Optional)
Since you're using static HTML files, you can serve them from the backend. Make sure `server.js` has:
```javascript
app.use(express.static("."));
```
This line is already in your `server.js` at line 30.

---

## Step 3: Deploy to Render.com

### 3.1 Push Code to GitHub
1. Create a GitHub repository
2. Initialize git in your project folder:
   ```bash
   cd d:\AI_CODE
   git init
   git add .
   git commit -m "Initial commit for Critical AI"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/criticalai.git
   git push -u origin main
   ```

### 3.2 Create Render Web Service
1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your `criticalai` repository
5. Configure the service:
   - **Name:** `criticalai-backend`
   - **Region:** Singapore (or closest to you)
   - **Branch:** `main`
   - **Root Directory:** Leave empty (or `Backend` if structure differs)
   - **Runtime:** Node
   - **Build Command:** `cd Backend && npm install`
   - **Start Command:** `cd Backend && npm start`
   
   ⚠️ **Important:** If your repository structure has Backend in root, use:
   - **Root Directory:** (leave empty)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

6. Click **"Create Web Service"**

### 3.3 Add Environment Variables
Before deploying, add these environment variables in Render:

1. In your Web Service dashboard, go to **"Environment"** tab
2. Add each variable:

| Key | Value |
|-----|-------|
| `GEMINI_KEY_1` | Your Gemini API key 1 |
| `GEMINI_KEY_2` | Your Gemini API key 2 |
| `GEMINI_KEY_3` | Your Gemini API key 3 |
| `GEMINI_KEY_4` | Your Gemini API key 4 |
| `GEMINI_KEY_5` | Your Gemini API key 5 |
| `GEMINI_KEY_6` | Your Gemini API key 6 |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Any random secure string |
| `NODE_ENV` | `production` |

### 3.4 Deploy
1. Click **"Create Web Service"** (or **"Manual Deploy"** → **"Deploy latest"**)
2. Watch the logs for deployment progress
3. Wait 2-5 minutes for first deployment

---

## Step 4: Verify Deployment

### 4.1 Check if Server is Running
Visit: `https://criticalai-backend.onrender.com/api/protected`

You should see a 401 error (no token) - this means the server is running!

### 4.2 Test Registration/Login
1. Open your frontend URL (same as backend URL)
2. Try to register a new account
3. Try to log in

---

## Step 5: Troubleshooting

### Common Issues:

**1. "Cannot find module" errors**
- Check your `Build Command` and `Start Command` paths
- Make sure `package.json` has `"main": "server.js"`

**2. MongoDB connection errors**
- Verify your MongoDB Atlas username/password in MONGO_URI
- Make sure Network Access allows 0.0.0.0/0
- Check if cluster is not paused (free tier pauses after 1 hour of inactivity)

**3. CORS errors**
- Make sure Render URL is allowed in CORS configuration
- Default allows all origins with `app.use(cors())`

**4. Static files not loading**
- Make sure `app.use(express.static("."))` points to correct directory
- Check if index.html exists in the served folder

---

## Step 6: Custom Domain (Optional)

1. In Render dashboard → Your Web Service → **Settings**
2. Scroll to **"Custom Domains"**
3. Add your domain (e.g., `criticalai.com`)
4. Follow DNS configuration instructions

---

## Cost Summary

| Service | Cost |
|---------|------|
| Render Web Service | **FREE** (250 hours/month, spins down after 15 min inactivity) |
| MongoDB Atlas | **FREE** (512MB storage, M0 cluster) |
| Gemini API | **FREE** (15 requests/min, 1500 requests/day on free tier) |

**Total: FREE** (for moderate personal use)

---

## Important Notes

1. **Render Free Tier:** Your service will "sleep" after 15 minutes of inactivity and wake up on first request (cold start ~30 seconds)

2. **MongoDB Atlas:** Free tier pauses after 1 hour of inactivity. First request may take a moment.

3. **API Keys Security:** Never commit `.env` files to GitHub. Render uses environment variables instead.

4. **Data Persistence:** All user data and debates will persist in MongoDB Atlas.

---

## Quick Reference

**Render Dashboard:** https://dashboard.render.com

**MongoDB Atlas:** https://www.mongodb.com/atlas

**Your deployed URL:** `https://criticalai-backend.onrender.com` (or your custom domain)

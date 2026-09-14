# Deploying PrepMatrix AI to the Cloud

PrepMatrix AI is designed as a unified full-stack web application. It supports **Vercel** (Serverless + Edge CDN), **Render**, **Railway**, and **Docker** out of the box.

---

## ⚡ Method 1: Vercel (Fastest & Free)

PrepMatrix AI includes `vercel.json` and a serverless entry point (`api/index.ts`).

1. **Push your code to GitHub**:
   In your terminal inside `C:\Users\jaska\.gemini\antigravity\scratch\prepmatrix-ai`:
   ```bash
   git init
   git add .
   git commit -m "PrepMatrix AI with Vercel support"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/prepmatrix-ai.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in with GitHub.
   - Click **Add New...** ➔ **Project**.
   - Import your `prepmatrix-ai` repository.
   - Vercel automatically detects **Vite** as the Framework Preset!
   - (Optional) In **Environment Variables**, add `GEMINI_API_KEY` if you want a global default key, or leave it blank (users can enter their key directly in the web UI).
   - Click **Deploy**!

3. **Done!**
   Vercel will give you a live production URL like `https://prepmatrix-ai.vercel.app`.

---

## 🚀 Method 2: Render.com (Full-Stack Node Web Service)

1. Go to [render.com](https://render.com) and click **New +** ➔ **Web Service**.
2. Connect your GitHub repository.
3. Settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Click **Deploy Web Service** to get `https://prepmatrix-ai.onrender.com`.

---

## 🚆 Method 3: Railway.app (One-Click Auto Deploy)

1. Go to [railway.app](https://railway.app).
2. Click **New Project** ➔ **Deploy from GitHub repo**.
3. Select your repository. Railway deploys it automatically!

---

## 🐳 Method 4: Docker Container (Self-Host or Cloud Run)

```bash
docker build -t prepmatrix-ai .
docker run -p 3001:3001 -e PORT=3001 prepmatrix-ai
```

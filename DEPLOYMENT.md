# MellowCode Deployment Guide 🚀 (100% FREE Tier Options)

This guide provides step-by-step instructions to deploy **MellowCode** for **FREE** without requiring paid Render Blueprints or paid plans.

---

## ⚡ Option 1: Vercel (Frontend) + Render (Backend) — Recommended (100% Free)

This is the fastest combination with free SSL, fast CDN response, and zero subscription costs.

### Step 1: Deploy Backend on Render (Free Tier)

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Fill in the configuration:
   - **Name**: `mellowcode-backend`
   - **Language**: `Python 3`
   - **Build Command**: `pip install --no-cache-dir uv && uv pip install --system -r pyproject.toml`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: **Free**
5. Under **Environment Variables**, click **Add Environment Variable**:
   - `GROQ_API_KEY` = `your_actual_groq_api_key`
6. Click **Create Web Service**.
7. Once deployed, copy your backend public URL (e.g. `https://mellowcode-backend.onrender.com`).

---

### Step 2: Deploy Frontend on Vercel (Free Tier)

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New Project** and import your GitHub repo.
3. Configure Project Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Other` (or Nitro / Vite)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.output`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL` = `https://mellowcode-backend.onrender.com` *(Replace with your Render backend URL)*
5. Click **Deploy**.

---

## 🐢 Option 2: Render Only (Manual Web Services - 100% Free)

Instead of using paid Blueprints, you can create two separate **Free Web Services** on Render manually:

### Backend Service:
1. Click **New +** → **Web Service** → Select Repo.
2. Name: `mellowcode-backend`
3. Runtime: `Python 3`
4. Build Command: `pip install --no-cache-dir uv && uv pip install --system -r pyproject.toml`
5. Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
6. Instance Type: **Free**
7. Env Variable: `GROQ_API_KEY` = `your_groq_key`
8. Copy the backend URL (e.g. `https://mellowcode-backend.onrender.com`).

### Frontend Service:
1. Click **New +** → **Web Service** → Select Repo.
2. Name: `mellowcode-frontend`
3. Root Directory: `frontend`
4. Runtime: `Node`
5. Build Command: `npm install && npm run build`
6. Start Command: `npm run start`
7. Instance Type: **Free**
8. Env Variable: `VITE_API_URL` = `https://mellowcode-backend.onrender.com`

---

## 🔒 Environment Variables Summary

| Variable Name | Service | Where to Get / Value |
|---|---|---|
| `GROQ_API_KEY` | Backend (Render) | Your API Key from [Groq Console](https://console.groq.com) |
| `VITE_API_URL` | Frontend (Vercel / Render) | Your live backend service URL |

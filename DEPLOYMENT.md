# MellowCode Deployment Guide 🚀

This document outlines step-by-step instructions for deploying **MellowCode** (FastAPI backend + TanStack Start frontend) to **Render**, **Vercel**, and **Railway**.

---

## 🔍 Why Frontend Was Not Loading (Root Cause & Fix)

This application uses **TanStack Start**, a fullstack React Server-Side Rendering (SSR) framework. 
- Running `vite build` alone only compiles raw SSR assets into `dist/` without generating a production web server.
- The build script has been updated to `"build": "vite build && nitro build"` which produces the executable `.output` directory.
- For **Vercel**, Nitro generates Vercel Serverless Functions (`.output`).
- For **Render / Node.js**, `npm run start` runs `node .output/server/index.mjs`.

---

## Option 1: 1-Click Deployment on Render (Blueprint - Recommended)

Render supports **Blueprints** using `render.yaml`, which automatically sets up both Backend and Frontend web services.

1. Push your repository to **GitHub**.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint**.
4. Connect your `MellowCode` repository.
5. Render will automatically detect `render.yaml` and create two services:
   - `mellowcode-backend` (Python FastAPI)
   - `mellowcode-frontend` (Node SSR Frontend)
6. Under `mellowcode-backend` environment variables, set:
   - `GROQ_API_KEY`: Your actual Groq API key from [Groq Console](https://console.groq.com).
7. Click **Apply**. Render will build and deploy both services!

---

## Option 2: Deploy Frontend on Vercel + Backend on Render / Railway

### Step 1: Deploy Backend (Render or Railway)

#### On Render:
1. Click **New +** → **Web Service**.
2. Connect your repo.
3. Configure settings:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install --no-cache-dir uv && uv pip install --system -r pyproject.toml`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variable:
   - `GROQ_API_KEY` = `your_groq_api_key`
5. Click **Create Web Service**.
6. Copy your backend URL (e.g. `https://mellowcode-backend.onrender.com`).

---

### Step 2: Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New Project** and import your repo.
3. Configure Project Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Other` (or Nitro / Vite)
   - **Build Command**: `npm run build` *(runs `vite build && nitro build`)*
   - **Output Directory**: `.output`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL` = `https://mellowcode-backend.onrender.com` *(Replace with your actual backend URL from Step 1)*
5. Click **Deploy**.

---

## 🔒 Environment Variables Reference

| Variable | Target Service | Purpose | Example |
|---|---|---|---|
| `GROQ_API_KEY` | Backend | Required for AI generation | `gsk_...` |
| `VITE_API_URL` | Frontend | Connects frontend to backend | `https://mellowcode-backend.onrender.com` |

---

## 🛠️ Local Build & Testing Commands

To test the production build locally before deploying:

```bash
# Frontend
cd frontend
npm install
npm run build
npm run start # Runs server on http://localhost:3000

# Backend
pip install uv
uv pip install --system -r pyproject.toml
uvicorn server:app --host 0.0.0.0 --port 8000
```

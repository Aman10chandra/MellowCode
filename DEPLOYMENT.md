# MellowCode Deployment Guide 🚀 (Render + Vercel)

This document provides step-by-step instructions for deploying **MellowCode** with the **Python Backend on Render** and the **Vite Frontend on Vercel**.

---

## 🛠️ Repository Architecture Overview

```
MellowCode/
├── backend/     # FastAPI Python server + LangChain/Groq AI agent
└── frontend/    # React + Vite application
```

---

## 🐍 Part 1: Deploy Backend to Render

1. **Sign in to Render**: Go to [Render.com](https://render.com) and log in with your GitHub account.
2. **Create New Web Service**:
   - Click **New +** → **Web Service**.
   - Connect your GitHub repository `MellowCode`.
3. **Configure Service Details**:
   - **Name**: `mellowcode-backend` (or any custom name)
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Region**: Choose the region closest to you (e.g., Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn server:app --host 0.0.0.0 --port $PORT`
4. **Set Environment Variables**:
   In the **Environment Variables** section, click **Add Environment Variable**:
   - `GROQ_API_KEY`: `your_actual_groq_api_key` *(Get your key from [Groq Console](https://console.groq.com))*
   - `PYTHON_VERSION`: `3.11.0`
5. **Deploy Service**:
   - Click **Create Web Service**.
   - Render will build and deploy your backend.
   - Once deployed, copy your public backend URL from the top of the Render dashboard (e.g., `https://mellowcode-backend.onrender.com`).

---

## ⚡ Part 2: Deploy Frontend to Vercel

> ⚠️ **IMPORTANT**: In Vite applications, `VITE_API_URL` must be set in Vercel **BEFORE** building so Vite can bake the API URL into the compiled static JavaScript bundle.

1. **Sign in to Vercel**: Go to [Vercel.com](https://vercel.com) and sign in with your GitHub account.
2. **Add New Project**:
   - Click **Add New...** → **Project**.
   - Select and import your `MellowCode` repository.
3. **Configure Project Settings**:
   - **Framework Preset**: `Vite` (or `Other`)
   - **Root Directory**: Click **Edit** and set to `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Set Environment Variables**:
   - Expand the **Environment Variables** section.
   - Key: `VITE_API_URL`
   - Value: `https://mellowcode-backend.onrender.com` *(Replace with your actual Render URL from Part 1)*
5. **Deploy**:
   - Click **Deploy**.
   - Vercel will build the frontend and deploy it to a public URL (e.g., `https://mellowcode.vercel.app`).

---

## 🔍 Troubleshooting & Local Development

### 1. "Could not connect to backend" Error
- **Cause**: The `VITE_API_URL` environment variable was missing or set incorrectly during Vercel's build process.
- **Solution**:
  1. Open your project on Vercel → **Settings** → **Environment Variables**.
  2. Ensure `VITE_API_URL` is set to your live Render backend URL (e.g. `https://mellowcode-backend.onrender.com`).
  3. Go to the **Deployments** tab, click the three dots `...` on the latest deployment, and select **Redeploy**.

### 2. Testing Locally
To run both backend and frontend locally on your machine:
```bash
# Terminal 1: Start Backend
cd backend
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Start Frontend
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser. The Vite dev server will automatically proxy requests to `http://localhost:8000`.

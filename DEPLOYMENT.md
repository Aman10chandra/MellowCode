# MellowCode Deployment Guide 🚀 (Railway + Vercel)

This document provides step-by-step instructions for deploying **MellowCode** with the backend on **Railway** and the frontend on **Vercel**.

---

## 🚀 Step 1: Deploy Backend on Railway

1. Sign in to [Railway.app](https://railway.app) with your GitHub account.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your `MellowCode` repository.
4. Click **Add Variables** (or open the **Variables** tab) and add:
   ```env
   GROQ_API_KEY=your_actual_groq_api_key
   ```
5. Railway will automatically detect the backend (`Procfile` or `Dockerfile`) and build the project.
6. Under your service's **Settings** → **Networking** (or **Public Networking**), click **Generate Domain**.
7. Copy your generated backend URL (e.g. `https://mellowcode-backend.up.railway.app`).

---

## ⚡ Step 2: Deploy Frontend on Vercel

1. Sign in to [Vercel.com](https://vercel.com) with your GitHub account.
2. Click **Add New Project** and import your `MellowCode` repo.
3. Configure project settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Other` (or Nitro / Vite)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.output`
4. Expand **Environment Variables** and add:
   ```env
   VITE_API_URL=https://mellowcode-backend.up.railway.app
   ```
   *(Replace with your actual Railway backend URL from Step 1)*
5. Click **Deploy**.

---

## 🔒 Required Environment Variables

| Service | Environment Variable | Value / Description |
|---|---|---|
| **Railway (Backend)** | `GROQ_API_KEY` | API Key from [Groq Console](https://console.groq.com) |
| **Vercel (Frontend)** | `VITE_API_URL` | Public Railway Backend URL |

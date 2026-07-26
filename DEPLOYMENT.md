# MellowCode Deployment Guide 🚀

This document outlines step-by-step instructions for deploying **MellowCode** to production environments.

MellowCode consists of two components:
1. **Python FastAPI Backend** (`server.py` & `agent/`) — Requires a Python 3.11 runtime.
2. **TanStack Start React Frontend** (`frontend/`) — Can be deployed to Node.js/Vite hosting environments.

---

## Strategy 1: Split Deployment (Railway + Vercel) — Recommended

This strategy gives you optimal performance and free SSL certificates.

### Step 1: Deploy Backend on Railway

1. Sign in to [Railway.app](https://railway.app) with your GitHub account.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select the `MellowCode` repository.
4. Go to the **Variables** tab in Railway and add:
   ```env
   GROQ_API_KEY=your_actual_groq_api_key
   ```
5. Railway auto-detects the `Procfile` (`web: uvicorn server:app --host 0.0.0.0 --port $PORT`).
6. Under **Settings** → **Networking**, click **Generate Domain**.
7. Copy your generated backend URL (e.g. `https://mellowcode-api.up.railway.app`).

---

### Step 2: Deploy Frontend on Vercel

1. Sign in to [Vercel.com](https://vercel.com) with your GitHub account.
2. Click **Add New** → **Project** and import the `MellowCode` repo.
3. Configure the project settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.output`
4. Expand **Environment Variables** and add:
   ```env
   VITE_API_URL=https://mellowcode-api.up.railway.app
   ```
   *(Replace with your actual Railway backend URL from Step 1)*
5. Click **Deploy**.

---

## Strategy 2: Single-Container Docker Deployment

You can deploy the entire application inside a single Docker container using the provided multi-stage `Dockerfile`.

### Supported Platforms:
- **Railway** (New Service → GitHub Repo → Select Dockerfile)
- **Render.com** (Web Service → Environment: Docker)
- **Fly.io** (`fly launch`)
- **AWS ECS / DigitalOcean App Platform**

### Docker Command for Manual Host Deployment:

```bash
# Build Docker image
docker build -t mellowcode:latest .

# Run container with Groq API key
docker run -d -p 8000:8000 \
  -e GROQ_API_KEY="your_groq_api_key_here" \
  --name mellowcode \
  mellowcode:latest
```

Access your app at `http://localhost:8000`.

---

## 🔒 Environment Variables Summary

| Variable Name | Required | Description | Where to Set |
|---|---|---|---|
| `GROQ_API_KEY` | **Yes** | Your API key from Groq Console | Backend (Railway / Docker) |
| `VITE_API_URL` | **Yes** | Public backend server URL | Frontend (Vercel) |

---

## 💾 Persistent Storage Note for Generated Projects

By default, generated web projects are stored on the server disk inside `./generated_project`.

If deploying to cloud platforms with ephemeral filesystems (like Railway or Render), add a **Persistent Volume**:
- **Railway**: Click **+ New** → **Volume** → Mount to `/app/generated_project`.
- This ensures generated web apps persist across server restarts and redeployments.

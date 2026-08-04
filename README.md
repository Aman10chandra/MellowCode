# MellowCode 🌿

> **Build web applications by chatting.** MellowCode turns your ideas into working, interactive web apps powered by a multi-agent AI pipeline.

![MellowCode UI](resources/mellow_code_diagram.png)

---

## 🚀 Features

- **💬 Chat-Driven App Creation**: Describe what you want to build in plain text, and MellowCode builds the app live.
- **🤖 Multi-Agent Architecture**:
  - **Planner Agent**: Analyzes your request and outlines a complete project plan.
  - **Architect Agent**: Breaks down the plan into modular implementation tasks.
  - **Coder Agent**: Generates production-ready HTML, CSS, and JavaScript.
- **⚡ Real-Time Streaming**: Live execution status updates via Server-Sent Events (SSE).
- **🎨 Lovable-Style Workspace**:
  - **Dark Chat Sidebar**: Interactive conversation timeline with status indicators and follow-up prompts.
  - **Live Preview**: Embedded sandbox `<iframe>` rendering your app instantly.
  - **Code Explorer**: File tree + syntax-highlighted code viewer with one-click copying.
- **🔥 Ultra-Fast Generation**: Powered by Groq's high-speed Llama-3.3-70B model.

---

## 🛠️ Tech Stack

### Backend
- **Python 3.11**
- **FastAPI** — High-performance Async Web Framework & SSE streaming
- **LangGraph & LangChain** — Multi-agent workflow orchestration
- **Groq API** (`llama-3.3-70b-versatile`) — High-speed LLM inference
- **Pydantic v2** — Data validation & structured outputs
- **Uvicorn** — ASGI Server

### Frontend
- **TanStack Start & React 19** — Full-stack SSR framework
- **Vite 8** — Next-gen frontend tooling & dev proxy
- **Tailwind CSS v4** — Modern utility-first styling
- **Lucide React** — Crisp icon system

---

## 📦 Project Structure

```
MellowCode/
├── backend/                # Python FastAPI Backend
│   ├── agent/              # LangGraph Multi-Agent Pipeline
│   │   ├── graph.py        # Graph definition (Planner → Architect → Coder)
│   │   ├── prompts.py      # System & user prompts for agents
│   │   ├── states.py       # Pydantic state models & validators
│   │   └── tools.py        # File system tools (read/write/list)
│   ├── server.py           # FastAPI server & SSE streaming API
│   ├── main.py             # CLI entry point
│   ├── requirements.txt    # Python dependencies
│   ├── render.yaml         # Render deployment configuration
│   └── Dockerfile          # Backend Docker image config
├── frontend/               # React + Vite Frontend
│   ├── src/
│   │   ├── lib/api.ts      # API client & backend resolution
│   │   ├── routes/         # React application routes
│   │   └── components/     # UI components
│   ├── vercel.json         # Vercel SPA routing rewrite rules
│   └── vite.config.ts      # Vite configuration & dev proxy
├── DEPLOYMENT.md           # Step-by-step Render + Vercel deployment guide
└── README.md
```

---

## 🏁 Getting Started Locally

### Prerequisites
- **Python 3.11+**
- **Node.js 20+**
- **Groq API Key** (Get one at [console.groq.com](https://console.groq.com))

---

### 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create environment file and add your Groq API Key
echo "GROQ_API_KEY=your_groq_api_key_here" > .env

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (runs on http://localhost:8000)
python -m uvicorn server:app --reload --port 8000
```

---

### 2. Frontend Setup

In a new terminal window:

```bash
# Navigate to frontend folder
cd frontend

# Install Node dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## 🌐 Deploying to Production

For full step-by-step instructions on deploying the **Backend to Render** and the **Frontend to Vercel**, see [DEPLOYMENT.md](file:///Users/aman/Desktop/MellowCode/DEPLOYMENT.md).

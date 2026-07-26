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
├── agent/                  # LangGraph Multi-Agent Pipeline
│   ├── graph.py            # Graph definition (Planner → Architect → Coder)
│   ├── prompts.py          # System & user prompts for agents
│   ├── states.py           # Pydantic state models & validators
│   └── tools.py            # File system tools (read/write/list)
├── server.py               # FastAPI backend & SSE streaming API
├── pyproject.toml          # Python dependencies (managed via uv)
├── Dockerfile              # Multi-stage production container build
├── Procfile                # Process file for Railway / Heroku deployment
└── frontend/               # TanStack Start / React Application
    ├── src/
    │   ├── lib/api.ts      # API client for backend communication
    │   ├── routes/
    │   │   ├── index.tsx   # Minimalist landing page
    │   │   └── workspace.tsx # Lovable-style workspace (Preview & Code tabs)
    │   └── routeTree.gen.ts
    └── vite.config.ts      # Vite configuration with API proxy
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
# Clone the repository
git clone https://github.com/Aman10chandra/MellowCode.git
cd MellowCode

# Create environment file and add your Groq API Key
echo "GROQ_API_KEY=your_groq_api_key_here" > .env

# Install dependencies using uv (or pip)
pip install uv
uv sync

# Start FastAPI server (runs on http://localhost:8000)
uv run uvicorn server:app --reload --port 8000
```

---

### 2. Frontend Setup

In a new terminal window:

```bash
cd MellowCode/frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5177)
npm run dev
```

Open **`http://localhost:5177`** in your browser and start building!

---

## 🔌 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Server health check |
| `/api/generate` | `POST` | Streams agent execution steps via SSE |
| `/api/files` | `GET` | Returns list of generated project files |
| `/api/file?path={path}` | `GET` | Returns content of a specific generated file |
| `/api/preview/{path}` | `GET` | Serves static generated files for live iframe preview |

---

## 📄 Deployment

For complete instructions on deploying MellowCode to **Railway**, **Vercel**, or **Docker**, check out the [DEPLOYMENT.md](DEPLOYMENT.md) guide.

---

## 📝 License

MIT License. Built with ❤️ by [Aman Chandra](https://github.com/Aman10chandra).

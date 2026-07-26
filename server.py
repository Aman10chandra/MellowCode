import asyncio
import json
import os
import pathlib
import mimetypes
from typing import AsyncGenerator
from fastapi import FastAPI, HTTPException, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel

from agent.graph import agent
from agent.tools import PROJECT_ROOT, init_project_root

app = FastAPI(title="MellowCode API Server", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    user_prompt: str
    recursion_limit: int = 100

@app.on_event("startup")
def startup_event():
    init_project_root()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "MellowCode API"}

@app.get("/api/files")
def list_generated_files():
    """Returns a hierarchical structure of generated project files."""
    init_project_root()
    if not PROJECT_ROOT.exists():
        return {"files": []}

    files = []
    for file_path in PROJECT_ROOT.glob("**/*"):
        if file_path.is_file():
            rel = file_path.relative_to(PROJECT_ROOT).as_posix()
            files.append({
                "path": rel,
                "name": file_path.name,
                "size": file_path.stat().st_size,
                "extension": file_path.suffix.lstrip(".")
            })
    return {"files": files}

@app.get("/api/file")
def get_file_content(path: str = Query(..., description="Relative file path")):
    """Returns the code text content of a specific generated file."""
    p = (PROJECT_ROOT / path).resolve()
    if PROJECT_ROOT.resolve() not in p.parents and PROJECT_ROOT.resolve() != p:
        raise HTTPException(status_code=400, detail="Invalid path")
    if not p.exists() or not p.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    try:
        content = p.read_text(encoding="utf-8")
        return {"path": path, "content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/preview/{path:path}")
def preview_file(path: str = "index.html"):
    """Serves static generated project files for live iframe preview."""
    p = (PROJECT_ROOT / path).resolve()
    if PROJECT_ROOT.resolve() not in p.parents and PROJECT_ROOT.resolve() != p and PROJECT_ROOT.resolve() != p.parent:
        raise HTTPException(status_code=400, detail="Invalid path")
    
    if p.is_dir():
        p = p / "index.html"
        
    if not p.exists() or not p.is_file():
        p = PROJECT_ROOT / "index.html"
        if not p.exists():
            return Response(content="<html><body style='background:#0d1117;color:#8b949e;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;'><div style='text-align:center;'><h2>No Preview Available</h2><p>Submit a prompt to generate a project!</p></div></body></html>", media_type="text/html")

    media_type, _ = mimetypes.guess_type(str(p))
    if not media_type:
        if p.name.endswith(".js"):
            media_type = "application/javascript"
        elif p.name.endswith(".css"):
            media_type = "text/css"
        elif p.name.endswith(".html"):
            media_type = "text/html"
        else:
            media_type = "text/plain"

    content = p.read_bytes()
    return Response(content=content, media_type=media_type)

async def stream_agent_execution(prompt: str, recursion_limit: int) -> AsyncGenerator[str, None]:
    """Streams live multi-agent execution steps (Planner -> Architect -> Coder)."""
    try:
        yield f"data: {json.dumps({'type': 'STATUS', 'step': 'planner', 'message': 'Planner Agent analyzing requirements...'})}\n\n"
        await asyncio.sleep(0.3)

        loop = asyncio.get_event_loop()
        state_input = {"user_prompt": prompt}
        config = {"recursion_limit": recursion_limit}

        result = await loop.run_in_executor(None, lambda: agent.invoke(state_input, config))

        plan = result.get("plan")
        task_plan = result.get("task_plan")
        coder_state = result.get("coder_state")

        if plan:
            plan_dict = plan.model_dump() if hasattr(plan, 'model_dump') else dict(plan)
            yield f"data: {json.dumps({'type': 'PLAN_CREATED', 'plan': plan_dict})}\n\n"
            await asyncio.sleep(0.3)

        if task_plan:
            task_dict = task_plan.model_dump() if hasattr(task_plan, 'model_dump') else dict(task_plan)
            yield f"data: {json.dumps({'type': 'TASKS_CREATED', 'task_plan': task_dict})}\n\n"
            await asyncio.sleep(0.3)

        yield f"data: {json.dumps({'type': 'COMPLETE', 'status': 'DONE', 'message': 'Project generated successfully!'})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'type': 'ERROR', 'error': str(e)})}\n\n"

@app.post("/api/generate")
async def generate_project(req: GenerateRequest):
    return StreamingResponse(
        stream_agent_execution(req.user_prompt, req.recursion_limit),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)

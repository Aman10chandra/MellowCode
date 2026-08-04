export function getApiBase(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("MELLOW_API_URL");
    if (stored && stored.trim() !== "") {
      return stored.trim().replace(/\/+$/, "");
    }
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:8000";
    }
  }
  return "";
}

export function setCustomApiBase(url: string): void {
  if (typeof window !== "undefined") {
    if (url.trim() === "") {
      window.localStorage.removeItem("MELLOW_API_URL");
    } else {
      window.localStorage.setItem("MELLOW_API_URL", url.trim().replace(/\/+$/, ""));
    }
  }
}

function handleResponseError(status: number, text: string): never {
  const currentBase = getApiBase();
  const attemptedUrl = currentBase ? `${currentBase}/api/...` : "relative path /api/...";
  
  if (text.includes("<!DOCTYPE html>") || text.includes("<html") || status === 404) {
    throw new Error(
      `Backend URL not connected (404 at ${attemptedUrl}). Ensure VITE_API_URL is set on Vercel to your RAILWAY BACKEND URL (e.g. https://your-backend.up.railway.app) and click REDEPLOY.`
    );
  }
  throw new Error(`Server error ${status}: ${text}`);
}

export type AgentEvent =
  | { type: "STATUS"; step: string; message: string }
  | { type: "PLAN_CREATED"; plan: Record<string, unknown> }
  | { type: "TASKS_CREATED"; task_plan: Record<string, unknown> }
  | { type: "COMPLETE"; status: string; message: string }
  | { type: "ERROR"; error: string };

export interface GeneratedFile {
  path: string;
  name: string;
  size: number;
  extension: string;
}

export async function streamGenerate(
  prompt: string,
  onEvent: (event: AgentEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const apiBase = getApiBase();
  let res: Response;
  try {
    res = await fetch(`${apiBase}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_prompt: prompt, recursion_limit: 100 }),
      signal,
    });
  } catch (err) {
    const currentBase = apiBase || "(none set)";
    throw new Error(
      `Could not connect to backend at '${currentBase}'. Check that your Railway backend is live and CORS is allowed.`
    );
  }

  if (!res.ok) {
    const text = await res.text();
    handleResponseError(res.status, text);
  }

  if (!res.body) throw new Error("No response body from server");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";
    for (const chunk of chunks) {
      for (const line of chunk.split("\n")) {
        if (line.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(line.slice(6)) as AgentEvent;
            onEvent(parsed);
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    }
  }
}

export async function getFiles(): Promise<GeneratedFile[]> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/api/files`);
  if (!res.ok) {
    const text = await res.text();
    handleResponseError(res.status, text);
  }
  const data = (await res.json()) as { files: GeneratedFile[] };
  return data.files;
}

export async function getFileContent(path: string): Promise<string> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/api/file?path=${encodeURIComponent(path)}`);
  if (!res.ok) {
    const text = await res.text();
    handleResponseError(res.status, text);
  }
  const data = (await res.json()) as { path: string; content: string };
  return data.content;
}

export function previewUrl(path = "index.html"): string {
  const apiBase = getApiBase();
  return `${apiBase}/api/preview/${path}`;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

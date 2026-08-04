function getApiBase(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:8000";
  }
  return "";
}

function handleResponseError(status: number, text: string): never {
  if (text.includes("<!DOCTYPE html>") || text.includes("<html") || status === 404) {
    throw new Error(
      "Backend URL not connected (404). Please go to your Vercel Project Settings -> Environment Variables, add VITE_API_URL with your Railway backend URL (e.g. https://mellowcode-backend.up.railway.app), and click Redeploy."
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
  } catch {
    throw new Error(
      "Could not connect to backend. Please ensure VITE_API_URL is set to your live backend URL in your Vercel Environment Variables and redeploy."
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

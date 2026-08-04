const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";

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
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_prompt: prompt, recursion_limit: 100 }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server error ${res.status}: ${text}`);
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
  const res = await fetch(`${API_BASE}/api/files`);
  if (!res.ok) throw new Error("Failed to fetch file list");
  const data = (await res.json()) as { files: GeneratedFile[] };
  return data.files;
}

export async function getFileContent(path: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/file?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`Failed to fetch file: ${path}`);
  const data = (await res.json()) as { path: string; content: string };
  return data.content;
}

export function previewUrl(path = "index.html"): string {
  return `${API_BASE}/api/preview/${path}`;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

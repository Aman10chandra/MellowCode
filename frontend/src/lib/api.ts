declare global {
  interface Window {
    __MELLOW_ENV__?: { VITE_API_URL?: string };
  }
}

// ── API base resolution ──────────────────────────────────────────────────────
// Priority:
//   1. window.__MELLOW_ENV__ (set by entrypoint.sh at container start)
//   2. /client-config.json  (served by Nitro server from process.env at runtime)
//   3. import.meta.env.VITE_API_URL (Vite build-time bake — only if set)
//   4. localStorage override (browser console shortcut for debugging)
//   5. localhost:8000 fallback for local dev

let _cachedApiBase: string | undefined;
let _apiBasePromise: Promise<string> | null = null;

function getApiBaseSync(): string | undefined {
  // 1. Runtime injection via entrypoint.sh
  if (typeof window !== "undefined" && window.__MELLOW_ENV__?.VITE_API_URL) {
    return window.__MELLOW_ENV__.VITE_API_URL.trim().replace(/\/+$/, "");
  }
  // 2. Vite build-time env
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl?.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  // 3. localStorage override
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("MELLOW_API_URL");
    if (stored?.trim()) {
      return stored.trim().replace(/\/+$/, "");
    }
    // 4. Localhost fallback
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://localhost:8000";
    }
  }
  return undefined;
}

/** Resolves the backend API base URL, fetching /client-config.json if needed. */
export async function resolveApiBase(): Promise<string> {
  if (_cachedApiBase !== undefined) return _cachedApiBase;

  // Try all sync sources first (no network request needed)
  const sync = getApiBaseSync();
  if (sync !== undefined) {
    _cachedApiBase = sync;
    return _cachedApiBase;
  }

  // Deduplicate concurrent callers
  if (_apiBasePromise) return _apiBasePromise;

  _apiBasePromise = (async () => {
    try {
      // Fetch /client-config.json from OUR Nitro server — reads process.env.VITE_API_URL
      const res = await fetch("/client-config.json");
      if (res.ok) {
        const data = (await res.json()) as { apiUrl?: string };
        if (data.apiUrl?.trim()) {
          _cachedApiBase = data.apiUrl.trim().replace(/\/+$/, "");
          console.log("[api] resolved from /client-config.json:", _cachedApiBase);
          return _cachedApiBase;
        }
      }
    } catch (e) {
      console.warn("[api] /client-config.json fetch failed:", e);
    }
    _cachedApiBase = "";
    return _cachedApiBase;
  })();

  return _apiBasePromise;
}

/** Synchronous getter — only returns a value if it's already been resolved. */
export function getApiBase(): string {
  return _cachedApiBase ?? getApiBaseSync() ?? "";
}

export function setCustomApiBase(url: string): void {
  if (typeof window !== "undefined") {
    if (url.trim() === "") {
      window.localStorage.removeItem("MELLOW_API_URL");
    } else {
      window.localStorage.setItem("MELLOW_API_URL", url.trim().replace(/\/+$/, ""));
    }
    _cachedApiBase = undefined;
    _apiBasePromise = null;
  }
}

function handleResponseError(status: number, text: string, apiBase: string): never {
  if (
    !apiBase ||
    text.includes("<!DOCTYPE html>") ||
    text.includes("<html") ||
    status === 404
  ) {
    throw new Error(
      `Backend not reachable. In Railway → Frontend Service → Variables, set:\n  VITE_API_URL = https://your-backend.up.railway.app\nThen click Deploy.`
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
  const apiBase = await resolveApiBase();
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
      `Could not connect to backend. Set VITE_API_URL in Railway Frontend Variables to your backend URL.`
    );
  }

  if (!res.ok) {
    const text = await res.text();
    handleResponseError(res.status, text, apiBase);
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
  const apiBase = await resolveApiBase();
  const res = await fetch(`${apiBase}/api/files`);
  if (!res.ok) {
    const text = await res.text();
    handleResponseError(res.status, text, apiBase);
  }
  const data = (await res.json()) as { files: GeneratedFile[] };
  return data.files;
}

export async function getFileContent(path: string): Promise<string> {
  const apiBase = await resolveApiBase();
  const res = await fetch(`${apiBase}/api/file?path=${encodeURIComponent(path)}`);
  if (!res.ok) {
    const text = await res.text();
    handleResponseError(res.status, text, apiBase);
  }
  const data = (await res.json()) as { path: string; content: string };
  return data.content;
}

export async function previewUrl(path = "index.html"): Promise<string> {
  const apiBase = await resolveApiBase();
  return `${apiBase}/api/preview/${path}`;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const apiBase = await resolveApiBase();
    const res = await fetch(`${apiBase}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

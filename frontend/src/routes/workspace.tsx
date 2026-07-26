import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  ArrowUp,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Cpu,
  ExternalLink,
  File,
  Folder,
  Loader2,
  Monitor,
  Plus,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  streamGenerate,
  getFiles,
  getFileContent,
  previewUrl,
  type AgentEvent,
  type GeneratedFile,
} from "@/lib/api";

// ─── Route definition ─────────────────────────────────────────────────────────

export const Route = createFileRoute("/workspace")({
  validateSearch: (search: Record<string, unknown>) => ({
    prompt: typeof search.prompt === "string" ? search.prompt : "",
  }),
  head: () => ({
    meta: [{ title: "MellowCode — Workspace" }],
  }),
  component: Workspace,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  variant?: "status" | "success" | "error" | "default";
}

interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children: TreeNode[];
}

type ViewMode = "preview" | "code";

// ─── File tree helpers ────────────────────────────────────────────────────────

function buildTree(files: GeneratedFile[]): TreeNode[] {
  const root: TreeNode[] = [];
  for (const file of files) {
    const parts = file.path.split("/");
    let nodes = root;
    let currentPath = "";
    for (let i = 0; i < parts.length; i++) {
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
      const isLast = i === parts.length - 1;
      let node = nodes.find((n) => n.name === parts[i]);
      if (!node) {
        node = { name: parts[i], path: currentPath, isDir: !isLast, children: [] };
        nodes.push(node);
      }
      nodes = node.children;
    }
  }
  return root;
}

function sortTree(nodes: TreeNode[]): TreeNode[] {
  return [...nodes]
    .sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .map((n) => ({ ...n, children: sortTree(n.children) }));
}

// ─── File Tree Item ───────────────────────────────────────────────────────────

function TreeItem({
  node,
  selected,
  onSelect,
  depth,
}: {
  node: TreeNode;
  selected: string;
  onSelect: (path: string) => void;
  depth: number;
}) {
  const [open, setOpen] = useState(true);

  if (node.isDir) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center gap-1.5 py-[5px] pr-2 text-xs text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors"
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          {open ? (
            <ChevronDown className="h-3 w-3 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 flex-shrink-0" />
          )}
          <Folder className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
          <span className="truncate font-medium">{node.name}</span>
        </button>
        {open &&
          node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              selected={selected}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(node.path)}
      className={`w-full flex items-center gap-1.5 py-[5px] pr-2 text-xs rounded-md transition-colors truncate ${
        selected === node.path
          ? "bg-neutral-900 text-white"
          : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
      }`}
      style={{ paddingLeft: `${depth * 14 + 22}px` }}
    >
      <File
        className={`h-3.5 w-3.5 flex-shrink-0 ${selected === node.path ? "text-neutral-300" : "text-neutral-400"}`}
      />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

// ─── Chat Bubble ──────────────────────────────────────────────────────────────

function ChatBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end mb-3">
        <div
          className="max-w-[88%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-white leading-relaxed"
          style={{ backgroundColor: "#8A9A5B" }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  const icon =
    msg.variant === "success" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
    ) : msg.variant === "error" ? (
      <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
    ) : msg.variant === "status" ? (
      <Cpu className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5 animate-pulse" />
    ) : null;

  return (
    <div className="flex justify-start mb-2">
      <div className="flex items-start gap-2 max-w-[88%]">
        {icon && <div className="mt-0.5">{icon}</div>}
        <p
          className={`text-sm leading-relaxed ${
            msg.variant === "error"
              ? "text-red-400"
              : msg.variant === "success"
                ? "text-emerald-400 font-medium"
                : "text-neutral-300"
          }`}
        >
          {msg.content}
        </p>
      </div>
    </div>
  );
}

// ─── Main Workspace ───────────────────────────────────────────────────────────

function Workspace() {
  const { prompt: initialPrompt } = Route.useSearch();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [code, setCode] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [generating, setGenerating] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [previewSrc, setPreviewSrc] = useState("");
  const [iframeKey, setIframeKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loadingCode, setLoadingCode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const hasRun = useRef(false);

  const addMessage = useCallback((msg: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: `${Date.now()}-${Math.random()}` },
    ]);
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
  }, []);

  const loadFiles = useCallback(async () => {
    try {
      const f = await getFiles();
      if (f.length === 0) return;
      setFiles(f);
      setTree(sortTree(buildTree(f)));
      const indexFile = f.find((x) => x.name === "index.html");
      const firstFile = indexFile || f[0];
      if (firstFile) {
        // Auto-select first file for code view
        setSelectedPath(firstFile.path);
        const content = await getFileContent(firstFile.path);
        setCode(content);
      }
      // Refresh preview
      const ts = Date.now();
      setPreviewSrc(`/api/preview/index.html?t=${ts}`);
      setIframeKey((k) => k + 1);
      setViewMode("preview");
    } catch {
      // silent
    }
  }, []);

  const handleSelectFile = useCallback(async (path: string) => {
    setSelectedPath(path);
    setViewMode("code");
    setLoadingCode(true);
    try {
      const content = await getFileContent(path);
      setCode(content);
    } catch {
      setCode("// Failed to load file content");
    } finally {
      setLoadingCode(false);
    }
  }, []);

  const runGeneration = useCallback(
    async (prompt: string) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setGenerating(true);
      addMessage({ role: "user", content: prompt });

      try {
        await streamGenerate(
          prompt,
          (event: AgentEvent) => {
            if (event.type === "STATUS") {
              addMessage({
                role: "assistant",
                content: event.message,
                variant: "status",
              });
            }
            if (event.type === "PLAN_CREATED") {
              addMessage({
                role: "assistant",
                content: "Plan created! Designing file structure...",
                variant: "status",
              });
            }
            if (event.type === "TASKS_CREATED") {
              addMessage({
                role: "assistant",
                content: "Structure ready! Writing your code now...",
                variant: "status",
              });
            }
            if (event.type === "COMPLETE") {
              addMessage({
                role: "assistant",
                content: "Project generated successfully! 🎉",
                variant: "success",
              });
              setGenerating(false);
              loadFiles();
            }
            if (event.type === "ERROR") {
              addMessage({
                role: "assistant",
                content: event.error,
                variant: "error",
              });
              setGenerating(false);
            }
          },
          abortRef.current.signal
        );
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          addMessage({
            role: "assistant",
            content: err.message,
            variant: "error",
          });
        }
        setGenerating(false);
      }
    },
    [addMessage, loadFiles]
  );

  // Run generation once on mount if prompt provided
  useEffect(() => {
    if (initialPrompt && !hasRun.current) {
      hasRun.current = true;
      runGeneration(initialPrompt);
    }
  }, []);

  async function handleNewPrompt(e: React.FormEvent) {
    e.preventDefault();
    if (!newPrompt.trim() || generating) return;
    const p = newPrompt;
    setNewPrompt("");
    await runGeneration(p);
  }

  async function handleCopy() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function refreshPreview() {
    setPreviewSrc(`/api/preview/index.html?t=${Date.now()}`);
    setIframeKey((k) => k + 1);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0d1117]">
      {/* ── Top bar ── */}
      <header className="flex-shrink-0 h-11 flex items-center justify-between px-4 border-b border-white/[0.08] bg-[#161b22]">
        <button
          id="back-home-btn"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-sm font-semibold text-white hover:text-neutral-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          MellowCode
        </button>
        <div className="flex items-center gap-3">
          {generating && (
            <span className="flex items-center gap-1.5 text-xs text-blue-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generating...
            </span>
          )}
          <button
            id="new-chat-btn"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white border border-white/10 hover:border-white/20 rounded-md px-2.5 py-1.5 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ════════════════════════════════════════
            LEFT PANEL — Chat sidebar
        ════════════════════════════════════════ */}
        <aside className="w-[300px] flex-shrink-0 flex flex-col border-r border-white/[0.08] bg-[#0d1117]">
          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-0.5">
            {messages.length === 0 && !generating ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Sparkles className="h-5 w-5 text-neutral-500" />
                </div>
                <p className="text-sm text-neutral-500 font-medium">
                  No conversation yet
                </p>
                <p className="text-xs text-neutral-600 mt-1">
                  Submit a prompt to get started
                </p>
              </div>
            ) : (
              messages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)
            )}
            {generating && (
              <div className="flex items-center gap-2 py-1">
                <div className="flex gap-1">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-neutral-500 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-neutral-500 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-neutral-500 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── New prompt input ── */}
          <div className="flex-shrink-0 border-t border-white/[0.08] p-3">
            <form onSubmit={handleNewPrompt} className="relative">
              <textarea
                id="followup-input"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleNewPrompt(e as unknown as React.FormEvent);
                  }
                }}
                placeholder="Ask for changes..."
                rows={2}
                disabled={generating}
                className="w-full resize-none bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 pt-3 pb-9 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-white/20 transition-colors disabled:opacity-50 leading-relaxed"
              />
              <button
                id="followup-submit-btn"
                type="submit"
                disabled={!newPrompt.trim() || generating}
                className="absolute bottom-2.5 right-2.5 flex items-center justify-center h-7 w-7 rounded-lg text-white disabled:opacity-30 transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#8A9A5B" }}
                aria-label="Send"
              >
                {generating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
                )}
              </button>
            </form>
          </div>
        </aside>

        {/* ════════════════════════════════════════
            RIGHT PANEL — Preview / Code
        ════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* ── Tab bar ── */}
          <div className="flex-shrink-0 h-11 flex items-center justify-between px-3 border-b border-neutral-200 bg-white">
            {/* Preview / Code toggle */}
            <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-0.5">
              <button
                id="tab-preview"
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === "preview"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                Preview
              </button>
              <button
                id="tab-code"
                onClick={() => setViewMode("code")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === "code"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                Code
              </button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {viewMode === "preview" && (
                <>
                  <button
                    id="refresh-preview-btn"
                    onClick={refreshPreview}
                    title="Refresh preview"
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 border border-neutral-200 rounded-md px-2.5 py-1.5 bg-white hover:bg-neutral-50 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </button>
                  {previewSrc && (
                    <a
                      id="open-preview-link"
                      href={previewSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 border border-neutral-200 rounded-md px-2.5 py-1.5 bg-white hover:bg-neutral-50 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </a>
                  )}
                </>
              )}
              {viewMode === "code" && selectedPath && (
                <button
                  id="copy-code-btn"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 border border-neutral-200 rounded-md px-2.5 py-1.5 bg-white hover:bg-neutral-50 transition-colors"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 overflow-hidden">
            {/* ── PREVIEW VIEW ── */}
            {viewMode === "preview" && (
              <div className="h-full bg-neutral-100 flex items-center justify-center">
                {previewSrc ? (
                  <iframe
                    id="preview-iframe"
                    key={iframeKey}
                    src={previewSrc}
                    className="w-full h-full border-0 bg-white"
                    title="Live preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-center">
                    {generating ? (
                      <>
                        <div className="relative">
                          <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                            <Loader2 className="h-7 w-7 text-neutral-400 animate-spin" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-700">
                            Building your app...
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            Preview will appear when ready
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                          <Monitor className="h-7 w-7 text-neutral-300" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-500">
                            No preview yet
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            Submit a prompt to generate your app
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── CODE VIEW ── */}
            {viewMode === "code" && (
              <div className="flex h-full">
                {/* File tree sidebar */}
                <div className="w-52 flex-shrink-0 bg-white border-r border-neutral-200 flex flex-col overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-neutral-100">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Explorer
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto py-1.5 px-1.5">
                    {files.length === 0 ? (
                      <div className="px-2 py-3 text-xs text-neutral-400 text-center">
                        {generating ? (
                          <span className="flex items-center justify-center gap-1.5">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Generating...
                          </span>
                        ) : (
                          "No files yet"
                        )}
                      </div>
                    ) : (
                      tree.map((node) => (
                        <TreeItem
                          key={node.path}
                          node={node}
                          selected={selectedPath}
                          onSelect={handleSelectFile}
                          depth={0}
                        />
                      ))
                    )}
                  </div>
                  <div className="border-t border-neutral-100 px-3 py-2">
                    <span className="text-[10px] text-neutral-400">
                      {files.length} file{files.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Code content area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">
                  {/* File path bar */}
                  {selectedPath && (
                    <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-b border-white/[0.08] bg-[#161b22]">
                      <File className="h-3.5 w-3.5 text-neutral-500 flex-shrink-0" />
                      <span className="text-xs font-mono text-neutral-400 truncate">
                        {selectedPath}
                      </span>
                    </div>
                  )}

                  {/* Code */}
                  <div className="flex-1 overflow-auto">
                    {!selectedPath ? (
                      <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
                          <Code2 className="h-5 w-5 text-neutral-600" />
                        </div>
                        <p className="text-sm text-neutral-600">
                          Select a file to view code
                        </p>
                      </div>
                    ) : loadingCode ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-5 w-5 animate-spin text-neutral-600" />
                      </div>
                    ) : (
                      <pre className="p-5 text-xs font-mono leading-relaxed text-[#e6edf3] overflow-x-auto whitespace-pre min-h-full">
                        <code>{code}</code>
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

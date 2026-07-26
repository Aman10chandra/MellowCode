import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUp, Sparkles, Zap, Globe, FileCode } from "lucide-react";
import mossCirclesBg from "@/assets/moss-circles-bg.jpg";

export const Route = createFileRoute("/")(({
  head: () => ({
    meta: [
      { title: "MellowCode — Build apps by chatting" },
      {
        name: "description",
        content:
          "MellowCode turns your ideas into working apps. Describe what you want to build and watch it come to life.",
      },
      { property: "og:title", content: "MellowCode — Build apps by chatting" },
      {
        property: "og:description",
        content: "Describe your idea. MellowCode builds the app. Minimal, fast, professional.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
} as any));

const suggestions = [
  "A minimalist portfolio site",
  "A task tracker with reminders",
  "A landing page for my startup",
  "An invoice generator",
];

function Index() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    navigate({ to: "/workspace", search: { prompt } });
  }

  return (
    <div className="relative min-h-screen bg-white text-neutral-900 flex flex-col overflow-hidden">
      {/* Minimal header — logo only */}
      <header className="relative z-20 w-full px-6 md:px-10 py-5 flex items-center bg-white">
        <a href="/" className="flex items-center">
          <span className="text-lg font-semibold tracking-tight">MellowCode</span>
        </a>
      </header>

      {/* Page background */}
      <div
        className="relative z-10 flex-1 flex flex-col bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${mossCirclesBg})` }}
      >
        <main className="relative z-10 flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-2xl -mt-16">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900">
                What do you want to build?
              </h1>
              <p className="mt-4 text-base md:text-lg text-neutral-500">
                Describe your idea, and MellowCode brings it to life.
              </p>
            </div>

            {/* Prompt box */}
            <form
              onSubmit={handleSubmit}
              className="relative rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] focus-within:border-neutral-300 transition-colors"
            >
              <textarea
                id="prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
                placeholder="Ask MellowCode to create a website for..."
                rows={3}
                className="w-full resize-none bg-transparent px-5 pt-5 pb-14 text-[15px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 outline-none rounded-2xl"
              />
              <div className="absolute bottom-3 right-3">
                <button
                  id="submit-btn"
                  type="submit"
                  disabled={!prompt.trim()}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-white transition-opacity disabled:opacity-40 hover:opacity-90"
                  style={{ backgroundColor: "#8A9A5B" }}
                  aria-label="Send prompt"
                >
                  <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
            </form>

            {/* Suggestions */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="text-sm px-3.5 py-1.5 rounded-full border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 transition-colors bg-white"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Feature pills */}
            <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />AI-powered planner</span>
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" />Multi-agent coder</span>
              <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />Live preview</span>
              <span className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" />Full source code</span>
            </div>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} MellowCode
        </footer>
      </div>
    </div>
  );
}

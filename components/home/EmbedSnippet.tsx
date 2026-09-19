"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import { Check, Copy } from "lucide-react";

/**
 * The homepage embed snippet, dressed as a small code window: traffic
 * lights, a "ready" status, the iframe tag, and a Copy button. The snippet
 * itself is passed in from the server component so the canonical origin is
 * resolved once, in one place (lib/site-url.ts).
 */
export function EmbedSnippet({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      track("embed_snippet_copied", { where: "home" });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="card rounded-2xl bg-ink p-4 text-cloud sm:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-2 text-xs text-cloud/70">
          <span className="embed-status-dot h-2 w-2 rounded-full bg-[#28c840]" aria-hidden />
          Ready to embed
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <pre className="min-w-0 flex-1 whitespace-pre-wrap break-all rounded-xl bg-white/[0.06] px-4 py-4 text-xs leading-relaxed sm:px-5 sm:text-sm">
          <code>{snippet}</code>
        </pre>
        <button
          type="button"
          onClick={copy}
          className="btn inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-sky px-6 py-3 font-display text-sm text-white transition hover:bg-sky-deep"
        >
          {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <p
        className={`mt-2 flex h-5 items-center gap-2 text-xs transition-opacity ${copied ? "opacity-100" : "opacity-0"}`}
        aria-live="polite"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#28c840]" aria-hidden>
          <Check className="h-2.5 w-2.5 text-ink" strokeWidth={3} />
        </span>
        {copied ? "Copied to clipboard!" : ""}
      </p>
    </div>
  );
}

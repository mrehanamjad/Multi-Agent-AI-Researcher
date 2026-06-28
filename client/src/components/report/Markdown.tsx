import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const isDark =
    typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  return (
    <div className="group relative my-5 overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between border-b border-border bg-muted/60 px-4 py-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {language || "code"}
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          background: "transparent",
          fontSize: "0.85rem",
          padding: "1rem 1.1rem",
        }}
        codeTagProps={{ style: { fontFamily: "ui-monospace, SFMono-Regular, monospace" } }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

export function Markdown({ content }: { content: string }) {
  return (
    <div className="markdown-body max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => (
            <h1 className="mb-4 mt-2 font-display text-3xl font-semibold tracking-tight" {...p} />
          ),
          h2: (p) => (
            <h2
              className="mb-3 mt-9 border-b border-border pb-2 font-display text-xl font-semibold tracking-tight"
              {...p}
            />
          ),
          h3: (p) => <h3 className="mb-2 mt-6 text-lg font-semibold" {...p} />,
          p: (p) => <p className="my-4 leading-7 text-foreground/90" {...p} />,
          ul: (p) => <ul className="my-4 ml-5 list-disc space-y-2 marker:text-muted-foreground" {...p} />,
          ol: (p) => <ol className="my-4 ml-5 list-decimal space-y-2 marker:text-muted-foreground" {...p} />,
          li: (p) => <li className="leading-7 text-foreground/90" {...p} />,
          a: (p) => (
            <a className="font-medium text-primary underline underline-offset-4 hover:opacity-80" {...p} />
          ),
          blockquote: (p) => (
            <blockquote
              className="my-5 border-l-2 border-primary/40 bg-muted/40 py-1 pl-4 pr-2 italic text-muted-foreground"
              {...p}
            />
          ),
          table: (p) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-border">
              <table className="w-full border-collapse text-sm" {...p} />
            </div>
          ),
          thead: (p) => <thead className="bg-muted/60" {...p} />,
          th: (p) => (
            <th className="border-b border-border px-4 py-2.5 text-left font-semibold" {...p} />
          ),
          td: (p) => <td className="border-b border-border/70 px-4 py-2.5 align-top" {...p} />,
          hr: () => <hr className="my-8 border-border" />,
          code(props) {
            const { children, className, ...rest } = props as {
              children?: React.ReactNode;
              className?: string;
            };
            const match = /language-(\w+)/.exec(className || "");
            if (match) {
              return <CodeBlock language={match[1]} value={String(children).replace(/\n$/, "")} />;
            }
            return (
              <code
                className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
                {...rest}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

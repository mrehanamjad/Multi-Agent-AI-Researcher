import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { faviconUrl } from "@/lib/format";
import type { Source } from "@/types";

export function SourceCard({ source, index }: { source: Source; index: number }) {
  const [imgError, setImgError] = useState(false);
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
    >
      <div className="flex items-center gap-2.5">
        <div className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-muted">
          {imgError ? (
            <span className="text-[11px] font-semibold text-muted-foreground">
              {source.domain[0]?.toUpperCase()}
            </span>
          ) : (
            <img
              src={faviconUrl(source.domain)}
              alt=""
              className="h-4 w-4"
              onError={() => setImgError(true)}
            />
          )}
        </div>
        <span className="truncate text-xs text-muted-foreground">{source.domain}</span>
        <span className="ml-auto text-[11px] font-medium text-muted-foreground/70">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
        {source.title}
      </h4>
      <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{source.snippet}</p>
      <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Open link <ExternalLink className="h-3 w-3" />
      </span>
    </a>
  );
}

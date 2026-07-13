import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { modelById } from "@/lib/conductor-data";
import type { Message } from "@/lib/conductor-types";

export function MessageBubble({ m }: { m: Message }) {
  const isUser = m.sender === "user";
  const modelInfo = m.model ? modelById(m.model) : null;

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground shadow-sm">
          <div className="mb-0.5 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider opacity-70">
            You · Moderator
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs font-bold",
          modelInfo?.accent,
        )}
      >
        {m.authorName.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{m.authorName}</span>
          <Badge variant="outline" className="border-border/60 text-[10px]">
            {m.roleName}
          </Badge>
          {modelInfo && (
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px]", modelInfo.accent)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", modelInfo.dot)} />
              {modelInfo.label}
            </span>
          )}
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-border/60 bg-card/60 px-4 py-2.5 text-sm leading-relaxed shadow-sm">
          <div className="max-w-none text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_h1]:my-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:my-2 [&_h2]:text-sm [&_h2]:font-semibold [&_li]:my-0.5 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-secondary [&_pre]:p-2 [&_pre]:text-xs [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5">
            <ReactMarkdown>{m.content || " "}</ReactMarkdown>
          </div>
          {m.streaming && (
            <span className="mt-1 inline-block h-3 w-1.5 animate-pulse bg-foreground/70 align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}

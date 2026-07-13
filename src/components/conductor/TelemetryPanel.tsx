import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TelemetryStore, type TelemetryEntry } from "@/lib/TelemetryStore";
import { Trash2, Terminal } from "lucide-react";
import { CONTEXT_WINDOW } from "@/lib/conductor-data";

export function TelemetryPanel() {
  const [entries, setEntries] = useState<TelemetryEntry[]>([]);

  useEffect(() => {
    return TelemetryStore.subscribe(setEntries);
  }, []);

  const totalTokens = entries.reduce((sum, e) => sum + e.contextTokens + e.outputTokens, 0);

  const contextPct = Math.min(100, (totalTokens / CONTEXT_WINDOW) * 100);

  const activeStreams = entries.filter((e) => e.status === "streaming").length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
        <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold">Telemetry</span>
        <Badge variant="outline" className="border-border/60 text-[10px]">
          {entries.filter((e) => e.status === "complete").length}
        </Badge>
        {activeStreams > 0 && (
          <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        )}
        <Button onClick={() => TelemetryStore.clear()} size="icon" variant="ghost" className="ml-auto h-6 w-6">
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="border-b border-border/60 px-3 py-2">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Context</span>
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border/60">
            <div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all",
                contextPct > 80 ? "bg-destructive" : contextPct > 50 ? "bg-amber-500" : "bg-emerald-500",
              )}
              style={{ width: `${contextPct}%` }}
            />
          </div>
          <span className="font-mono tabular-nums">
            {totalTokens.toLocaleString()} / {CONTEXT_WINDOW.toLocaleString()}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2 font-mono text-[10px]">
          {entries.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No telemetry yet. Send a message or trigger an agent.
            </div>
          )}
          {entries.map((e) => (
            <div
              key={e.id}
              className={cn(
                "rounded-md border px-2 py-1.5",
                e.status === "streaming"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : e.status === "error"
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-border/40 bg-card/40",
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground/80">{e.agentName}</span>
                <span className="text-muted-foreground">{e.model}</span>
                {e.status === "streaming" && (
                  <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                )}
              </div>
              <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground">
                <span>ctx: {e.contextTokens.toLocaleString()}t</span>
                <span>out: {e.outputTokens.toLocaleString()}t</span>
                {e.latencyMs !== null && <span>{(e.latencyMs / 1000).toFixed(1)}s</span>}
                {e.status === "error" && <span className="text-destructive">{e.error}</span>}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

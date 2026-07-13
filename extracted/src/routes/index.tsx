import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Play,
  Pause,
  Send,
  MessagesSquare,
  Users,
  Sparkles,
  Download,
  FileText,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSessions } from "@/hooks/useSessions";
import { useChat } from "@/hooks/useChat";
import { AddParticipantModal } from "@/components/conductor/AddParticipantModal";
import { MessageBubble } from "@/components/conductor/MessageBubble";
import { ParticipantCard } from "@/components/conductor/ParticipantCard";
import { TimelineStore } from "@/lib/TimelineStore";
import { CONTEXT_WINDOW } from "@/lib/conductor-data";

export const Route = createFileRoute("/")({
  component: Conductor,
});

function Conductor() {
  const {
    sessions, setSessions, active, activeId, setActiveId,
    newSession, deleteSession,
    addParticipant, removeParticipant, toggleParticipant, editParticipant, updateActive,
  } = useSessions();

  const {
    input, setInput, autoRun, messagesEndRef,
    sendUserMessage, toggleAutoRun, triggerParticipant,
  } = useChat({ active, updateActive, sessions, activeId, setSessions });

  const [addOpen, setAddOpen] = useState(false);

  const totalTokens = useMemo(
    () => TimelineStore.totalTokens(active.messages),
    [active.messages],
  );
  const contextPct = TimelineStore.contextUtilization(active.messages);

  const exportJson = () => {
    const blob = new Blob([TimelineStore.exportAsJson(active)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${active.title.replace(/\s+/g, "_")}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const exportMarkdown = () => {
    const blob = new Blob([TimelineStore.exportAsMarkdown(active)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${active.title.replace(/\s+/g, "_")}.md`;
    a.click(); URL.revokeObjectURL(url);
  };

  const importSession = () => {
    const inputEl = document.createElement("input");
    inputEl.type = "file"; inputEl.accept = ".json";
    inputEl.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const session = TimelineStore.importFromJson(reader.result as string);
        if (session) {
          setSessions((prev) => [session, ...prev]);
          setActiveId(session.id);
        }
      };
      reader.readAsText(file);
    };
    inputEl.click();
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* LEFT SIDEBAR — Sessions */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card/40 md:flex">
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight">Conductor</h1>
            <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">Multi-LLM playground</p>
          </div>
        </div>
        <div className="px-3">
          <div className="flex gap-2">
            <Button onClick={newSession} className="flex-1 justify-start gap-2" size="sm">
              <Plus className="h-4 w-4" /> New
            </Button>
            <Button onClick={importSession} size="sm" variant="secondary" className="justify-center gap-2">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4 px-4 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Sessions
        </div>
        <ScrollArea className="flex-1 px-2 py-2">
          <div className="space-y-1">
            {sessions.map((s) => {
              const isActive = s.id === activeId;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "group flex items-start gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                    isActive ? "bg-secondary" : "hover:bg-secondary/50",
                  )}
                >
                  <button
                    onClick={() => setActiveId(s.id)}
                    className="flex min-w-0 flex-1 flex-col items-start text-left"
                  >
                    <span className="w-full truncate font-medium">{s.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(s.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteSession(s.id)}
                    className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    aria-label="Delete session"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </aside>

      {/* MAIN */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 items-center gap-3 border-b border-border/60 bg-card/30 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <MessagesSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
            <h2 className="truncate text-sm font-semibold">{active.title}</h2>
            <Badge variant="outline" className="ml-1 shrink-0 border-border/60 text-[10px]">
              {active.participants.filter((p) => p.isEnabled).length}/{active.participants.length} active
            </Badge>
          </div>

          <div className="flex-1" />

          <div className="hidden items-center gap-1 lg:flex">
            <Button onClick={exportJson} size="sm" variant="ghost" className="h-8 gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> JSON
            </Button>
            <Button onClick={exportMarkdown} size="sm" variant="ghost" className="h-8 gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" /> MD
            </Button>
          </div>

          <Button
            onClick={toggleAutoRun}
            size="sm"
            className={cn(
              "gap-2 transition-all",
              autoRun && "bg-emerald-500 text-white hover:bg-emerald-500/90",
            )}
          >
            {autoRun ? (
              <><Pause className="h-3.5 w-3.5" /> Auto Run</>
            ) : (
              <><Play className="h-3.5 w-3.5" /> Auto Run</>
            )}
          </Button>

          <div className="hidden items-center gap-2 rounded-md border border-border/60 bg-secondary/40 px-2.5 py-1.5 text-[11px] lg:flex">
            <span className="text-muted-foreground">Context</span>
            <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-border/60">
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
        </header>

        {/* Timeline */}
        <div className="relative flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="mx-auto max-w-3xl px-4 py-6">
              {active.messages.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-4">
                  {active.messages.map((m) => (
                    <MessageBubble key={m.id} m={m} />
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input */}
        <div className="border-t border-border/60 bg-card/30 px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendUserMessage();
                }
              }}
              placeholder="Moderate the conversation... (Enter to send, Shift+Enter for newline)"
              rows={1}
              className="min-h-[44px] resize-none bg-secondary/40"
            />
            <Button onClick={sendUserMessage} size="icon" className="h-11 w-11 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR — Participants */}
      <aside className="hidden w-72 shrink-0 flex-col border-l border-border/60 bg-card/40 lg:flex">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-4">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Participants</h3>
          <span className="ml-auto text-xs text-muted-foreground">{active.participants.length}</span>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-3">
            {active.participants.map((p) => (
              <ParticipantCard
                key={p.id}
                participant={p}
                onToggle={(v) => toggleParticipant(p.id, v)}
                onTrigger={() => triggerParticipant(p.id)}
                onRemove={() => removeParticipant(p.id)}
                onEdit={(sp) => editParticipant(p.id, sp)}
              />
            ))}
          </div>
        </ScrollArea>
        <div className="border-t border-border/60 p-3">
          <Button onClick={() => setAddOpen(true)} variant="secondary" className="w-full gap-2">
            <Plus className="h-4 w-4" /> Add Participant
          </Button>
        </div>
      </aside>

      <AddParticipantModal open={addOpen} onOpenChange={setAddOpen} onAdd={addParticipant} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
        <MessagesSquare className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-base font-semibold">Start the discussion</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Send a prompt as the moderator, then hit <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">Auto Run</span> to let your agents debate — or trigger any single one manually.
      </p>
    </div>
  );
}

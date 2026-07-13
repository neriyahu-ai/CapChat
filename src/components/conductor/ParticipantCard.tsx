import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Trash2, Pencil, Check, X, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { modelById, roleColor } from "@/lib/conductor-data";
import type { Participant } from "@/lib/conductor-types";

export function ParticipantCard({
  participant,
  onToggle,
  onTrigger,
  onRemove,
  onEdit,
  onReorder,
  isFirst,
  isLast,
}: {
  participant: Participant;
  onToggle: (v: boolean) => void;
  onTrigger: () => void;
  onRemove: () => void;
  onEdit: (systemPrompt: string) => void;
  onReorder?: (direction: "up" | "down") => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const info = modelById(participant.model);
  const [editing, setEditing] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState(participant.systemPrompt);

  const saveEdit = () => {
    onEdit(draftPrompt.trim());
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraftPrompt(participant.systemPrompt);
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border/60 bg-card/60 p-3 transition-all",
        !participant.isEnabled && "opacity-40",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs font-bold", roleColor(participant.roleName))}>
          {participant.roleName.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{participant.roleName}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className={cn("h-1.5 w-1.5 rounded-full", info.dot)} />
            <span className="truncate">{info.label}</span>
          </div>
        </div>
        <Switch checked={participant.isEnabled} onCheckedChange={onToggle} />
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <Textarea
            value={draftPrompt}
            onChange={(e) => setDraftPrompt(e.target.value)}
            rows={4}
            className="resize-none bg-secondary/40 font-mono text-xs"
          />
          <div className="flex gap-1.5">
            <Button onClick={saveEdit} size="sm" className="h-7 flex-1 gap-1 text-xs">
              <Check className="h-3 w-3" /> Save
            </Button>
            <Button onClick={cancelEdit} size="icon" variant="ghost" className="h-7 w-7">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-1.5">
          <Button
            onClick={onTrigger}
            size="sm"
            variant="secondary"
            className="h-7 flex-1 gap-1 text-xs"
            disabled={!participant.isEnabled}
          >
            <Zap className="h-3 w-3" /> Trigger
          </Button>
          <Button
            onClick={() => { setDraftPrompt(participant.systemPrompt); setEditing(true); }}
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button onClick={onRemove} size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {onReorder && (
        <div className="absolute right-3 top-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onReorder("up")}
            disabled={isFirst}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            onClick={() => onReorder("down")}
            disabled={isLast}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Zap, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { modelById } from "@/lib/conductor-data";
import type { Participant } from "@/lib/conductor-types";

export function ParticipantCard({
  participant,
  onToggle,
  onTrigger,
  onRemove,
}: {
  participant: Participant;
  onToggle: (v: boolean) => void;
  onTrigger: () => void;
  onRemove: () => void;
}) {
  const info = modelById(participant.model);
  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border/60 bg-card/60 p-3 transition-all",
        !participant.isEnabled && "opacity-40",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs font-bold", info.accent)}>
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
        <Button onClick={onRemove} size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

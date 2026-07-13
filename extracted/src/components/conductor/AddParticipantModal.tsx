import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MODELS, ROLE_PRESETS, type ModelId, type RolePreset } from "@/lib/conductor-data";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (p: { model: ModelId; roleName: string; systemPrompt: string }) => void;
};

export function AddParticipantModal({ open, onOpenChange, onAdd }: Props) {
  const [model, setModel] = useState<ModelId>("gpt-4o");
  const [selected, setSelected] = useState<RolePreset | null>(null);
  const [customName, setCustomName] = useState("");
  const [prompt, setPrompt] = useState("");

  const reset = () => {
    setModel("gpt-4o");
    setSelected(null);
    setCustomName("");
    setPrompt("");
  };

  const handleSelect = (role: RolePreset) => {
    setSelected(role);
    setPrompt(role.prompt);
    if (role.id !== "custom") setCustomName(role.name);
    else setCustomName("");
  };

  const canAdd = selected && (selected.id !== "custom" ? true : customName.trim().length > 0) && prompt.trim().length > 0;

  const submit = () => {
    if (!selected) return;
    const roleName = selected.id === "custom" ? customName.trim() : selected.name;
    onAdd({ model, roleName, systemPrompt: prompt.trim() });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="max-w-2xl border-border/60 bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg">Add Participant</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              1 · Model
            </Label>
            <Select value={model} onValueChange={(v) => setModel(v as ModelId)}>
              <SelectTrigger className="bg-secondary/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", m.dot)} />
                      <span>{m.label}</span>
                      <span className="text-xs text-muted-foreground">· {m.vendor}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              2 · Role
            </Label>
            <div className="flex flex-wrap gap-2">
              {ROLE_PRESETS.map((r) => {
                const active = selected?.id === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelect(r)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-all",
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border/60 bg-secondary/40 text-foreground/80 hover:border-primary/50 hover:bg-secondary",
                    )}
                  >
                    <span className="mr-1.5">{r.emoji}</span>
                    {r.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={cn(
              "grid transition-all duration-300 ease-out",
              selected ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="space-y-3 pt-1">
                {selected?.id === "custom" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Role name
                    </Label>
                    <input
                      className="w-full rounded-md border border-border/60 bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
                      placeholder="e.g. Startup Investor"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    3 · System prompt {selected?.id !== "custom" && <span className="normal-case text-muted-foreground/70">(recommended — editable)</span>}
                  </Label>
                  <Textarea
                    rows={6}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={selected?.id === "custom" ? "Describe how this agent should behave..." : ""}
                    className="resize-none bg-secondary/40 font-mono text-xs leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canAdd} onClick={submit}>
            Confirm & Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

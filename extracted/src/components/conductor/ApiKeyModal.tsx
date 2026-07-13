import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PROVIDER_CONFIGS, getSavedApiKeys, saveApiKey } from "@/lib/providers";
import { KeyRound, Eye, EyeOff } from "lucide-react";

export function ApiKeyModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [show, setShow] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) setKeys(getSavedApiKeys());
  }, [open]);

  const save = () => {
    for (const [providerId, key] of Object.entries(keys)) {
      saveApiKey(providerId, key);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/60 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-4 w-4" /> API Keys
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {PROVIDER_CONFIGS.map((cfg) => (
            <div key={cfg.id} className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {cfg.label}
              </Label>
              <div className="relative">
                <Input
                  type={show[cfg.id] ? "text" : "password"}
                  value={keys[cfg.id] || ""}
                  onChange={(e) => setKeys((prev) => ({ ...prev, [cfg.id]: e.target.value }))}
                  placeholder={`${cfg.label} API key`}
                  className="bg-secondary/40 pr-9 font-mono text-xs"
                />
                <button
                  onClick={() => setShow((prev) => ({ ...prev, [cfg.id]: !prev[cfg.id] }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show[cfg.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground">
            Keys are stored in localStorage. They are never sent anywhere except the provider API.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save Keys</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

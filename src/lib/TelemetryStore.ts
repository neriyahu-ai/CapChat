export type TelemetryEntry = {
  id: string;
  agentId: string;
  agentName: string;
  model: string;
  startedAt: number;
  finishedAt: number | null;
  latencyMs: number | null;
  contextTokens: number;
  outputTokens: number;
  status: "streaming" | "complete" | "error";
  error?: string;
};

let entries: TelemetryEntry[] = [];
const listeners = new Set<(entries: TelemetryEntry[]) => void>();

function notify() {
  for (const fn of listeners) {
    fn([...entries]);
  }
}

export const TelemetryStore = {
  subscribe(fn: (entries: TelemetryEntry[]) => void) {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },

  getEntries(): TelemetryEntry[] {
    return [...entries];
  },

  start(id: string, agentId: string, agentName: string, model: string, contextTokens: number): string {
    const entry: TelemetryEntry = {
      id,
      agentId,
      agentName,
      model,
      startedAt: Date.now(),
      finishedAt: null,
      latencyMs: null,
      contextTokens,
      outputTokens: 0,
      status: "streaming",
    };
    entries = [entry, ...entries].slice(0, 200); // keep last 200
    notify();
    return id;
  },

  update(id: string, outputTokens: number) {
    entries = entries.map((e) => (e.id === id ? { ...e, outputTokens } : e));
    notify();
  },

  complete(id: string, outputTokens: number) {
    const now = Date.now();
    entries = entries.map((e) =>
      e.id === id
        ? { ...e, finishedAt: now, latencyMs: now - e.startedAt, outputTokens, status: "complete" }
        : e,
    );
    notify();
  },

  error(id: string, error: string) {
    const now = Date.now();
    entries = entries.map((e) =>
      e.id === id
        ? { ...e, finishedAt: now, latencyMs: now - e.startedAt, status: "error", error }
        : e,
    );
    notify();
  },

  clear() {
    entries = [];
    notify();
  },
};

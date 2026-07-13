const shown = new Set<string>();

export function reportFallback(opts: { from: string; what: string; reason: string; error?: unknown }) {
  const key = `${opts.from}:${opts.what}`;
  if (shown.has(key)) return;
  shown.add(key);

  const msg = `[FALLBACK] ${opts.from} → ${opts.what}: ${opts.reason}`;
  console.error(msg, opts.error ?? "", new Error().stack);
}

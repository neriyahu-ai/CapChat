# CapChat — Multi‑LLM Conductor

**CapChat** is a browser‑based playground for orchestrating conversations between multiple LLM agents. Add participants with different models, system prompts, and roles — then sit back as they debate, critique, and build on each other's ideas.

## Features

- **Multi‑agent orchestration** — Auto Run or Manual Trigger; state machine ensures deterministic turn order.
- **Live API streaming** — Built‑in providers for DeepSeek, OpenRouter, and OpenAI‑compatible endpoints.
- **Mock mode** — Rapid prototyping without API costs. Toggle Live/Mock with one click.
- **Session management** — Create, switch, delete sessions. Persisted to `localStorage`. Export as JSON or Markdown.
- **Inline editing** — Edit system prompts, reorder participants, toggle enable/disable on the fly.
- **Resizable panels** — Sidebar, chat timeline, and participant pane are all draggable.
- **Telemetry panel** — Real‑time token counts, latency, and context window utilization per request.
- **Key management** — API keys stored in `localStorage`, never sent anywhere except the provider API.
- **Keyboard shortcuts** — `Ctrl+Enter` to send, `Escape` to close modals.
- **Import/Export** — Full session import from JSON.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173.

### Environment variables (optional)

| Variable | Description |
|----------|-------------|
| `VITE_DEEPSEEK_API_KEY` | DeepSeek API key (for `deepseek-chat` model) |
| `VITE_OPENROUTER_API_KEY` | OpenRouter API key (for OpenRouter‑hosted models) |

Keys can also be set inside the app via the **API Keys** modal (bottom‑left sidebar).

## Test

```bash
npm test          # 48 characterization tests
npm run test:watch
```

## Project structure

```
src/
├── components/     UI components (MessageBubble, ParticipantCard, panels)
├── hooks/          useChat, useSessions — state & streaming logic
├── lib/            stores, providers, utilities, types
│   ├── providers/  LLM provider abstraction (DeepSeek, OpenRouter)
│   ├── TelemetryStore.ts   live request tracking
│   ├── TimelineStore.ts    localStorage persistence
│   └── Orchestrator.ts     auto‑run state machine
├── routes/         TanStack Start routes (/, __root)
├── styles.css      Tailwind v4 styles
└── tests/          4 test suites, 48 tests
planning/           Roadmap, requirements, architecture docs
```

## Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React 19, SSR)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Build:** Vite 8
- **Testing:** Vitest + React Testing Library + happy‑dom
- **Panels:** react‑resizable‑panels
- **Icons:** Lucide React

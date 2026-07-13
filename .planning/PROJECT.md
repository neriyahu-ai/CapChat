# Conductor — Multi-LLM Chat Playground

## What This Is

A single-user developer playground for running multi-agent simulations with multiple LLMs in parallel. The system simulates a group chat environment (WhatsApp-like) where the user acts as "Conductor" — presenting a thesis or question and letting AI models with distinct "hats" (roles/prompts) debate, challenge, and develop ideas in a controlled manner.

## Core Value

A deterministic multi-LLM debate simulator where the user retains complete control over the conversation flow, while multiple AI agents with distinct roles respond in sequence.

## Core Capabilities

- **Timeline UI** — Linear, clean message display. Each message shows agent name, model type, and content.
- **Deterministic Queue** — Two run modes:
  - Auto Run (single pass): All enabled agents respond in order, then system returns to listening.
  - Manual Trigger: User explicitly clicks a specific agent to respond.
- **Per-Participant Control** — Quick on/off toggle for each agent. Disabled agents skip during Auto Run without breaking history.
- **Progressive Disclosure** — Add participant modal showing preset role bubbles, revealing editable system prompt on selection.
- **Global Context Window** — Static constant (`CONTEXT_WINDOW = 9999`) feeds full conversation history to every model.
- **Session Management** — Multiple sessions, create/delete/switch between them.
- **Raw Telemetry** — Real-time terminal logs: agent ID, estimated context tokens, latency, output tokens.

## Requirements

### Validated (existing in codebase)

- ✓ Session CRUD — create, switch, delete sessions
- ✓ Timeline UI — linear message display with agent name, model, role
- ✓ Participant management — add/remove/toggle agents
- ✓ Auto Run — single-pass sequential agent responses
- ✓ Manual Trigger — trigger individual agent responses
- ✓ Add Participant Modal — progressive disclosure with role presets
- ✓ Context window display — total tokens / CONTEXT_WINDOW
- ✓ Mock streaming responses (setInterval-based)

### Active (to be built)

- [ ] **UI-01**: Refactor monolithic Conductor component into separated concerns (UIController, TimelineStore, Orchestrator, AgentManager, APIConnector)
- [ ] **UI-02**: Add participant management sidebar with drag-to-reorder
- [ ] **UI-03**: Real API integration with OpenAI, Anthropic, OpenRouter
- [ ] **UI-04**: Streaming responses from real API (not mock)
- [ ] **UI-05**: Graceful stop — streaming completes before stopping
- [ ] **UI-06**: System prompt editing for existing participants
- [ ] **UI-07**: Session persistence (localStorage or IndexedDB)
- [ ] **UI-08**: Raw telemetry panel (token counts, latency, agent ID)
- [ ] **UI-09**: Participant avatars/colors per role
- [ ] **UI-10**: Keyboard shortcuts (Ctrl+Enter for send, etc.)
- [ ] **UI-11**: Resizable panels (chat, participants, telemetry)
- [ ] **UI-12**: Export conversation as JSON/Markdown

### Out of Scope (MVP)

- Context summarization/trimming mechanisms — deferred in favor of linear context window
- Multi-user / collaboration features
- Custom model fine-tuning
- Advanced RAG / knowledge base integration
- Authentication system

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single-page app (no auth) | Developer tool, single user | — Implemented |
| CONTEXT_WINDOW = 9999 | YAGNI — no complex context management | — Implemented |
| React + TanStack Start | Modern stack, SSR-ready | — Implemented |
| Tailwind + shadcn/ui | Rapid UI development | — Implemented |
| Deterministic single-pass Auto Run | Prevent chaotic infinite loops | — Pending |
| Mock → Real API migration path | Develop UI first, connect APIs later | — In progress |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions

---

*Last updated: 2026-07-13 after initialization from PRD documents*

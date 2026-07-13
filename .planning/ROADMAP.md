# Roadmap — Conductor Multi-LLM Playground (MVP)

## Overview

8 fine-grained phases to evolve the existing frontend skeleton into a complete multi-LLM playground with real API integration, proper state management, and polished UI.

---

### Phase 1: UI Refactoring — Separate Concerns
**Goal:** Break the monolithic 582-line Conductor component into separated modules: UIController (UI rendering only), custom hooks for state, extracted types.

**Requirements:** ARCH-01, UI-01

**Success Criteria:**
1. Conductor component is <150 lines (UI rendering + hook calls only)
2. Session state managed by custom hook (useSessions)
3. Participant state managed by custom hook (useParticipants)
4. Messaging/streaming logic extracted into useChat
5. All existing functionality preserved after refactor

---

### Phase 2: TimelineStore & Session Persistence
**Goal:** Implement proper TimelineStore with flat message array, add localStorage persistence for sessions and messages.

**Requirements:** ARCH-03, UI-08, DATA-01, DATA-02

**Success Criteria:**
1. TimelineStore class with addMessage, getContext, getAll methods
2. CONTEXT_WINDOW = 9999 enforced at store level
3. Auto-save sessions to localStorage on every change
4. Sessions survive page refresh
5. Export conversation as JSON and Markdown

---

### Phase 3: Orchestrator — Deterministic State Machine
**Goal:** Build Orchestrator as a proper state machine managing Auto Run and Manual Trigger modes with gate checks.

**Requirements:** ARCH-02

**Success Criteria:**
1. Orchestrator manages is_autorun, current_turn_index state
2. Auto Run: iterates enabled participants sequentially, stops when pass complete
3. Manual Trigger: fires single agent, no index advancement
4. Gate check prevents new Auto Run while one is active
5. Graceful stop: ongoing stream completes before stopping

---

### Phase 4: AgentManager — Participant Management
**Goal:** Extract participant management into AgentManager with draft state, role presets, and editing capabilities.

**Requirements:** ARCH-04, UI-04, UI-05

**Success Criteria:**
1. AgentManager manages CRUD of participants in session
2. Draft state for progressive disclosure (model → role → prompt)
3. Inline system prompt editing for existing participants
4. Auto-assign colors/avatars per role
5. Toggle enable/disable and remove participants

---

### Phase 5: APIConnector — Real LLM Integration
**Goal:** Replace mock streaming with real API calls to OpenAI, Anthropic, and OpenRouter.

**Requirements:** API-01, API-02, API-03, API-04, API-05

**Success Criteria:**
1. Provider abstraction with OpenAI, Anthropic, OpenRouter adapters
2. Prompt assembly: system prompt + flattened timeline
3. Real streaming responses rendered in UI
4. Graceful stop: ongoing stream completes naturally
5. Per-participant provider/model selection configurable

---

### Phase 6: UI Polish — Panels & Interaction
**Goal:** Add resizable panels, participant reordering, and keyboard shortcuts.

**Requirements:** UI-02, UI-03, UI-06

**Success Criteria:**
1. Resizable panels between sidebar, chat, and participants pane
2. Drag-to-reorder participants
3. Keyboard shortcuts: Ctrl+Enter send, Escape close modals, etc.
4. Smooth animations for message appearance

---

### Phase 7: Telemetry Panel
**Goal:** Implement raw telemetry/logs panel showing live per-request data.

**Requirements:** TEL-01, TEL-02, TEL-03, UI-07

**Success Criteria:**
1. Telemetry panel shows live logs per API request
2. Display agent ID, context tokens, latency, output tokens
3. Context window utilization bar (tokens / CONTEXT_WINDOW)
4. Toggle telemetry panel visibility

---

### Phase 8: Import/Export & Final Polish
**Goal:** Add conversation import, final UI polish, and edge case handling.

**Requirements:** DATA-03, UI-10

**Success Criteria:**
1. Import session from JSON file
2. Error handling for all edge cases
3. Empty states for all panels
4. Responsive minimum viable layout for smaller screens

---

## Traceability Map

| REQ-ID | Phase |
|--------|-------|
| ARCH-01 | 1 |
| UI-01 | 1 |
| ARCH-03 | 2 |
| UI-08 | 2 |
| DATA-01 | 2 |
| DATA-02 | 2 |
| ARCH-02 | 3 |
| ARCH-04 | 4 |
| UI-04 | 4 |
| UI-05 | 4 |
| API-01 | 5 |
| API-02 | 5 |
| API-03 | 5 |
| API-04 | 5 |
| API-05 | 5 |
| UI-02 | 6 |
| UI-03 | 6 |
| UI-06 | 6 |
| TEL-01 | 7 |
| TEL-02 | 7 |
| TEL-03 | 7 |
| UI-07 | 7 |
| DATA-03 | 8 |
| UI-10 | 8 |

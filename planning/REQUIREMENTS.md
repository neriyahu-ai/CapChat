# Requirements — Conductor Multi-LLM Playground (MVP)

## v1 Requirements

### Architecture & Refactoring
- [ ] **ARCH-01**: Split monolithic Conductor component into separated modules: UIController, TimelineStore, Orchestrator, AgentManager, APIConnector
- [ ] **ARCH-02**: Implement deterministic state machine for Orchestrator (is_autorun, current_turn_index)
- [ ] **ARCH-03**: Create TimelineStore as flat message array with CONTEXT_WINDOW = 9999
- [ ] **ARCH-04**: Implement AgentManager with draft state management for progressive disclosure

### API Integration
- [ ] **API-01**: Implement APIConnector with provider abstraction (OpenAI, Anthropic, OpenRouter)
- [ ] **API-02**: Build prompt assembly — inject system prompt + flatten timeline to API format
- [ ] **API-03**: Support real streaming responses from provider APIs
- [ ] **API-04**: Implement graceful stop — ongoing stream completes before stopping Auto Run
- [ ] **API-05**: Add configurable provider selection per participant

### UI Enhancements
- [ ] **UI-01**: Refactor state management out of monolithic component into custom hooks/stores
- [ ] **UI-02**: Add resizable panels for chat, participants, and telemetry views
- [ ] **UI-03**: Implement participant drag-to-reorder in sidebar
- [ ] **UI-04**: Add system prompt editing for existing participants inline
- [ ] **UI-05**: Assign unique colors/avatars to each role automatically
- [ ] **UI-06**: Add keyboard shortcuts (Ctrl+Enter send, etc.)
- [ ] **UI-07**: Implement raw telemetry panel showing live logs per request
- [ ] **UI-08**: Add session persistence via localStorage/IndexedDB

### Data & Export
- [ ] **DATA-01**: Add session auto-save on message/participant change
- [ ] **DATA-02**: Implement conversation export as JSON and Markdown
- [ ] **DATA-03**: Add import session from JSON file

### Telemetry
- [ ] **TEL-01**: Show real-time token count per message
- [ ] **TEL-02**: Display request latency and estimated cost
- [ ] **TEL-03**: Show context window utilization (tokens / CONTEXT_WINDOW)

## v2 Requirements (Deferred)

- Multi-user / team collaboration
- Context summarization and trimming
- Custom model fine-tuning integration
- RAG / knowledge base ingestion
- Plugin system for custom tools
- WebSocket-based real-time collaboration

## Out of Scope

- Authentication / user management — single-user dev tool
- Production deployment (Railway, Docker) — runs locally via `npm run dev`
- Mobile responsive design — desktop-first playground

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| ARCH-01 | TBD | Open |
| ARCH-02 | TBD | Open |
| ARCH-03 | TBD | Open |
| ARCH-04 | TBD | Open |
| API-01 | TBD | Open |
| API-02 | TBD | Open |
| API-03 | TBD | Open |
| API-04 | TBD | Open |
| API-05 | TBD | Open |
| UI-01 | TBD | Open |
| UI-02 | TBD | Open |
| UI-03 | TBD | Open |
| UI-04 | TBD | Open |
| UI-05 | TBD | Open |
| UI-06 | TBD | Open |
| UI-07 | TBD | Open |
| UI-08 | TBD | Open |
| DATA-01 | TBD | Open |
| DATA-02 | TBD | Open |
| DATA-03 | TBD | Open |
| TEL-01 | TBD | Open |
| TEL-02 | TBD | Open |
| TEL-03 | TBD | Open |

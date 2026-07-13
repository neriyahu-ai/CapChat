# Concerns

## 1. Monolithic Component (Critical)
`routes/index.tsx` (582 lines) contains **all** application logic:
- Type definitions (Participant, Message, Session)
- Session CRUD
- Message sending + streaming
- Auto-run orchestration
- Participant management
- AddParticipantModal integration
- Full layout JSX (sidebar, main, right panel)
- Sub-components (EmptyState, MessageBubble, ParticipantCard)

This violates single responsibility and makes testing, refactoring, and reasoning about the code very difficult.

## 2. No API / Real LLM Integration (Blocking)
- `mockResponseFor()` returns random pre-written chunks
- No API connector layer, no provider abstraction
- No OpenAI/Anthropic/Meta/Google SDK integration
- No streaming protocol (SSE/WebSocket) implementation
- Cannot connect to real models — the app is a simulation

## 3. Mock Streaming is Naive
- Uses `setInterval` (180ms) to append chunks to state
- No abort controller — `streamingRef` flag only prevents new triggers, doesn't cancel in-flight
- State updates sequentially re-map entire sessions array per chunk (O(n) per tick)
- No backpressure handling

## 4. No Orchestrator / State Machine
- `runAutoLoop()` simply iterates participants sequentially in a `for` loop
- No parallel dispatch support
- No conversation branching or context management
- No awareness of token limits or context window overflow
- No rate limiting or retry logic

## 5. No Session Persistence
- All state is in-memory `useState` — lost on page refresh
- No localStorage, IndexedDB, or server-side persistence
- No session import/export

## 6. No Separation of Concerns
- Business logic mixed with presentation
- Navigation state mixed with data state
- No custom hooks extracted (useSessions, useParticipants, useStreaming)
- No store or context — all prop drilling through closures

## 7. Unused Dependencies
- react-hook-form, @hookform/resolvers, zod installed but not used (AddParticipantModal uses raw useState)
- recharts, react-resizable-panels, react-day-picker installed but unused
- Many Radix primitives installed from shadcn/ui init but unused

## 8. TypeScript Strictness
- `noUnusedLocals: false` — allows dead code
- `noUnusedParameters: false` — allows unused params
- `verbatimModuleSyntax: false` — mixed import styles

## 9. Error Handling Gaps
- No error handling in streaming (setInterval doesn't catch errors)
- No retry mechanism for failed agent responses
- No timeout protection for stuck streams
- No user-facing feedback for stream failures beyond a toast

## 10. SSR Overhead for SPA
- Full TanStack Start SSR setup (Nitro, h3) for what is effectively a single-page client app
- Error capture layer adds complexity for SSR errors that rarely occur in dev
- No SSR-specific features being leveraged (data loading, server functions, etc.)

## 11. No Tests
- No unit, integration, or E2E tests
- No testing framework configured
- No type testing or storybook

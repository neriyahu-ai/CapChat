# File Structure

```
extracted/
├── .gitignore
├── .lovable/                          # Lovable dev platform config
├── .prettierignore
├── .prettierrc
├── AGENTS.md                          # Lovable project instructions
├── bun.lock
├── bunfig.toml
├── components.json                    # shadcn/ui configuration
├── eslint.config.js
├── node_modules/
├── package-lock.json
├── package.json
├── tsconfig.json
├── vite.config.ts                     # @lovable.dev/vite-tanstack-config wrapper
├── public/                            # Static assets
└── src/
    ├── start.ts                       # TanStack Start instance + SSR error middleware
    ├── server.ts                      # SSR entry point (h3 error swallowing detection)
    ├── router.tsx                     # Router factory (QueryClient + createRouter)
    ├── routeTree.gen.ts               # Auto-generated route tree
    ├── styles.css                     # Tailwind v4 + design tokens (oklch, dark mode)
    ├── hooks/
    │   └── use-mobile.tsx             # useIsMobile() hook (768px breakpoint)
    ├── lib/
    │   ├── conductor-data.ts          # Models, role presets, mock response generator
    │   ├── utils.ts                   # cn() utility
    │   ├── error-capture.ts           # Global error capture for SSR
    │   ├── lovable-error-reporting.ts # Lovable SDK error bridge
    │   └── error-page.ts             # Static error page HTML renderer
    ├── components/
    │   ├── conductor/
    │   │   └── AddParticipantModal.tsx  # Add participant dialog
    │   └── ui/                        # 46 shadcn/ui components
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── alert.tsx
    │       ├── aspect-ratio.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── command.tsx
    │       ├── context-menu.tsx
    │       ├── dialog.tsx
    │       ├── drawer.tsx
    │       ├── dropdown-menu.tsx
    │       ├── form.tsx
    │       ├── hover-card.tsx
    │       ├── input-otp.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── menubar.tsx
    │       ├── navigation-menu.tsx
    │       ├── pagination.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── sonner.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toggle-group.tsx
    │       ├── toggle.tsx
    │       └── tooltip.tsx
    └── routes/
        ├── README.md                  # Route conventions (generated)
        ├── __root.tsx                  # Root layout (shell, providers, error boundaries)
        └── index.tsx                  # Conductor — main app page (582 lines, ALL logic)
```

## File Sizes (src/)
| File | Lines |
|------|-------|
| routes/index.tsx | 582 |
| components/conductor/AddParticipantModal.tsx | 158 |
| styles.css | 144 |
| routes/__root.tsx | 127 |
| routeTree.gen.ts | 69 |
| lib/conductor-data.ts | 66 |
| src/server.ts | 61 |
| lib/lovable-error-reporting.ts | 36 |
| lib/error-page.ts | 30 |
| lib/error-capture.ts | 27 |
| src/start.ts | 22 |
| router.tsx | 16 |
| hooks/use-mobile.tsx | 19 |
| lib/utils.ts | 6 |

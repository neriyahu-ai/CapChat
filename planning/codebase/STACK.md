# Technology Stack

## Framework
| Layer | Technology | Version |
|-------|-----------|---------|
| Meta-framework | TanStack React Start | ^1.168.26 |
| UI Library | React | ^19.2.0 |
| Rendering | SSR via Nitro (h3) | 3.0.260603-beta |
| Build | Vite + @lovable.dev/vite-tanstack-config | ^8.0.16 / ^2.7.1 |

## Routing & State
- **Router**: @tanstack/react-router ^1.170.16 (file-based, auto-generated route tree)
- **Server Data**: @tanstack/react-query ^5.101.1
- **SSR**: @tanstack/react-start full-stack SSR setup

## Styling
- **CSS Framework**: Tailwind CSS ^4.2.1 (with @tailwindcss/vite plugin)
- **Animation**: tw-animate-css ^1.3.4
- **Component Library**: shadcn/ui (New York style, Radix primitives)
- **Icons**: lucide-react ^0.575.0
- **Class Merge**: tailwind-merge ^3.5.0 + clsx ^2.1.1

## UI Components (shadcn/ui + Radix)
| Package | Use |
|---------|-----|
| @radix-ui/react-dialog | Modals (AddParticipantModal) |
| @radix-ui/react-select | Dropdowns (model selector) |
| @radix-ui/react-switch | Participant enable/disable |
| @radix-ui/react-accordion, alert-dialog, aspect-ratio, avatar, checkbox, collapsible, context-menu, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, separator, slider, tabs, textarea, toggle, toggle-group, tooltip | Available (installed) |
| cmdk ^1.1.1 | Command palette |
| vaul ^1.1.2 | Drawer |
| embla-carousel-react ^8.6.0 | Carousel |
| react-resizable-panels ^4.6.5 | Resizable panels |
| react-day-picker ^9.14.0 + date-fns ^4.1.0 | Calendar/date |
| input-otp ^1.4.2 | OTP input |
| recharts ^2.15.4 | Charts |

## Forms & Validation
- react-hook-form ^7.71.2 + @hookform/resolvers ^5.2.2 + zod ^3.24.2

## Utilities
- **Markdown Rendering**: react-markdown ^10.1.0
- **Toasts**: sonner ^2.0.7

## Development
- **Language**: TypeScript ^5.8.3 (strict mode, bundler resolution)
- **Linting**: ESLint ^9.32.0 + typescript-eslint
- **Formatting**: Prettier ^3.7.3
- **Path Alias**: `@/` → `./src/` (configured in tsconfig + vite-tsconfig-paths)
- **Error Reporting**: Lovable SDK bridge (window.__lovableEvents)

## Infrastructure
- **SSR Error Boundaries**: Custom error capture layer (error-capture.ts → server.ts → error-page.ts)
- **Request Middleware**: TanStack Start middleware for error wrapping

## Not Yet Used (installed but not imported)
- react-hook-form, @hookform/resolvers, zod, recharts, react-resizable-panels, react-day-picker, input-otp — dependencies present, not yet wired
- Multiple Radix primitives installed but unused

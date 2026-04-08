# CLAUDE.md — Project Context for Claude Code

This file gives Claude Code persistent context about this project.

## What this is
Seattle 2026 is a personalized World Cup fan guide for Seattle. It uses progressive disclosure — the AI asks questions to learn about each fan, then surfaces relevant cards (tickets, food, transport, weather, etc.) tailored to their preferences.

## Stack
- Next.js 15 (App Router, server components + client components)
- TypeScript (strict mode)
- Tailwind CSS (custom design tokens in tailwind.config.ts)
- Zustand (global state, persisted to localStorage)
- Anthropic SDK (claude-sonnet-4-20250514 via server-side API routes)
- Supabase (auth + user_profiles + card_votes tables)

## Key files to know
- `src/lib/prompts.ts` — ALL Claude system prompts live here. Edit here first.
- `src/lib/store.ts` — Global Zustand state. UserContext shape is defined here.
- `src/types/index.ts` — All shared TypeScript types
- `src/hooks/usePersonalization.ts` — Core orchestration: question fetching, card fetching, card expand
- `src/app/api/` — 4 API routes, each wraps a Claude call

## Conventions
- Components are in `src/components/<Name>/<Name>.tsx`
- API routes are in `src/app/api/<route>/route.ts`
- All Claude calls go through server-side API routes (never client-side)
- Tailwind classes only — no inline styles except for dynamic values (accent colors)
- All user-facing text uses the 'DM Sans' font; display text (headings) uses 'Bebas Neue'

## Design tokens (Tailwind)
- `bg-emerald` / `text-emerald` — #1a5c3a (primary green)
- `bg-gold-light` / `text-gold-light` — #f0c96e (highlight gold)
- `bg-slate` — #1c2b3a (dark navy, used in banner + account prompt)
- `bg-fog` — #f0f2f0 (page background)
- `rounded-card` — 16px border radius

## What to build next
1. Supabase auth integration (magic link or Google OAuth)
2. Persist userContext to user_profiles table on login
3. RAG vector search — embed Seattle 2026 knowledge base, query before Claude calls
4. Live data APIs — StubHub tickets, Google Places for food, OpenWeatherMap
5. Animated card transitions with Framer Motion
6. Mobile responsive polish

# Seattle 2026 — World Cup Fan Concierge

A personalized, AI-powered fan guide for the 2026 FIFA World Cup in Seattle. Built with Next.js 15, Claude AI, Tailwind CSS, and Supabase.

---

## ✨ Features

- **AI-driven progressive disclosure** — Claude asks smarter questions as it learns more about you
- **Personalized card feed** — 6 contextual info cards that update with every interaction
- **Click-to-drill** — clicking a card refreshes the other cards with related topics
- **Live AI detail** — each card fetches real, specific Seattle content on demand
- **Vote feedback** — upvote/downvote cards to tune recommendations
- **Profile progress bar** — visual indicator of how well the app knows you
- **Countdown banner** — live countdown to June 11, 2026 kickoff
- **Account persistence** — after 2 interactions, prompt to save your context via Supabase auth

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ask/           # POST — generate next AI question
│   │   ├── cards/         # POST — generate personalized card set
│   │   ├── card-detail/   # POST — fetch expanded card content
│   │   └── refresh-cards/ # POST — related cards after a click
│   ├── layout.tsx
│   ├── page.tsx           # Main page (orchestrates everything)
│   └── globals.css
├── components/
│   ├── Banner/            # Countdown + progress bar + fun stats
│   ├── AIPrompt/          # Question + clickable choices
│   ├── Card/              # Individual card with expand/vote
│   ├── CardGrid/          # Responsive card grid + skeletons
│   ├── ContextChips/      # Removable user preference chips
│   ├── AccountPrompt/     # Save your experience CTA
│   └── Toast.tsx          # Global toast notifications
├── hooks/
│   └── usePersonalization.ts  # Core orchestration hook
├── lib/
│   ├── anthropic.ts       # Claude client singleton
│   ├── defaultCards.ts    # Fallback card data
│   ├── prompts.ts         # All AI system prompts
│   ├── store.ts           # Zustand global state
│   └── supabase.ts        # Browser + server Supabase clients
└── types/
    └── index.ts           # All TypeScript types
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings → API |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and paste the contents of `supabase-schema.sql`
3. Run it — this creates `user_profiles` and `card_votes` tables with RLS

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🏗️ Architecture

### AI Flow

```
User answers question
        ↓
  handleChoice()            ← usePersonalization hook
        ↓
  ┌─────────────────────────────────┐
  │ POST /api/ask     (new question) │
  │ POST /api/cards   (new cards)    │  ← parallel
  └─────────────────────────────────┘
        ↓
User clicks a card
        ↓
  handleCardExpand()
        ↓
  ┌────────────────────────────────────────┐
  │ POST /api/card-detail  (expand content) │
  │ POST /api/refresh-cards (related cards) │  ← parallel
  └────────────────────────────────────────┘
```

### State Management

Global state lives in Zustand (`src/lib/store.ts`). User context and interaction count are persisted to `localStorage` via the `persist` middleware, so preferences survive page refreshes before account creation.

### Prompts

All Claude system prompts are in `src/lib/prompts.ts` — this is your single source of truth for AI behavior. Tune them here.

---

## 🔌 Extending with Live Data

Each API route can be augmented with real data sources before calling Claude:

| Card topic | Suggested API |
|---|---|
| Tickets | StubHub API / Ticketmaster API |
| Food | Google Places API |
| Weather | OpenWeatherMap API |
| Transport | Sound Transit GTFS / Google Maps API |
| Hotels | Hotels.com API / Airbnb affiliate |
| Events | Eventbrite API / SeatGeek |

Pattern: fetch real data first → inject into the Claude prompt as context → Claude formats it into a card.

---

## 🗃️ RAG / Vector Search (Next Step)

To add a knowledge base:

1. Set up a vector database (Supabase `pgvector`, Pinecone, or Weaviate)
2. Ingest trusted Seattle 2026 content (official FIFA docs, city guides, local news)
3. In each API route, run a similarity search on the user's query before calling Claude
4. Inject the retrieved chunks into the system prompt as `<context>` blocks

---

## 🧪 Using with Claude Code + Cursor

This project is optimized for the Claude Code + Cursor workflow:

- Open the project root in Cursor
- Run `claude` in the integrated terminal to start Claude Code
- Use `@CLAUDE.md` to give Claude persistent project context (create this file with your architecture notes)
- Let Claude Code handle multi-file refactors; use Cursor's `Cmd+K` for quick inline edits

---

## 📦 Deploy

```bash
# Vercel (recommended)
npx vercel

# Or build locally
npm run build
npm start
```

Set all environment variables in your Vercel project settings.

// ─── Card ─────────────────────────────────────────────────────
export interface Card {
  id: string
  icon: string
  category: string
  title: string
  preview: string
  accent: string
  expandedContent?: CardDetail
}

export interface CardDetail {
  content: string
  linkText?: string
  linkUrl?: string
}

// ─── AI Question ─────────────────────────────────────────────
export type ContextKey = 'team' | 'location' | 'game' | 'interests' | 'party'

export interface AIQuestion {
  question: string
  choices: string[]
  contextKey: ContextKey
}

// ─── User Context ─────────────────────────────────────────────
export type UserContext = Partial<Record<ContextKey, string>>

// ─── API payloads ─────────────────────────────────────────────
export interface AskPayload {
  userContext: UserContext
}

export interface CardsPayload {
  userContext: UserContext
}

export interface CardDetailPayload {
  cardTitle: string
  cardCategory: string
  userContext: UserContext
}

export interface RefreshCardsPayload {
  clickedCard: Pick<Card, 'id' | 'title' | 'category'>
  userContext: UserContext
}

// ─── RAG / Knowledge Base ─────────────────────────────────────
export type EmbeddingProvider = 'openai' | 'huggingface' | 'gte'

export interface KnowledgeChunk {
  id: string
  source: string
  category: string
  title: string
  content: string
  metadata: Record<string, unknown>
  similarity?: number
}

export interface RetrievalResult {
  provider: EmbeddingProvider
  chunks: KnowledgeChunk[]
  queryTimeMs: number
}

// ─── Supabase user profile ────────────────────────────────────
export interface UserProfile {
  id: string
  email: string
  context: UserContext
  interaction_count: number
  created_at: string
  updated_at: string
}

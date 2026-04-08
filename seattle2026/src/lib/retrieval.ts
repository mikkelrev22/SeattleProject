import { createServerClient } from './supabase'
import { embedText } from './embeddings'
import type { EmbeddingProvider, KnowledgeChunk, RetrievalResult } from '@/types'

// ─── Match function names per provider ────────────────────────

const RPC_NAMES: Record<EmbeddingProvider, string> = {
  openai:      'match_chunks_openai',
  huggingface: 'match_chunks_hf',
  gte:         'match_chunks_gte',
}

// ─── Retrieve similar chunks for a query ──────────────────────

export async function retrieveChunks(
  query: string,
  provider: EmbeddingProvider,
  options: { matchCount?: number; matchThreshold?: number } = {}
): Promise<RetrievalResult> {
  const { matchCount = 5, matchThreshold = 0.7 } = options
  const start = performance.now()

  // 1. Embed the query
  const queryEmbedding = await embedText(query, provider)

  // 2. Call the matching RPC function in Supabase
  const supabase = createServerClient()
  const { data, error } = await supabase.rpc(RPC_NAMES[provider], {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    match_threshold: matchThreshold,
  })

  if (error) throw new Error(`Retrieval error (${provider}): ${error.message}`)

  const queryTimeMs = Math.round(performance.now() - start)

  return {
    provider,
    chunks: (data ?? []) as KnowledgeChunk[],
    queryTimeMs,
  }
}

// ─── Retrieve from all 3 providers (for comparison) ───────────

export async function retrieveChunksAllProviders(
  query: string,
  options: { matchCount?: number; matchThreshold?: number } = {}
): Promise<RetrievalResult[]> {
  const providers: EmbeddingProvider[] = ['openai', 'huggingface', 'gte']
  return Promise.all(
    providers.map((p) => retrieveChunks(query, p, options))
  )
}

// ─── Format chunks as context for Claude prompts ──────────────

export function formatChunksAsContext(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) return ''

  const items = chunks.map((c, i) =>
    `<source index="${i + 1}" title="${c.title}" category="${c.category}" similarity="${c.similarity?.toFixed(3) ?? 'n/a'}">\n${c.content}\n</source>`
  )

  return `<context>\n${items.join('\n\n')}\n</context>`
}

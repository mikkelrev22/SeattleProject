import OpenAI from 'openai'
import { HfInference } from '@huggingface/inference'
import type { EmbeddingProvider } from '@/types'

// ─── Clients (lazy singletons) ────────────────────────────────

let openaiClient: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
  }
  return openaiClient
}

let hfClient: HfInference | null = null
function getHF(): HfInference {
  if (!hfClient) {
    hfClient = new HfInference(process.env.HUGGINGFACE_API_TOKEN!)
  }
  return hfClient
}

// ─── Model config ─────────────────────────────────────────────

const MODELS: Record<EmbeddingProvider, { model: string; dimensions: number }> = {
  openai:      { model: 'text-embedding-3-small', dimensions: 1536 },
  huggingface: { model: 'sentence-transformers/all-MiniLM-L6-v2', dimensions: 384 },
  gte:         { model: 'thenlper/gte-small', dimensions: 384 },
}

export function getModelConfig(provider: EmbeddingProvider) {
  return MODELS[provider]
}

// ─── Embed a single text ──────────────────────────────────────

export async function embedText(
  text: string,
  provider: EmbeddingProvider
): Promise<number[]> {
  switch (provider) {
    case 'openai': {
      const res = await getOpenAI().embeddings.create({
        model: MODELS.openai.model,
        input: text,
      })
      return res.data[0].embedding
    }

    case 'huggingface': {
      const res = await getHF().featureExtraction({
        model: MODELS.huggingface.model,
        inputs: text,
      })
      return Array.from(res as number[])
    }

    case 'gte': {
      const res = await getHF().featureExtraction({
        model: MODELS.gte.model,
        inputs: text,
      })
      return Array.from(res as number[])
    }
  }
}

// ─── Embed with all 3 providers ───────────────────────────────

export interface EmbeddingSet {
  openai: number[]
  huggingface: number[]
  gte: number[]
}

export async function embedTextAllProviders(text: string): Promise<EmbeddingSet> {
  const [openai, huggingface, gte] = await Promise.all([
    embedText(text, 'openai'),
    embedText(text, 'huggingface'),
    embedText(text, 'gte'),
  ])
  return { openai, huggingface, gte }
}

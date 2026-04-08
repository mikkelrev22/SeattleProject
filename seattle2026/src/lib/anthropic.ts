import Anthropic from '@anthropic-ai/sdk'

// Singleton — reused across server-side calls
let client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return client
}

export const CLAUDE_MODEL = 'claude-sonnet-4-20250514'

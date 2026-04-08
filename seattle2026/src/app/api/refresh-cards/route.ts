import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient, CLAUDE_MODEL } from '@/lib/anthropic'
import { REFRESH_CARDS_SYSTEM_PROMPT, serializeContext } from '@/lib/prompts'
import type { RefreshCardsPayload, Card } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { clickedCard, userContext }: RefreshCardsPayload = await req.json()
    const client = getAnthropicClient()

    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: REFRESH_CARDS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Clicked card: "${clickedCard.title}" (${clickedCard.category})\nFan context: ${serializeContext(userContext)}`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const cards: Card[] = JSON.parse(raw.replace(/```json|```/g, '').trim())

    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ cards: [] })
    }

    return NextResponse.json({ cards })
  } catch (err) {
    console.error('[/api/refresh-cards]', err)
    return NextResponse.json({ cards: [] })
  }
}

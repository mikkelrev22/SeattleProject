import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient, CLAUDE_MODEL } from '@/lib/anthropic'
import { CARDS_SYSTEM_PROMPT, serializeContext } from '@/lib/prompts'
import { DEFAULT_CARDS } from '@/lib/defaultCards'
import type { CardsPayload, Card } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { userContext }: CardsPayload = await req.json()
    const client = getAnthropicClient()

    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: CARDS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: 'Generate cards for this fan. Context: ' + serializeContext(userContext),
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const cards: Card[] = JSON.parse(raw.replace(/```json|```/g, '').trim())

    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(DEFAULT_CARDS)
    }

    return NextResponse.json(cards)
  } catch (err) {
    console.error('[/api/cards]', err)
    return NextResponse.json(DEFAULT_CARDS)
  }
}

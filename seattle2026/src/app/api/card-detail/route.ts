import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient, CLAUDE_MODEL } from '@/lib/anthropic'
import { CARD_DETAIL_SYSTEM_PROMPT, serializeContext } from '@/lib/prompts'
import type { CardDetailPayload, CardDetail } from '@/types'

const FALLBACK: CardDetail = {
  content: 'Detailed info for this topic is coming soon. Check back as we get closer to the tournament!',
}

export async function POST(req: NextRequest) {
  try {
    const { cardTitle, cardCategory, userContext }: CardDetailPayload = await req.json()
    const client = getAnthropicClient()

    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 512,
      system: CARD_DETAIL_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Card: "${cardTitle}" (${cardCategory})\nFan context: ${serializeContext(userContext)}`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const detail: CardDetail = JSON.parse(raw.replace(/```json|```/g, '').trim())

    if (!detail.content) return NextResponse.json(FALLBACK)

    return NextResponse.json(detail)
  } catch (err) {
    console.error('[/api/card-detail]', err)
    return NextResponse.json(FALLBACK)
  }
}

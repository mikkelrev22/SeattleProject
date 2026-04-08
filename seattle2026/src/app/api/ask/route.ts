import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient, CLAUDE_MODEL } from '@/lib/anthropic'
import { QUESTION_SYSTEM_PROMPT, serializeContext } from '@/lib/prompts'
import type { AskPayload, AIQuestion } from '@/types'

const FALLBACK: AIQuestion = {
  question: 'Which national team are you supporting?',
  choices: ['USA 🇺🇸', 'Mexico 🇲🇽', 'Brazil 🇧🇷', 'Another team'],
  contextKey: 'team',
}

export async function POST(req: NextRequest) {
  try {
    const { userContext }: AskPayload = await req.json()
    const client = getAnthropicClient()

    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 256,
      system: QUESTION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: serializeContext(userContext),
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed: AIQuestion = JSON.parse(raw.replace(/```json|```/g, '').trim())

    // Validate shape
    if (!parsed.question || !Array.isArray(parsed.choices) || !parsed.contextKey) {
      return NextResponse.json(FALLBACK)
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[/api/ask]', err)
    return NextResponse.json(FALLBACK)
  }
}

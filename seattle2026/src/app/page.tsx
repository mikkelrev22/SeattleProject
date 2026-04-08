'use client'

import { Banner } from '@/components/Banner/Banner'
import { ContextChips } from '@/components/ContextChips/ContextChips'
import { AIPrompt } from '@/components/AIPrompt/AIPrompt'
import { CardGrid } from '@/components/CardGrid/CardGrid'
import { AccountPrompt } from '@/components/AccountPrompt/AccountPrompt'
import { Toast } from '@/components/Toast'
import { usePersonalization } from '@/hooks/usePersonalization'

export default function HomePage() {
  const { handleChoice, handleCardExpand } = usePersonalization()

  return (
    <div className="min-h-screen bg-fog">
      <Banner />

      <main className="max-w-[1100px] mx-auto px-6 py-8 pb-16">
        <ContextChips />

        <AIPrompt onChoice={handleChoice} />

        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-display text-[26px] tracking-wide text-slate">
              DISCOVER SEATTLE 2026
            </h2>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Curated for World Cup fans — click any card to explore
            </p>
          </div>
        </div>

        <CardGrid onCardExpand={handleCardExpand} />

        <AccountPrompt />
      </main>

      <Toast />
    </div>
  )
}

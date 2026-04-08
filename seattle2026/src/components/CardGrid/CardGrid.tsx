'use client'

import { useAppStore } from '@/lib/store'
import { InfoCard } from '@/components/Card/Card'
import type { Card } from '@/types'

interface CardGridProps {
  onCardExpand: (card: Card) => void
}

export function CardGrid({ onCardExpand }: CardGridProps) {
  const cards = useAppStore((s) => s.cards)
  const cardsLoading = useAppStore((s) => s.cardsLoading)
  const expandedCardId = useAppStore((s) => s.expandedCardId)
  const setExpandedCardId = useAppStore((s) => s.setExpandedCardId)

  function handleExpand(id: string) {
    const card = cards.find((c) => c.id === id)
    if (!card) return

    if (expandedCardId === id) {
      // Collapse
      setExpandedCardId(null)
    } else {
      setExpandedCardId(id)
      onCardExpand(card)
    }
  }

  if (cardsLoading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-card border-[1.5px] border-fog-dark p-5 animate-pulse"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div className="w-8 h-8 bg-fog rounded mb-3" />
            <div className="h-2.5 bg-fog rounded w-1/3 mb-2" />
            <div className="h-4 bg-fog rounded w-4/5 mb-1.5" />
            <div className="h-3 bg-fog rounded w-full mb-1" />
            <div className="h-3 bg-fog rounded w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
      {cards.map((card) => (
        <InfoCard
          key={card.id}
          card={card}
          isExpanded={expandedCardId === card.id}
          isDimmed={expandedCardId !== null && expandedCardId !== card.id}
          onExpand={handleExpand}
        />
      ))}
    </div>
  )
}

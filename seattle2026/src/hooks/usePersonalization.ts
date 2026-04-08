import { useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import type { Card, ContextKey } from '@/types'

export function usePersonalization() {
  const {
    userContext,
    setCurrentQuestion,
    setQuestionLoading,
    setCards,
    setCardsLoading,
    setExpandedCardId,
    incrementInteractions,
    setUserContext,
    showToast,
  } = useAppStore()

  // Fetch a new AI question
  const fetchQuestion = useCallback(async () => {
    setQuestionLoading(true)
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userContext }),
      })
      const question = await res.json()
      setCurrentQuestion(question)
    } finally {
      setQuestionLoading(false)
    }
  }, [userContext, setCurrentQuestion, setQuestionLoading])

  // Fetch personalized cards
  const fetchCards = useCallback(async () => {
    setCardsLoading(true)
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userContext }),
      })
      const cards = await res.json()
      setCards(cards)
    } finally {
      setCardsLoading(false)
    }
  }, [userContext, setCards, setCardsLoading])

  // Handle a choice selection
  const handleChoice = useCallback(
    async (value: string, key: ContextKey) => {
      setUserContext(key, value)
      incrementInteractions()
      // Both calls run in parallel
      await Promise.all([fetchQuestion(), fetchCards()])
    },
    [setUserContext, incrementInteractions, fetchQuestion, fetchCards]
  )

  // Handle card click — refresh related cards
  const handleCardExpand = useCallback(
    async (card: Card) => {
      try {
        const res = await fetch('/api/refresh-cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clickedCard: { id: card.id, title: card.title, category: card.category },
            userContext,
          }),
        })
        const { cards: newCards } = await res.json()
        if (newCards && newCards.length > 0) {
          // Keep the expanded card at front, swap the rest
          const expandedCard = useAppStore.getState().cards.find((c) => c.id === card.id) || card
          setCards([expandedCard, ...newCards])
        }
      } catch {
        // silently fail — keep existing cards
      }
    },
    [userContext, setCards]
  )

  // Collapse card and reset related cards on collapse
  const handleCardCollapse = useCallback(() => {
    setExpandedCardId(null)
  }, [setExpandedCardId])

  // Boot: load first question on mount
  useEffect(() => {
    fetchQuestion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { handleChoice, handleCardExpand, handleCardCollapse, fetchCards, fetchQuestion }
}

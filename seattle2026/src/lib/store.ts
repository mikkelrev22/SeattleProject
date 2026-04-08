import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Card, UserContext, ContextKey, AIQuestion } from '@/types'
import { DEFAULT_CARDS } from '@/lib/defaultCards'

interface AppState {
  // User context (persisted to localStorage until account created)
  userContext: UserContext
  interactionCount: number

  // AI question
  currentQuestion: AIQuestion | null
  questionLoading: boolean

  // Cards
  cards: Card[]
  cardsLoading: boolean
  expandedCardId: string | null

  // UI
  showAccountPrompt: boolean
  toastMessage: string | null

  // Actions
  setUserContext: (key: ContextKey, value: string) => void
  removeContextKey: (key: ContextKey) => void
  setCurrentQuestion: (q: AIQuestion | null) => void
  setQuestionLoading: (v: boolean) => void
  setCards: (cards: Card[]) => void
  setCardsLoading: (v: boolean) => void
  setExpandedCardId: (id: string | null) => void
  setShowAccountPrompt: (v: boolean) => void
  showToast: (msg: string) => void
  clearToast: () => void
  incrementInteractions: () => void
  reset: () => void
}

const INITIAL_STATE = {
  userContext: {} as UserContext,
  interactionCount: 0,
  currentQuestion: null,
  questionLoading: false,
  cards: DEFAULT_CARDS,
  cardsLoading: false,
  expandedCardId: null,
  showAccountPrompt: false,
  toastMessage: null,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setUserContext: (key, value) =>
        set((s) => ({ userContext: { ...s.userContext, [key]: value } })),

      removeContextKey: (key) =>
        set((s) => {
          const ctx = { ...s.userContext }
          delete ctx[key]
          return { userContext: ctx }
        }),

      setCurrentQuestion: (q) => set({ currentQuestion: q }),
      setQuestionLoading: (v) => set({ questionLoading: v }),
      setCards: (cards) => set({ cards }),
      setCardsLoading: (v) => set({ cardsLoading: v }),
      setExpandedCardId: (id) => set({ expandedCardId: id }),
      setShowAccountPrompt: (v) => set({ showAccountPrompt: v }),

      showToast: (msg) => {
        set({ toastMessage: msg })
        setTimeout(() => get().clearToast(), 3000)
      },

      clearToast: () => set({ toastMessage: null }),

      incrementInteractions: () =>
        set((s) => {
          const count = s.interactionCount + 1
          return {
            interactionCount: count,
            showAccountPrompt: count >= 2,
          }
        }),

      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'seattle2026-store',
      // Only persist context and interaction count between sessions
      partialize: (s) => ({
        userContext: s.userContext,
        interactionCount: s.interactionCount,
      }),
    }
  )
)

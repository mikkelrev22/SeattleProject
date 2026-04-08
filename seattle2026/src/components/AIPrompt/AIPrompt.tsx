'use client'

import { useAppStore } from '@/lib/store'
import type { ContextKey } from '@/types'

interface AIPromptProps {
  onChoice: (value: string, key: ContextKey) => void
}

export function AIPrompt({ onChoice }: AIPromptProps) {
  const currentQuestion = useAppStore((s) => s.currentQuestion)
  const questionLoading = useAppStore((s) => s.questionLoading)

  return (
    <div className="bg-white rounded-card border-[1.5px] border-emerald-pale p-6 mb-7">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1.5">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300"
          style={{
            background: questionLoading ? '#c9a84c' : '#2d8a58',
            boxShadow: questionLoading
              ? '0 0 0 3px #fdf6e3'
              : '0 0 0 3px #e8f5ee',
          }}
        />
        <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-emerald-light">
          AI Concierge
        </span>
      </div>

      {/* Question */}
      <div className="text-[20px] font-medium text-gray-900 mb-4 leading-snug min-h-[28px]">
        {questionLoading || !currentQuestion ? (
          <span className="text-gray-400 italic text-base">
            {questionLoading ? 'Thinking...' : 'Getting your experience ready...'}
          </span>
        ) : (
          currentQuestion.question
        )}
      </div>

      {/* Choices */}
      <div className="flex flex-wrap gap-2.5">
        {questionLoading || !currentQuestion
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-24 rounded-full bg-fog animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))
          : currentQuestion.choices.map((choice) => (
              <button
                key={choice}
                onClick={() => onChoice(choice, currentQuestion.contextKey)}
                className="px-[18px] py-2 rounded-full border-[1.5px] border-fog-dark bg-fog text-sm font-medium text-gray-800 transition-all duration-150 hover:border-emerald-light hover:bg-emerald-pale hover:text-emerald active:scale-95 cursor-pointer"
              >
                {choice}
              </button>
            ))}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import type { Card, CardDetail } from '@/types'

interface CardProps {
  card: Card
  isExpanded: boolean
  isDimmed: boolean
  onExpand: (id: string) => void
}

export function InfoCard({ card, isExpanded, isDimmed, onExpand }: CardProps) {
  const userContext = useAppStore((s) => s.userContext)
  const showToast = useAppStore((s) => s.showToast)
  const [detail, setDetail] = useState<CardDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [vote, setVote] = useState<'up' | 'down' | null>(null)

  async function handleExpand() {
    onExpand(card.id)

    // Fetch detail if not yet loaded
    if (!detail && !detailLoading) {
      setDetailLoading(true)
      try {
        const res = await fetch('/api/card-detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardTitle: card.title,
            cardCategory: card.category,
            userContext,
          }),
        })
        const data: CardDetail = await res.json()
        setDetail(data)
      } catch {
        setDetail({ content: 'Unable to load details right now. Please try again.' })
      } finally {
        setDetailLoading(false)
      }
    }
  }

  function handleVote(dir: 'up' | 'down') {
    setVote(dir)
    if (dir === 'up') showToast('Thanks! Improving your recommendations...')
    if (dir === 'down') showToast('Got it — adjusting your feed...')
  }

  return (
    <div
      onClick={handleExpand}
      className={[
        'bg-white rounded-card border-[1.5px] p-5 cursor-pointer relative overflow-hidden',
        'transition-all duration-200',
        isExpanded
          ? 'border-emerald shadow-[0_8px_28px_rgba(26,92,58,0.12)]'
          : isDimmed
          ? 'border-fog-dark opacity-50'
          : 'border-fog-dark hover:-translate-y-1 hover:border-emerald-light hover:shadow-[0_8px_28px_rgba(26,92,58,0.08)]',
        isExpanded ? 'col-span-full' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Accent stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-card"
        style={{ background: card.accent }}
      />

      <span className="text-[26px] mb-2.5 block">{card.icon}</span>
      <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-gray-400 mb-1.5">
        {card.category}
      </div>
      <div className="text-[16px] font-semibold text-gray-900 mb-1.5 leading-snug">
        {card.title}
      </div>
      <div className="text-[13px] text-gray-500 leading-relaxed">{card.preview}</div>

      {/* Expanded content */}
      {isExpanded && (
        <div
          className="mt-4 pt-4 border-t border-fog-dark"
          onClick={(e) => e.stopPropagation()}
        >
          {detailLoading ? (
            <div className="space-y-2">
              <div className="h-3 bg-fog rounded animate-shimmer bg-[length:200%_100%]" />
              <div className="h-3 bg-fog rounded animate-shimmer bg-[length:200%_100%] w-4/5" />
              <div className="h-3 bg-fog rounded animate-shimmer bg-[length:200%_100%] w-3/5" />
            </div>
          ) : detail ? (
            <>
              <div className="text-[14px] text-gray-800 leading-relaxed whitespace-pre-line">
                {detail.content}
              </div>
              {detail.linkText && detail.linkUrl && (
                <a
                  href={detail.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-medium text-emerald-light bg-emerald-pale border border-emerald-pale px-3.5 py-1.5 rounded-full hover:bg-emerald-pale/80 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {detail.linkText} ↗
                </a>
              )}

              {/* Vote row */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleVote('up')}
                  className={[
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all',
                    vote === 'up'
                      ? 'bg-emerald-pale border-emerald-light text-emerald'
                      : 'border-fog-dark bg-fog text-gray-500 hover:border-emerald-light hover:text-emerald',
                  ].join(' ')}
                >
                  👍 Helpful
                </button>
                <button
                  onClick={() => handleVote('down')}
                  className={[
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all',
                    vote === 'down'
                      ? 'bg-red-50 border-red-300 text-red-500'
                      : 'border-fog-dark bg-fog text-gray-500 hover:border-red-300 hover:text-red-500',
                  ].join(' ')}
                >
                  👎 Not relevant
                </button>
                <span className="text-[12px] text-gray-400 ml-1">Was this useful?</span>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}

'use client'

import { useAppStore } from '@/lib/store'
import type { ContextKey } from '@/types'

export function ContextChips() {
  const userContext = useAppStore((s) => s.userContext)
  const removeContextKey = useAppStore((s) => s.removeContextKey)

  const entries = Object.entries(userContext) as [ContextKey, string][]
  if (!entries.length) return null

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-pale border border-emerald/20 text-emerald text-[12px] font-medium"
        >
          <span>{value}</span>
          <button
            onClick={() => removeContextKey(key)}
            className="opacity-40 hover:opacity-100 text-sm leading-none transition-opacity"
            aria-label={`Remove ${key}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { AuthButton } from '@/components/AuthButton/AuthButton'

const WC_START = new Date('2026-06-11T15:00:00Z')
const PROFILE_KEYS = ['team', 'location', 'game', 'interests', 'party'] as const

const FUN_STATS = [
  { icon: '⚽', text: '48 teams competing' },
  { icon: '🏟️', text: 'Lumen Field hosting 6 matches' },
  { icon: '🌍', text: '200+ nations represented' },
  { icon: '🎟️', text: '80,000 fans per match' },
  { icon: '🌧️', text: 'Seattle averages 37" rain/year' },
  { icon: '🦅', text: 'Home of the Sounders & Seahawks' },
]

function useCountdown() {
  const [mounted, setMounted] = useState(false)
  const [diff, setDiff] = useState(0)

  useEffect(() => {
    setDiff(WC_START.getTime() - Date.now())
    setMounted(true)
    const id = setInterval(() => setDiff(WC_START.getTime() - Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const d = Math.max(0, Math.floor(diff / 86400000))
  const h = Math.max(0, Math.floor((diff % 86400000) / 3600000))
  const m = Math.max(0, Math.floor((diff % 3600000) / 60000))
  const s = Math.max(0, Math.floor((diff % 60000) / 1000))
  return { d, h, m, s, started: mounted && diff <= 0, mounted }
}

function Pip({ num, label }: { num: number; label: string }) {
  return (
    <div className="text-center bg-white/[0.07] border border-white/[0.12] rounded-xl px-3.5 py-2 min-w-[54px]">
      <div className="font-display text-[28px] text-gold-light leading-none">
        {String(num).padStart(2, '0')}
      </div>
      <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{label}</div>
    </div>
  )
}

export function Banner() {
  const { d, h, m, s, started, mounted } = useCountdown()
  const userContext = useAppStore((s) => s.userContext)
  const [statIdx, setStatIdx] = useState(0)
  const [statVisible, setStatVisible] = useState(true)

  const filledCount = PROFILE_KEYS.filter((k) => userContext[k]).length
  const pct = Math.round((filledCount / PROFILE_KEYS.length) * 100)

  useEffect(() => {
    const id = setInterval(() => {
      setStatVisible(false)
      setTimeout(() => {
        setStatIdx((i) => (i + 1) % FUN_STATS.length)
        setStatVisible(true)
      }, 300)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  const stat = FUN_STATS[statIdx]

  return (
    <div className="bg-slate text-white">
      <div className="max-w-[1100px] mx-auto px-6 pt-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-display text-[38px] tracking-[2px] text-gold-light leading-none">
              Seattle <span className="text-white">2026</span>
            </div>
            <div className="text-[13px] text-white/50 tracking-[1px] uppercase mt-1">
              Your World Cup Concierge
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <AuthButton />

            {!mounted ? (
              <div className="flex items-end gap-2.5">
                <Pip num={0} label="Days" />
                <span className="font-display text-2xl text-gold pb-2.5">:</span>
                <Pip num={0} label="Hours" />
                <span className="font-display text-2xl text-gold pb-2.5">:</span>
                <Pip num={0} label="Mins" />
                <span className="font-display text-2xl text-gold pb-2.5">:</span>
                <Pip num={0} label="Secs" />
              </div>
            ) : started ? (
              <div className="font-display text-2xl text-gold-light self-center">
                IT&apos;S HAPPENING!
              </div>
            ) : (
              <div className="flex items-end gap-2.5">
                <Pip num={d} label="Days" />
                <span className="font-display text-2xl text-gold pb-2.5">:</span>
                <Pip num={h} label="Hours" />
                <span className="font-display text-2xl text-gold pb-2.5">:</span>
                <Pip num={m} label="Mins" />
                <span className="font-display text-2xl text-gold pb-2.5">:</span>
                <Pip num={s} label="Secs" />
              </div>
            )}
          </div>
        </div>

        {/* Progress strip */}
        <div className="mt-4 pt-3.5 pb-3.5 border-t border-white/10 flex items-center gap-4">
          <span className="text-[11px] text-white/40 uppercase tracking-[0.5px] whitespace-nowrap">
            Profile
          </span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #2d8a58, #f0c96e)',
              }}
            />
          </div>
          <span className="font-display text-[18px] text-gold-light min-w-[40px] text-right">
            {pct}%
          </span>
          <div
            className="text-[12px] text-white/40 pl-4 border-l border-white/10 whitespace-nowrap transition-opacity duration-300"
            style={{ opacity: statVisible ? 1 : 0 }}
          >
            {stat.icon} <span className="text-gold-light font-medium">{stat.text.split(' ')[0]}</span>{' '}
            {stat.text.split(' ').slice(1).join(' ')}
          </div>
        </div>
      </div>
    </div>
  )
}

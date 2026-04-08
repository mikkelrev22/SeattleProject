'use client'

import { useAppStore } from '@/lib/store'

export function Toast() {
  const toastMessage = useAppStore((s) => s.toastMessage)

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate text-white px-5 py-3 rounded-full text-[14px] font-medium z-50 pointer-events-none transition-all duration-300"
      style={{
        opacity: toastMessage ? 1 : 0,
        transform: `translateX(-50%) translateY(${toastMessage ? '0' : '20px'})`,
      }}
    >
      {toastMessage}
    </div>
  )
}

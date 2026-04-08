'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function AuthButton() {
  const { user, loading, signInWithGoogle, signInWithEmail, signOut } = useAuth()
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  if (loading) {
    return (
      <div className="h-9 w-24 rounded-full bg-white/10 animate-pulse" />
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt=""
              className="w-8 h-8 rounded-full border-2 border-gold-light"
            />
          )}
          <span className="text-[13px] text-white/80 hidden sm:block">
            {user.user_metadata?.full_name || user.email}
          </span>
        </div>
        <button
          onClick={signOut}
          className="px-4 py-1.5 rounded-full border border-white/20 text-white/70 text-[12px] hover:border-white/50 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    )
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    const success = await signInWithEmail(email.trim())
    setSending(false)
    if (success) {
      setShowEmailForm(false)
      setEmail('')
    }
  }

  if (showEmailForm) {
    return (
      <form onSubmit={handleEmailSubmit} className="flex items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoFocus
          className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[13px] placeholder:text-white/30 outline-none focus:border-gold-light w-[180px]"
        />
        <button
          type="submit"
          disabled={sending || !email.trim()}
          className="px-4 py-1.5 rounded-full bg-gold-light text-slate text-[12px] font-semibold hover:bg-gold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Sending...' : 'Send Link'}
        </button>
        <button
          type="button"
          onClick={() => { setShowEmailForm(false); setEmail('') }}
          className="text-white/40 hover:text-white/70 text-[18px] leading-none cursor-pointer"
        >
          &times;
        </button>
      </form>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-[13px] font-medium transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </button>
      <button
        onClick={() => setShowEmailForm(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-[13px] font-medium transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
        Email
      </button>
    </div>
  )
}

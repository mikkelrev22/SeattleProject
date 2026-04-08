'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { useAppStore } from '@/lib/store'

const supabase = createBrowserClient()

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { userContext, interactionCount, showToast } = useAppStore()

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Persist context to Supabase when user logs in
  useEffect(() => {
    if (!user) return

    const persistContext = async () => {
      const { error } = await supabase
        .from('user_profiles')
        .upsert(
          {
            id: user.id,
            email: user.email!,
            context: userContext,
            interaction_count: interactionCount,
          },
          { onConflict: 'id' }
        )

      if (error) {
        console.error('Failed to persist user context:', error)
      }
    }

    persistContext()
  }, [user, userContext, interactionCount])

  // Load context from Supabase on login
  const loadUserContext = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('user_profiles')
      .select('context, interaction_count')
      .eq('id', user.id)
      .single()

    if (data && !error) {
      const { setUserContext } = useAppStore.getState()
      const ctx = data.context as Record<string, string>
      for (const [key, value] of Object.entries(ctx)) {
        setUserContext(key as any, value)
      }
    }
  }, [user])

  // Load context when user first appears
  useEffect(() => {
    if (user) loadUserContext()
  }, [user, loadUserContext])

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      showToast('Sign in failed — please try again')
      console.error('OAuth error:', error)
    }
  }, [showToast])

  const signInWithEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      showToast('Failed to send link — please try again')
      console.error('Magic link error:', error)
      return false
    }
    showToast('Check your email for a sign-in link!')
    return true
  }, [showToast])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
    } else {
      showToast('Signed out successfully')
    }
  }, [showToast])

  return { user, loading, signInWithGoogle, signInWithEmail, signOut }
}

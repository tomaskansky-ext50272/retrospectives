import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Retro } from '../types'

/**
 * Hook for fetching and subscribing to a specific retrospective
 * Provides real-time updates via Supabase Realtime
 */
export function useRetro(retroId: string) {
  const [retro, setRetro] = useState<Retro | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!retroId) {
      setLoading(false)
      return
    }

    const fetchRetro = async () => {
      try {
        const { data, error } = await supabase
          .from('retros')
          .select('*')
          .eq('id', retroId)
          .maybeSingle()

        if (error && error.code !== 'PGRST116') throw error
        if (data) {
          setRetro(data)
        }
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch retro')
        setRetro(null)
      } finally {
        setLoading(false)
      }
    }

    fetchRetro()

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchRetro, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [retroId])

  const updatePhase = useCallback(async (phase: string) => {
    if (!retroId) return

    const { error } = await supabase
      .from('retros')
      .update({ current_phase: phase })
      .eq('id', retroId)

    if (error) {
      setError(error.message)
    }
  }, [retroId])

  const completeRetro = useCallback(async () => {
    if (!retroId) return

    const { error } = await supabase
      .from('retros')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', retroId)

    if (error) {
      setError(error.message)
    }
  }, [retroId])

  const resetRetro = useCallback(async () => {
    if (!retroId) return

    try {
      // Delete all cards for this retro
      await supabase.from('cards').delete().eq('retro_id', retroId)

      // Delete all votes for cards in this retro (via cascade)
      // Reset the retro
      const { error } = await supabase
        .from('retros')
        .update({ status: 'active', current_phase: 'praise', completed_at: null })
        .eq('id', retroId)

      if (error) throw error
      
      // Refresh the retro state
      const { data, error: fetchError } = await supabase
        .from('retros')
        .select('*')
        .eq('id', retroId)
        .maybeSingle()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      if (data) setRetro(data)
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset retro')
    }
  }, [retroId])

  return { retro, loading, error, updatePhase, completeRetro, resetRetro }
}

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Retro } from '../types'

/**
 * Hook for fetching the active retrospective (if any exists)
 * Returns null if no active retro is found
 */
export function useActiveRetro() {
  const [retro, setRetro] = useState<Retro | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActiveRetro = async () => {
      try {
        // Get the most recent active retrospective
        const { data, error } = await supabase
          .from('retros')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error && error.code !== 'PGRST116') throw error
        setRetro(data || null)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch active retro')
        setRetro(null)
      } finally {
        setLoading(false)
      }
    }

    fetchActiveRetro()

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchActiveRetro, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const createNewRetro = useCallback(async (title: string = 'Nová retrospektiva'): Promise<Retro | null> => {
    try {
      const newRetro: Retro = {
        id: crypto.randomUUID(),
        title,
        status: 'active',
        current_phase: 'praise',
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('retros').insert(newRetro)

      if (error) throw error

      setRetro(newRetro)
      return newRetro
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create new retro')
      return null
    }
  }, [])

  return { retro, loading, error, createNewRetro }
}

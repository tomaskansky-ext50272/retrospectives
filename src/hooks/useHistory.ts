import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Retro, Card, Vote } from '../types'

export interface HistoryRetro extends Retro {
  cards: Card[]
  votes: Vote[]
  voteStats: {
    praise: number
    improve: number
    action: number
  }
}

/**
 * Hook for fetching completed retrospectives (history)
 */
export function useHistory() {
  const [retros, setRetros] = useState<HistoryRetro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Get all completed retrospectives, ordered by date descending
        const { data: completedRetros, error: retrosError } = await supabase
          .from('retros')
          .select('*')
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })

        if (retrosError) throw retrosError

        // For each retro, fetch its cards and votes
        const historyRetros: HistoryRetro[] = []

        for (const retro of completedRetros || []) {
          const { data: cards, error: cardsError } = await supabase
            .from('cards')
            .select('*')
            .eq('retro_id', retro.id)
            .is('merged_into', null) // Only active cards

          if (cardsError) throw cardsError

          const { data: votes, error: votesError } = await supabase
            .from('votes')
            .select('*')
            .in('card_id', cards?.map(c => c.id) || [])

          if (votesError) throw votesError

          // Calculate vote stats
          const voteStats = {
            praise: cards?.filter(c => c.category === 'praise').reduce((sum, c) => sum + (votes?.filter(v => v.card_id === c.id).length || 0), 0) || 0,
            improve: cards?.filter(c => c.category === 'improve').reduce((sum, c) => sum + (votes?.filter(v => v.card_id === c.id).length || 0), 0) || 0,
            action: cards?.filter(c => c.category === 'action').reduce((sum, c) => sum + (votes?.filter(v => v.card_id === c.id).length || 0), 0) || 0,
          }

          historyRetros.push({
            ...retro,
            cards: cards || [],
            votes: votes || [],
            voteStats,
          })
        }

        setRetros(historyRetros)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch history')
        setRetros([])
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()

    // Poll every 3 seconds
    const interval = setInterval(fetchHistory, 3000)
    return () => clearInterval(interval)
  }, [])

  return { retros, loading, error }
}

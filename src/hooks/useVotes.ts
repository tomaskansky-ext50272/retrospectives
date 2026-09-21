import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Vote } from '../types'
import { MAX_VOTES_PER_CATEGORY } from '../lib/config'

/**
 * Hook for managing votes (dot voting)
 * Tracks votes per voter and prevents exceeding MAX_VOTES_PER_CATEGORY
 */
export function useVotes(retroId: string, voterId: string, _category?: string) {
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!retroId || !voterId) {
      setLoading(false)
      return
    }

    const fetchVotes = async () => {
      try {
        // Get card IDs for this retro first
        const { data: cards, error: cardsError } = await supabase
          .from('cards')
          .select('id')
          .eq('retro_id', retroId)

        if (cardsError) throw cardsError

        const cardIds = cards?.map(c => c.id) || []

        // Then get votes for those cards
        if (cardIds.length > 0) {
          const { data, error } = await supabase
            .from('votes')
            .select('*')
            .in('card_id', cardIds)

          if (error) throw error
          setVotes(data || [])
        } else {
          setVotes([])
        }
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch votes')
        setVotes([])
      } finally {
        setLoading(false)
      }
    }

    fetchVotes()

    // Poll for updates every 2 seconds (fallback until realtime is stable)
    const interval = setInterval(fetchVotes, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [retroId, voterId])

  const getVoteCount = useCallback((cardId: string) => {
    return votes.filter((v) => v.card_id === cardId).length
  }, [votes])

  const getVoterVoteCount = useCallback((cardId: string) => {
    return votes.filter((v) => v.card_id === cardId && v.voter_id === voterId).length
  }, [votes, voterId])

  const getRemainingVotes = useCallback(
    (cardId: string) => {
      // Get all votes by this voter for cards in the same category
      const userVotes = votes.filter((v) => v.voter_id === voterId)
      return MAX_VOTES_PER_CATEGORY - userVotes.length
    },
    [votes, voterId]
  )

  const addVote = useCallback(
    async (cardId: string) => {
      if (!retroId || !voterId) return

      const remaining = getRemainingVotes(cardId)
      if (remaining <= 0) {
        setError(`Vyčerpali jste limit ${MAX_VOTES_PER_CATEGORY} hlasů na kategorii`)
        return
      }

      const { error } = await supabase.from('votes').insert({
        card_id: cardId,
        voter_id: voterId,
      })

      if (error) {
        setError(error.message)
      }
    },
    [retroId, voterId, getRemainingVotes]
  )

  const removeVote = useCallback(
    async (cardId: string) => {
      if (!retroId || !voterId) return

      const voteId = votes.find((v) => v.card_id === cardId && v.voter_id === voterId)?.id

      if (!voteId) return

      const { error } = await supabase.from('votes').delete().eq('id', voteId)

      if (error) {
        setError(error.message)
      }
    },
    [retroId, voterId, votes]
  )

  return {
    votes,
    loading,
    error,
    getVoteCount,
    getVoterVoteCount,
    getRemainingVotes,
    addVote,
    removeVote,
  }
}

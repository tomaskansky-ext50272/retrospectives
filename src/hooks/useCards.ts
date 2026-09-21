import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../types'

/**
 * Hook for fetching and managing cards in a retrospective
 * Filters out merged cards (only shows cards where merged_into is null)
 */
export function useCards(retroId: string, category?: string) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!retroId) {
      setLoading(false)
      return
    }

    const fetchCards = async () => {
      try {
        let query = supabase
          .from('cards')
          .select('*')
          .eq('retro_id', retroId)
          .is('merged_into', null) // Only active cards

        if (category) {
          query = query.eq('category', category)
        }

        const { data, error } = await query.order('created_at', { ascending: true })

        if (error) throw error
        setCards(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cards')
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    fetchCards()

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchCards, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [retroId, category])

  const addCard = useCallback(
    async (text: string, category: string, authorName: string) => {
      if (!retroId) return

      const { error } = await supabase.from('cards').insert({
        retro_id: retroId,
        text,
        category,
        author_name: authorName,
      })

      if (error) {
        setError(error.message)
      }
    },
    [retroId]
  )

  const mergeCards = useCallback(
    async (cardIds: string[], newText: string) => {
      if (!retroId || cardIds.length < 2) return

      try {
        // Use the first card as the merge target
        const targetId = cardIds[0]
        const otherIds = cardIds.slice(1)

        // Update target card
        const { error: updateError } = await supabase
          .from('cards')
          .update({ text: newText })
          .eq('id', targetId)

        if (updateError) throw updateError

        // Mark others as merged into the target
        const { error: mergeError } = await supabase
          .from('cards')
          .update({ merged_into: targetId })
          .in('id', otherIds)

        if (mergeError) throw mergeError

        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to merge cards')
      }
    },
    [retroId]
  )

  return { cards, loading, error, addCard, mergeCards }
}

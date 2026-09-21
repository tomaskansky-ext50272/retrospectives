import React, { useState } from 'react'
import { Card as CardType } from '../types'

interface CardProps {
  card: CardType
  voteCount: number
  voterVoteCount: number
  onVote?: () => Promise<void>
  onRemoveVote?: () => Promise<void>
  remainingVotes: number
}

export default function Card({
  card,
  voteCount,
  voterVoteCount,
  onVote,
  onRemoveVote,
  remainingVotes,
}: CardProps) {
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async () => {
    if (!onVote && !onRemoveVote) return
    if (remainingVotes <= 0 && voterVoteCount === 0) return
    
    setIsVoting(true)
    try {
      if (voterVoteCount > 0 && onRemoveVote) {
        await onRemoveVote()
      } else if (onVote) {
        await onVote()
      }
    } finally {
      setIsVoting(false)
    }
  }

  const isReadOnly = !onVote && !onRemoveVote

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <p className="text-gray-900 font-medium">{card.text}</p>
          <p className="text-xs text-gray-500 mt-1">
            Autor: <span className="font-medium">{card.author_name}</span>
          </p>
        </div>

        <div className="ml-4 text-right">
          <div className="text-2xl font-bold text-indigo-600">{voteCount}</div>
          <p className="text-xs text-gray-500">hlasů</p>
        </div>
      </div>

      <button
        onClick={handleVote}
        disabled={isVoting || isReadOnly || (remainingVotes <= 0 && voterVoteCount === 0)}
        className={`w-full px-3 py-2 rounded-lg font-medium text-sm transition ${
          isReadOnly
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : voterVoteCount > 0
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : remainingVotes > 0
            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isVoting ? '...' : voterVoteCount > 0 ? `Odebrat hlas (${voterVoteCount})` : 'Hlasovat'}
      </button>
    </div>
  )
}

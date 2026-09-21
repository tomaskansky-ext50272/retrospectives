import React, { useState } from 'react'
import { Card as CardType } from '../types'
import Card from './Card'

interface BoardProps {
  title: string
  cards: CardType[]
  category: string
  onAddCard?: (text: string) => Promise<void>
  onVote?: (cardId: string) => Promise<void>
  onRemoveVote?: (cardId: string) => Promise<void>
  onMerge?: (cardIds: string[], newText: string) => Promise<void>
  voteCount: (cardId: string) => number
  voterVoteCount: (cardId: string) => number
  remainingVotes: number
  isAddingCard: boolean
}

export default function Board({
  title,
  cards,
  category: _category,
  onAddCard,
  onVote,
  onRemoveVote,
  onMerge,
  voteCount,
  voterVoteCount,
  remainingVotes,
  isAddingCard,
}: BoardProps) {
  const [newCardText, setNewCardText] = useState('')
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())
  const [showMergeForm, setShowMergeForm] = useState(false)
  const [mergeText, setMergeText] = useState('')

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCardText.trim() || !onAddCard) return

    await onAddCard(newCardText.trim())
    setNewCardText('')
  }

  const handleSelectCard = (cardId: string) => {
    setSelectedCards((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) {
        next.delete(cardId)
      } else {
        next.add(cardId)
      }
      return next
    })
  }

  const handleMerge = async () => {
    if (selectedCards.size < 2 || !mergeText.trim() || !onMerge) return
    
    await onMerge(Array.from(selectedCards), mergeText.trim())
    setSelectedCards(new Set())
    setShowMergeForm(false)
    setMergeText('')
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>

      {/* Cards list */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {cards.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Zatím žádné body...</p>
        ) : (
          cards.map((card) => (
            <div key={card.id} className="flex gap-2">
              {onMerge && (
                <input
                  type="checkbox"
                  checked={selectedCards.has(card.id)}
                  onChange={() => handleSelectCard(card.id)}
                  className="mt-2"
                />
              )}
              <Card
                card={card}
                voteCount={voteCount(card.id)}
                voterVoteCount={voterVoteCount(card.id)}
                onVote={onVote ? () => onVote(card.id) : undefined}
                onRemoveVote={onRemoveVote ? () => onRemoveVote(card.id) : undefined}
                remainingVotes={remainingVotes}
              />
            </div>
          ))
        )}
      </div>

      {/* Merge bar */}
      {onMerge && selectedCards.size >= 2 && !showMergeForm && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-900 font-semibold mb-2">
            Vybralo jsi {selectedCards.size} bodů. Chceš je sloučit?
          </p>
          <button
            onClick={() => setShowMergeForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Sloučit
          </button>
        </div>
      )}

      {/* Merge form */}
      {onMerge && showMergeForm && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nový text pro sloučené body:
          </label>
          <textarea
            value={mergeText}
            onChange={(e) => setMergeText(e.target.value)}
            placeholder="Zadej nový text..."
            className="w-full p-2 border rounded mb-2"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleMerge}
              disabled={!mergeText.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              Sloučit
            </button>
            <button
              onClick={() => {
                setShowMergeForm(false)
                setMergeText('')
              }}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

      {/* Add card form */}
      {onAddCard && (
        <form onSubmit={handleAddCard} className="border-t border-gray-200 pt-4">
          <input
            type="text"
            value={newCardText}
            onChange={(e) => setNewCardText(e.target.value)}
            placeholder="Přidej nový bod..."
            disabled={isAddingCard}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isAddingCard || !newCardText.trim()}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isAddingCard ? 'Přidávám...' : 'Přidat bod'}
          </button>
        </form>
      )}
    </div>
  )
}

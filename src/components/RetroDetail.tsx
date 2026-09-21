import { HistoryRetro } from '../hooks/useHistory'

interface RetroDetailProps {
  retro: HistoryRetro
  onBack: () => void
}

export default function RetroDetail({ retro, onBack }: RetroDetailProps) {
  const completedDate = retro.completed_at ? new Date(retro.completed_at) : null
  const formattedDate = completedDate?.toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const getCardsByCategory = (category: string) => {
    const cards = retro.cards.filter(c => c.category === category)
    return cards.map(card => {
      const voteCount = retro.votes.filter(v => v.card_id === card.id).length
      return { ...card, voteCount }
    })
      .sort((a, b) => b.voteCount - a.voteCount) // Sort by votes descending
  }

  const praises = getCardsByCategory('praise')
  const improves = getCardsByCategory('improve')
  const actions = getCardsByCategory('action')

  const CardItem = ({ card, voteCount }: any) => (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <p className="text-gray-900 font-medium flex-1">{card.text}</p>
        <div className="ml-4 text-right">
          <div className="text-2xl font-bold text-indigo-600">{voteCount}</div>
          <p className="text-xs text-gray-500">hlasů</p>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Autor: <span className="font-medium">{card.author_name}</span>
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="mb-4 px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition inline-block"
            >
              ← Zpět
            </button>
            <h1 className="text-3xl font-bold">{retro.title}</h1>
            <p className="text-indigo-100 text-lg mt-2">
              Uzavřena: <span className="font-semibold">{formattedDate}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-1">{retro.votes.length}</div>
            <p className="text-indigo-100">hlasů celkem</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Praise Column */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Co se povedlo 👏</h2>
              <div className="space-y-3">
                {praises.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Žádné body</p>
                ) : (
                  praises.map(card => <CardItem key={card.id} card={card} voteCount={card.voteCount} />)
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Bodů: <span className="font-semibold">{praises.length}</span>
                  {' | '}
                  Hlasů: <span className="font-semibold text-green-600">{praises.reduce((sum, c) => sum + c.voteCount, 0)}</span>
                </p>
              </div>
            </div>

            {/* Improve Column */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Co se nedaří 📉</h2>
              <div className="space-y-3">
                {improves.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Žádné body</p>
                ) : (
                  improves.map(card => <CardItem key={card.id} card={card} voteCount={card.voteCount} />)
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Bodů: <span className="font-semibold">{improves.length}</span>
                  {' | '}
                  Hlasů: <span className="font-semibold text-yellow-600">{improves.reduce((sum, c) => sum + c.voteCount, 0)}</span>
                </p>
              </div>
            </div>

            {/* Actions Column */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Akční kroky 🎯</h2>
              <div className="space-y-3">
                {actions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Žádné body</p>
                ) : (
                  actions.map(card => <CardItem key={card.id} card={card} voteCount={card.voteCount} />)
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Bodů: <span className="font-semibold">{actions.length}</span>
                  {' | '}
                  Hlasů: <span className="font-semibold text-blue-600">{actions.reduce((sum, c) => sum + c.voteCount, 0)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

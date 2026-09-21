import { HistoryRetro } from '../hooks/useHistory'

interface HistoryViewProps {
  retros: HistoryRetro[]
  loading: boolean
  onSelectRetro: (retro: HistoryRetro) => void
}

export default function HistoryView({ retros, loading, onSelectRetro }: HistoryViewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám historii...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Historické retrospektivy 📋</h1>
        <p className="text-gray-600 mb-8">Přehled všech uzavřených retrospektiv seřazeno od nejnovější</p>

        {retros.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">Zatím žádné uzavřené retrospektivy</p>
          </div>
        ) : (
          <div className="space-y-4">
            {retros.map((retro) => {
              const completedDate = retro.completed_at ? new Date(retro.completed_at) : null
              const formattedDate = completedDate?.toLocaleDateString('cs-CZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })

              const cardCounts = {
                praise: retro.cards.filter(c => c.category === 'praise').length,
                improve: retro.cards.filter(c => c.category === 'improve').length,
                action: retro.cards.filter(c => c.category === 'action').length,
              }

              return (
                <button
                  key={retro.id}
                  onClick={() => onSelectRetro(retro)}
                  className="w-full bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition text-left"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{retro.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Uzavřena: <span className="font-medium">{formattedDate}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">{retro.votes.length}</div>
                      <p className="text-xs text-gray-500">hlasů</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded p-3">
                      <div className="text-sm font-medium text-green-900">Succesy</div>
                      <div className="text-2xl font-bold text-green-600">{cardCounts.praise}</div>
                      <div className="text-xs text-green-600">👏 hlasů: {retro.voteStats.praise}</div>
                    </div>

                    <div className="bg-yellow-50 rounded p-3">
                      <div className="text-sm font-medium text-yellow-900">Zlepšení</div>
                      <div className="text-2xl font-bold text-yellow-600">{cardCounts.improve}</div>
                      <div className="text-xs text-yellow-600">📉 hlasů: {retro.voteStats.improve}</div>
                    </div>

                    <div className="bg-blue-50 rounded p-3">
                      <div className="text-sm font-medium text-blue-900">Akce</div>
                      <div className="text-2xl font-bold text-blue-600">{cardCounts.action}</div>
                      <div className="text-xs text-blue-600">🎯 hlasů: {retro.voteStats.action}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

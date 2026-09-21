interface HomePageProps {
  hasActiveRetro: boolean
  onContinue: () => void
  onNewRetro: () => void
  onViewHistory: () => void
}

export default function HomePage({
  hasActiveRetro,
  onContinue,
  onNewRetro,
  onViewHistory,
}: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">🎯 Retrospektiva</h1>
          <p className="text-indigo-100 text-xl">Spravuj zpětnou vazbu a akční kroky tvého týmu</p>
        </div>

        <div className="space-y-4">
          {/* Continue Button */}
          {hasActiveRetro && (
            <button
              onClick={onContinue}
              className="w-full bg-white text-indigo-600 font-bold py-4 px-6 rounded-lg hover:bg-indigo-50 transition shadow-lg hover:shadow-xl text-lg"
            >
              ▶ Pokračovat v aktuální retrospektivě
            </button>
          )}

          {/* New Retro Button */}
          <button
            onClick={onNewRetro}
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-4 px-6 rounded-lg transition shadow-lg hover:shadow-xl text-lg"
          >
            ✨ Nová retrospektiva
          </button>

          {/* History Button */}
          <button
            onClick={onViewHistory}
            className="w-full bg-indigo-400 hover:bg-indigo-300 text-white font-bold py-4 px-6 rounded-lg transition shadow-lg hover:shadow-xl text-lg"
          >
            📋 Historické retrospektivy
          </button>
        </div>

        <div className="mt-12 bg-white bg-opacity-10 rounded-lg p-6 text-white">
          <h3 className="font-semibold mb-3">Jak to funguje:</h3>
          <ul className="space-y-2 text-sm text-indigo-100">
            <li>✅ Přidávej body: Co se povedlo, co se nedaří, akční kroky</li>
            <li>⭐ Hlasuj: Každý může přidělit až 3 hlasy na body</li>
            <li>🔄 Sleduj historii: Archiv všech uzavřených retrospektiv</li>
            <li>📊 Analýza: Vidíš trendy a prioritní akce</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

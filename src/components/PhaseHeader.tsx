import { PHASE_LABELS } from '../lib/config'

interface PhaseHeaderProps {
  currentPhase: string
  onNextPhase: () => void
  retroStatus: 'active' | 'completed'
  onComplete: () => void
  onReset?: () => void
}

export default function PhaseHeader({
  currentPhase,
  onNextPhase,
  retroStatus,
  onComplete,
  onReset,
}: PhaseHeaderProps) {
  const isLastPhase = currentPhase === 'done'
  const phaseName = PHASE_LABELS[currentPhase] || currentPhase

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-6 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">🎯 Retrospektiva</h1>
          <p className="text-indigo-100 text-lg">
            Aktuální fáze: <span className="font-semibold">{phaseName}</span>
          </p>
        </div>

        <div className="flex gap-3">
          {!isLastPhase && retroStatus === 'active' && (
            <button
              onClick={onNextPhase}
              className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition"
            >
              Pokračovat →
            </button>
          )}

          {isLastPhase && retroStatus === 'active' && (
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
            >
              Uzavřít retrospektivu ✓
            </button>
          )}

          {retroStatus === 'completed' && (
            <button
              onClick={onReset}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition"
            >
              Nová retrospektiva 🔄
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

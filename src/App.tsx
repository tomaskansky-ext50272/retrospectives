import { useState, useEffect } from 'react'
import { NameEntryModal, PhaseHeader, Board, HomePage, HistoryView, RetroDetail } from './components'
import { useParticipant, useActiveRetro, useRetro, useCards, useVotes, useHistory } from './hooks'

type AppView = 'home' | 'active' | 'history' | 'detail'

export default function App() {
  const { name, participantId, isInitialized, updateName } = useParticipant()
  const [showNameModal, setShowNameModal] = useState(false)
  const [view, setView] = useState<AppView>('home')
  const [selectedHistoryRetro, setSelectedHistoryRetro] = useState<any>(null)
  
  // Load active retro from database
  const { retro: activeRetro, loading: activeRetroLoading, createNewRetro } = useActiveRetro()
  
  // Use active retro ID if available
  const currentRetroId = activeRetro?.id || ''
  
  const { retro, loading: retroLoading, updatePhase, completeRetro } = useRetro(currentRetroId)
  const { retros: historyRetros, loading: historyLoading } = useHistory()
  
  // Hooks for each category (only load if we have a retro ID)
  const praises = useCards(currentRetroId, 'praise')
  const improves = useCards(currentRetroId, 'improve')
  const actions = useCards(currentRetroId, 'action')
  
  const praiseVotes = useVotes(currentRetroId, participantId, 'praise')
  const improveVotes = useVotes(currentRetroId, participantId, 'improve')
  const actionVotes = useVotes(currentRetroId, participantId, 'action')

  // Show name modal if not initialized
  useEffect(() => {
    if (isInitialized && !name) {
      setShowNameModal(true)
    }
  }, [isInitialized, name])

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám...</p>
        </div>
      </div>
    )
  }

  if (showNameModal) {
    return (
      <NameEntryModal
        onSubmit={(newName) => {
          updateName(newName)
          setShowNameModal(false)
        }}
      />
    )
  }

  // Home view - choose action
  if (view === 'home') {
    return (
      <HomePage
        hasActiveRetro={activeRetro?.status === 'active'}
        onContinue={() => setView('active')}
        onNewRetro={async () => {
          await createNewRetro()
          setView('active')
        }}
        onViewHistory={() => setView('history')}
      />
    )
  }

  // History view - show list
  if (view === 'history') {
    return (
      <>
        <HistoryView
          retros={historyRetros}
          loading={historyLoading}
          onSelectRetro={(selectedRetro) => {
            setSelectedHistoryRetro(selectedRetro)
            setView('detail')
          }}
        />
        <button
          onClick={() => setView('home')}
          className="fixed bottom-6 right-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition shadow-lg"
        >
          ← Zpět na úvodní
        </button>
      </>
    )
  }

  // Detail view - show single retro
  if (view === 'detail' && selectedHistoryRetro) {
    return (
      <RetroDetail
        retro={selectedHistoryRetro}
        onBack={() => setView('history')}
      />
    )
  }

  // Active view - current retrospective
  if (view === 'active') {
    if (activeRetroLoading || retroLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Načítám retrospektivu...</p>
          </div>
        </div>
      )
    }

    if (!activeRetro) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <p className="text-red-600 font-semibold">Nepodařilo se načíst retrospektivu</p>
            <button
              onClick={() => setView('home')}
              className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              ← Zpět
            </button>
          </div>
        </div>
      )
    }

    // Show completion screen if retro is completed
    if (activeRetro.status === 'completed') {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <PhaseHeader
            currentPhase={activeRetro.current_phase}
            onNextPhase={() => {}}
            retroStatus={activeRetro.status}
            onComplete={() => {}}
            onReset={() => {
              setView('home')
            }}
          />
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-lg p-12 text-center max-w-md">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Retrospektiva uzavřena
              </h2>
              <p className="text-gray-600 mb-8">
                Děkujeme za účast! Tato retrospektiva bude sloužit jako podklad pro příští období.
              </p>
              <button
                onClick={() => {
                  setView('home')
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
              >
                Zpět na úvodní 🔄
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Active retrospective workflow
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PhaseHeader
          currentPhase={activeRetro.current_phase}
          onNextPhase={() => {
            const phases = ['previous_actions', 'praise', 'improve', 'actions', 'done']
            const currentIndex = phases.indexOf(activeRetro.current_phase)
            if (currentIndex < phases.length - 1) {
              updatePhase(phases[currentIndex + 1])
            }
          }}
          retroStatus={activeRetro.status}
          onComplete={completeRetro}
          onReset={() => {
            setView('home')
          }}
        />

        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-4 text-sm text-gray-600">
              <p>Účastník: <span className="font-semibold text-gray-900">{name}</span></p>
            </div>

            {/* Three-column grid - progressive activation from left to right */}
            {activeRetro.current_phase === 'previous_actions' && (
              <Board
                title="Výsledky minulých akcí 📋"
                cards={actions.cards}
                category="action"
                onAddCard={(text) => actions.addCard(text, 'action', name)}
                onVote={(cardId) => actionVotes.addVote(cardId)}
                onRemoveVote={(cardId) => actionVotes.removeVote(cardId)}
                onMerge={(cardIds, newText) => actions.mergeCards(cardIds, newText)}
                voteCount={actionVotes.getVoteCount}
                voterVoteCount={actionVotes.getVoterVoteCount}
                remainingVotes={actionVotes.getRemainingVotes('')}
                isAddingCard={actions.loading}
              />
            )}

            {['praise', 'improve', 'actions', 'done'].includes(activeRetro.current_phase) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Praise - Active from 'praise' phase */}
                <div className={activeRetro.current_phase === 'praise' ? '' : 'opacity-60'}>
                  <Board
                    title="Co se povedlo 👏"
                    cards={praises.cards}
                    category="praise"
                    onAddCard={activeRetro.current_phase === 'praise' ? (text) => praises.addCard(text, 'praise', name) : undefined}
                    onVote={activeRetro.current_phase === 'praise' ? (cardId) => praiseVotes.addVote(cardId) : undefined}
                    onRemoveVote={activeRetro.current_phase === 'praise' ? (cardId) => praiseVotes.removeVote(cardId) : undefined}
                    onMerge={activeRetro.current_phase === 'praise' ? (cardIds, newText) => praises.mergeCards(cardIds, newText) : undefined}
                    voteCount={praiseVotes.getVoteCount}
                    voterVoteCount={praiseVotes.getVoterVoteCount}
                    remainingVotes={praiseVotes.getRemainingVotes('')}
                    isAddingCard={praises.loading}
                  />
                </div>

                {/* Column 2: Improve - Active from 'improve' phase */}
                <div className={['improve', 'actions', 'done'].includes(activeRetro.current_phase) ? '' : 'opacity-30 pointer-events-none'}>
                  <Board
                    title="Co se nedaří 📉"
                    cards={improves.cards}
                    category="improve"
                    onAddCard={activeRetro.current_phase === 'improve' ? (text) => improves.addCard(text, 'improve', name) : undefined}
                    onVote={activeRetro.current_phase === 'improve' ? (cardId) => improveVotes.addVote(cardId) : undefined}
                    onRemoveVote={activeRetro.current_phase === 'improve' ? (cardId) => improveVotes.removeVote(cardId) : undefined}
                    onMerge={activeRetro.current_phase === 'improve' ? (cardIds, newText) => improves.mergeCards(cardIds, newText) : undefined}
                    voteCount={improveVotes.getVoteCount}
                    voterVoteCount={improveVotes.getVoterVoteCount}
                    remainingVotes={improveVotes.getRemainingVotes('')}
                    isAddingCard={improves.loading}
                  />
                </div>

                {/* Column 3: Actions - Active from 'actions' phase */}
                <div className={['actions', 'done'].includes(activeRetro.current_phase) ? '' : 'opacity-30 pointer-events-none'}>
                  <Board
                    title="Akční kroky 🎯"
                    cards={actions.cards}
                    category="action"
                    onAddCard={activeRetro.current_phase === 'actions' ? (text) => actions.addCard(text, 'action', name) : undefined}
                    onVote={activeRetro.current_phase === 'actions' ? (cardId) => actionVotes.addVote(cardId) : undefined}
                    onRemoveVote={activeRetro.current_phase === 'actions' ? (cardId) => actionVotes.removeVote(cardId) : undefined}
                    onMerge={activeRetro.current_phase === 'actions' ? (cardIds, newText) => actions.mergeCards(cardIds, newText) : undefined}
                    voteCount={actionVotes.getVoteCount}
                    voterVoteCount={actionVotes.getVoterVoteCount}
                    remainingVotes={actionVotes.getRemainingVotes('')}
                    isAddingCard={actions.loading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Fallback (shouldn't reach here)
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-gray-600">Neznámý stav aplikace</p>
    </div>
  )
}

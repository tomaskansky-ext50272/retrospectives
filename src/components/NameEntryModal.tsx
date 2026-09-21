import { useState } from 'react'

interface NameEntryModalProps {
  onSubmit: (name: string) => void
}

export default function NameEntryModal({ onSubmit }: NameEntryModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Prosím zadej své jméno')
      return
    }

    if (trimmedName.length < 2) {
      setError('Jméno musí mít alespoň 2 znaky')
      return
    }

    onSubmit(trimmedName)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vítej v retrospektivě! 👋
        </h2>
        
        <p className="text-gray-600 mb-6">
          Aby ses mohl/a participovat, musíš zadať své jméno.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Tvoje jméno
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError('')
              }}
              placeholder="Např. Jan Nováč"
              autoFocus
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Pokračovat
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-6 text-center">
          Tvoje jméno bude viditelné ostatním v retrospektivě.
        </p>
      </div>
    </div>
  )
}

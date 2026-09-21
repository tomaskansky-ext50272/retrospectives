import { useEffect, useState, useCallback } from 'react'

/**
 * Hook for managing participant identity
 * Stores name and generates/retrieves random participant_id from localStorage
 */
export function useParticipant() {
  const [name, setName] = useState<string>('')
  const [participantId, setParticipantId] = useState<string>('')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Try to get existing participant ID from localStorage
    let storedId = localStorage.getItem('participant_id')
    let storedName = localStorage.getItem('participant_name')

    // If not found, generate new ID
    if (!storedId) {
      storedId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('participant_id', storedId)
    }

    setParticipantId(storedId)
    if (storedName) {
      setName(storedName)
    }
    setIsInitialized(true)
  }, [])

  const updateName = useCallback((newName: string) => {
    setName(newName)
    localStorage.setItem('participant_name', newName)
  }, [])

  return { name, participantId, isInitialized, updateName }
}

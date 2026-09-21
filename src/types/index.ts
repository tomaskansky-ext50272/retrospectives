// Database types matching ARCHITECTURE.md schema

export interface Retro {
  id: string
  title: string
  status: 'active' | 'completed'
  current_phase: 'previous_actions' | 'praise' | 'improve' | 'actions' | 'done'
  created_at: string
  completed_at?: string
}

export interface PhaseTimer {
  id: string
  retro_id: string
  phase: string
  duration_seconds: number
  started_at: string
}

export interface Card {
  id: string
  retro_id: string
  category: 'praise' | 'improve' | 'action'
  text: string
  author_name: string
  merged_into?: string
  created_at: string
}

export interface Vote {
  id: string
  card_id: string
  voter_id: string
  created_at: string
}

export interface ActionItem {
  id: string
  retro_id: string
  source_card_id?: string
  text: string
  status: 'open' | 'done' | 'carried_over'
  carried_from_retro_id?: string
  created_at: string
}

// UI types

export interface Participant {
  id: string
  name: string
}

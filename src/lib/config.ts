// Configuration constants for the retrospectives application

export const MAX_VOTES_PER_CATEGORY = 3

export const PHASES = {
  PREVIOUS_ACTIONS: 'previous_actions',
  PRAISE: 'praise',
  IMPROVE: 'improve',
  ACTIONS: 'actions',
  DONE: 'done',
} as const

export const PHASE_LABELS: Record<string, string> = {
  previous_actions: 'Akční kroky z minula',
  praise: 'Co se povedlo',
  improve: 'Co se nedaří',
  actions: 'Akční kroky na další období',
  done: 'Uzavření',
}

export const CARD_CATEGORIES = {
  PRAISE: 'praise',
  IMPROVE: 'improve',
  ACTION: 'action',
} as const

export const ACTION_STATUS = {
  OPEN: 'open',
  DONE: 'done',
  CARRIED_OVER: 'carried_over',
} as const

-- Initialize retrospectives database schema
-- This migration sets up all tables needed for the retrospectives application

-- Retros table: One retrospective session
CREATE TABLE retros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  current_phase TEXT NOT NULL DEFAULT 'previous_actions' CHECK (
    current_phase IN ('previous_actions', 'praise', 'improve', 'actions', 'done')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Phase timers: Countdown for each phase (configurable duration, shared across all participants)
CREATE TABLE phase_timers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retro_id UUID NOT NULL REFERENCES retros(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  duration_seconds INT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cards: Individual feedback items in categories (praise/improve/action)
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retro_id UUID NOT NULL REFERENCES retros(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('praise', 'improve', 'action')),
  text TEXT NOT NULL,
  author_name TEXT NOT NULL,
  merged_into UUID REFERENCES cards(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Votes: Dot voting system (3 votes per person per category)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL, -- random ID from localStorage, not personal data
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Action items: Tracked action items with state across retros
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retro_id UUID NOT NULL REFERENCES retros(id) ON DELETE CASCADE,
  source_card_id UUID REFERENCES cards(id),
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'carried_over')),
  carried_from_retro_id UUID REFERENCES retros(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX idx_cards_retro_id ON cards(retro_id);
CREATE INDEX idx_votes_card_id ON votes(card_id);
CREATE INDEX idx_votes_voter_id ON votes(voter_id);
CREATE INDEX idx_action_items_retro_id ON action_items(retro_id);
CREATE INDEX idx_action_items_status ON action_items(status);

-- Row Level Security (RLS) - for now, allow all anonymous access
-- This is intentional for first version: internal tool with no sensitive data
-- Comment: This is a conscious simplification for MVP. If auth is added later, RLS policies must be updated.
ALTER TABLE retros ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Permissive policies for MVP (allow all operations)
CREATE POLICY "retros_read" ON retros FOR SELECT USING (true);
CREATE POLICY "retros_insert" ON retros FOR INSERT WITH CHECK (true);
CREATE POLICY "retros_update" ON retros FOR UPDATE USING (true);
CREATE POLICY "retros_delete" ON retros FOR DELETE USING (true);

CREATE POLICY "cards_read" ON cards FOR SELECT USING (true);
CREATE POLICY "cards_insert" ON cards FOR INSERT WITH CHECK (true);
CREATE POLICY "cards_update" ON cards FOR UPDATE USING (true);
CREATE POLICY "cards_delete" ON cards FOR DELETE USING (true);

CREATE POLICY "votes_read" ON votes FOR SELECT USING (true);
CREATE POLICY "votes_insert" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "votes_delete" ON votes FOR DELETE USING (true);

CREATE POLICY "phase_timers_read" ON phase_timers FOR SELECT USING (true);
CREATE POLICY "phase_timers_insert" ON phase_timers FOR INSERT WITH CHECK (true);
CREATE POLICY "phase_timers_update" ON phase_timers FOR UPDATE USING (true);
CREATE POLICY "phase_timers_delete" ON phase_timers FOR DELETE USING (true);

CREATE POLICY "action_items_read" ON action_items FOR SELECT USING (true);
CREATE POLICY "action_items_insert" ON action_items FOR INSERT WITH CHECK (true);
CREATE POLICY "action_items_update" ON action_items FOR UPDATE USING (true);
CREATE POLICY "action_items_delete" ON action_items FOR DELETE USING (true);

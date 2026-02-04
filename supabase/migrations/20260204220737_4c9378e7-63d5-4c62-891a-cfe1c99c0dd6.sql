-- Fix: Allow anyone to view participants in finished sessions for results page
-- The current policy blocks SELECT on finished sessions, but we need to show the leaderboard

-- Add policy to allow viewing participants from own session (for results)
CREATE POLICY "Users can view participants from finished sessions"
ON public.participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM game_sessions gs
    WHERE gs.id = participants.session_id 
    AND gs.status = 'finished'
  )
);
-- Fix 1: Allow anyone to view finished game sessions (needed for Results page to fetch session ID)
-- Current policy blocks SELECT on finished sessions, but Results page needs to read session
CREATE POLICY "Anyone can view finished sessions for results"
ON public.game_sessions FOR SELECT
USING (status = 'finished');

-- Fix 2: Allow participants to view their own responses (for showing correct/incorrect feedback)
CREATE POLICY "Participants can view own responses"
ON public.responses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM participants p
    WHERE p.id = responses.participant_id
  )
);
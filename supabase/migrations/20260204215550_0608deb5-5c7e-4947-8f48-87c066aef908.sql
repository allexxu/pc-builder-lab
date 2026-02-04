-- Fix RLS policies for quiz game to allow unauthenticated participants

-- Drop existing restrictive policy for responses
DROP POLICY IF EXISTS "Anyone can submit responses in active games" ON public.responses;

-- Create permissive policy that allows response submission based on valid participant_id
CREATE POLICY "Anyone can submit responses in active games"
ON public.responses FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM participants p
    JOIN game_sessions gs ON gs.id = p.session_id
    WHERE p.id = responses.participant_id 
    AND gs.status IN ('question', 'active')
  )
);

-- Add policy for participants to update their own score in active games
DROP POLICY IF EXISTS "Anyone can update participant score in active games" ON public.participants;

CREATE POLICY "Anyone can update participant score in active games"
ON public.participants FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM game_sessions gs
    WHERE gs.id = participants.session_id 
    AND gs.status != 'finished'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM game_sessions gs
    WHERE gs.id = participants.session_id 
    AND gs.status != 'finished'
  )
);

-- Create atomic score increment function to avoid race conditions
CREATE OR REPLACE FUNCTION public.increment_participant_score(
  p_participant_id uuid,
  p_points integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE participants 
  SET total_score = total_score + p_points
  WHERE id = p_participant_id;
END;
$$;
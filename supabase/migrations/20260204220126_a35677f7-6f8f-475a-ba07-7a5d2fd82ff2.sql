-- Fix: Allow anyone to read their own participant row after joining
-- This is needed because .insert().select().single() requires SELECT permission

-- First drop the restrictive "Authenticated users" SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view participants in active sessions" ON public.participants;

-- Create a more permissive SELECT policy for participants in active sessions
-- This allows anyone (including anonymous users) to view participants in active game sessions
CREATE POLICY "Anyone can view participants in active sessions"
ON public.participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM game_sessions gs
    WHERE gs.id = participants.session_id 
    AND gs.status != 'finished'
  )
);
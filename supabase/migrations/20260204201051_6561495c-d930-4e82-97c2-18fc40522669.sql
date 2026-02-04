-- =====================================================
-- FIX 1: Restrict user_stats to authenticated users only
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view stats for leaderboard" ON public.user_stats;

CREATE POLICY "Authenticated users can view stats for leaderboard"
ON public.user_stats
FOR SELECT
TO authenticated
USING (true);

-- =====================================================
-- FIX 2: Restrict game_history to authenticated users only
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view scores for leaderboard" ON public.game_history;

CREATE POLICY "Authenticated users can view completed games for leaderboard"
ON public.game_history
FOR SELECT
TO authenticated
USING (completed = true);

-- =====================================================
-- FIX 3: Fix answers policies - verify quiz ownership
-- =====================================================
DROP POLICY IF EXISTS "Allow answer insert for question creators" ON public.answers;
DROP POLICY IF EXISTS "Allow answer update for question creators" ON public.answers;
DROP POLICY IF EXISTS "Allow answer delete for question creators" ON public.answers;

CREATE POLICY "Quiz creators can insert answers"
ON public.answers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM questions q
    JOIN quizzes qz ON qz.id = q.quiz_id
    WHERE q.id = answers.question_id 
    AND qz.created_by = auth.uid()
  )
);

CREATE POLICY "Quiz creators can update answers"
ON public.answers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM questions q
    JOIN quizzes qz ON qz.id = q.quiz_id
    WHERE q.id = answers.question_id 
    AND qz.created_by = auth.uid()
  )
);

CREATE POLICY "Quiz creators can delete answers"
ON public.answers
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM questions q
    JOIN quizzes qz ON qz.id = q.quiz_id
    WHERE q.id = answers.question_id 
    AND qz.created_by = auth.uid()
  )
);

-- =====================================================
-- FIX 4: Fix questions policies - verify quiz ownership
-- =====================================================
DROP POLICY IF EXISTS "Allow question insert for quiz creators" ON public.questions;
DROP POLICY IF EXISTS "Allow question update for quiz creators" ON public.questions;
DROP POLICY IF EXISTS "Allow question delete for quiz creators" ON public.questions;

CREATE POLICY "Quiz creators can insert questions"
ON public.questions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM quizzes q
    WHERE q.id = questions.quiz_id 
    AND q.created_by = auth.uid()
  )
);

CREATE POLICY "Quiz creators can update questions"
ON public.questions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    WHERE q.id = questions.quiz_id 
    AND q.created_by = auth.uid()
  )
);

CREATE POLICY "Quiz creators can delete questions"
ON public.questions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    WHERE q.id = questions.quiz_id 
    AND q.created_by = auth.uid()
  )
);

-- =====================================================
-- FIX 5: Restrict participants view to authenticated users
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view participants in active sessions" ON public.participants;

CREATE POLICY "Authenticated users can view participants in active sessions"
ON public.participants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM game_sessions gs
    WHERE gs.id = participants.session_id 
    AND gs.status <> 'finished'::game_status
  )
);

-- =====================================================
-- FIX 6: Restrict game_sessions view to authenticated users
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view active sessions by PIN" ON public.game_sessions;

CREATE POLICY "Authenticated users can view active sessions"
ON public.game_sessions
FOR SELECT
TO authenticated
USING (status <> 'finished'::game_status);

-- =====================================================
-- FIX 7: Fix responses policy - verify participant ownership
-- =====================================================
DROP POLICY IF EXISTS "Participants can view own responses" ON public.responses;

-- Note: participants table doesn't have user_id, so we keep session creator access
-- The policy "Session creators can view all responses" already exists and is correct
-- Drop old policies that require auth
DROP POLICY IF EXISTS "Teachers can manage own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Teachers can manage own sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Teachers can view session participants" ON public.participants;
DROP POLICY IF EXISTS "Anyone can view participants in session" ON public.participants;
DROP POLICY IF EXISTS "Teacher can view responses for own sessions" ON public.responses;

-- Create new policies for teacher access (simplified for single teacher mode)
CREATE POLICY "Allow all quiz operations"
  ON public.quizzes FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all session operations"
  ON public.game_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow viewing participants"
  ON public.participants FOR SELECT
  USING (true);

CREATE POLICY "Allow participant updates"
  ON public.participants FOR UPDATE
  USING (true);

CREATE POLICY "Allow viewing responses"
  ON public.responses FOR SELECT
  USING (true);
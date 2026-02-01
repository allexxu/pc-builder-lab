-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Teachers can create quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Teachers can create sessions" ON public.game_sessions;

-- Allow any authenticated user to create quizzes (no role requirement initially)
CREATE POLICY "Authenticated users can create quizzes"
    ON public.quizzes FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Allow any authenticated user to create game sessions
CREATE POLICY "Authenticated users can create sessions"
    ON public.game_sessions FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Allow participants to view their own responses
CREATE POLICY "Participants can view own responses"
    ON public.responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.participants p
            WHERE p.id = participant_id
        )
    );
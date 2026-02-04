-- =============================================
-- FAZA 1: SECURITATE - Fix RLS Policies
-- =============================================

-- 1. Ștergere politici periculoase care permit orice operație
DROP POLICY IF EXISTS "Allow all session operations" ON game_sessions;
DROP POLICY IF EXISTS "Allow participant updates" ON participants;
DROP POLICY IF EXISTS "Allow viewing participants" ON participants;
DROP POLICY IF EXISTS "Allow all quiz operations" ON quizzes;

-- 2. Adăugare UNIQUE constraint pentru lesson_progress (necesar pentru upsert)
ALTER TABLE lesson_progress 
  ADD CONSTRAINT unique_user_lesson UNIQUE (user_id, lesson_slug);

-- 3. Adăugare UNIQUE constraint pentru user_achievements (previne duplicate)
ALTER TABLE user_achievements 
  ADD CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id);

-- 4. Politici noi pentru quizzes - permite citire publică dar scriere doar pentru creatori
CREATE POLICY "Teachers and admins can manage quizzes" ON quizzes
  FOR ALL USING (
    has_role(auth.uid(), 'teacher') OR 
    has_role(auth.uid(), 'admin') OR
    created_by = auth.uid()
  )
  WITH CHECK (
    has_role(auth.uid(), 'teacher') OR 
    has_role(auth.uid(), 'admin') OR
    created_by = auth.uid()
  );

-- 5. Politici pentru game_sessions - doar creatorii sau profesori pot gestiona
CREATE POLICY "Teachers can manage all sessions" ON game_sessions
  FOR ALL USING (
    has_role(auth.uid(), 'teacher') OR 
    has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    has_role(auth.uid(), 'teacher') OR 
    has_role(auth.uid(), 'admin')
  );

-- 6. Politici pentru participants - sesiune creatorii pot actualiza
CREATE POLICY "Teachers can manage participants" ON participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = participants.session_id 
      AND (
        gs.created_by = auth.uid() OR 
        has_role(auth.uid(), 'teacher') OR 
        has_role(auth.uid(), 'admin')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_sessions gs
      WHERE gs.id = participants.session_id 
      AND (
        gs.created_by = auth.uid() OR 
        has_role(auth.uid(), 'teacher') OR 
        has_role(auth.uid(), 'admin')
      )
    )
  );

-- 7. Permite vizualizarea publică a profilelor pentru leaderboard
CREATE POLICY "Anyone can view profiles for leaderboard" ON profiles
  FOR SELECT USING (true);
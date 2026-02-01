-- Remove the foreign key constraint on quizzes.created_by since we don't use Supabase auth
ALTER TABLE public.quizzes DROP CONSTRAINT IF EXISTS quizzes_created_by_fkey;

-- Also remove constraint on game_sessions
ALTER TABLE public.game_sessions DROP CONSTRAINT IF EXISTS game_sessions_created_by_fkey;
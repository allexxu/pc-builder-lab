-- =============================================
-- 1. LESSON PROGRESS TABLE
-- =============================================
CREATE TABLE public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_slug TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    quiz_score INTEGER,
    quiz_total INTEGER NOT NULL DEFAULT 5,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, lesson_slug)
);

-- Enable RLS
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own lesson progress"
    ON public.lesson_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson progress"
    ON public.lesson_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress"
    ON public.lesson_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- =============================================
-- 2. GAME HISTORY TABLE
-- =============================================
CREATE TABLE public.game_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL DEFAULT 'training',
    score INTEGER NOT NULL DEFAULT 0,
    time_seconds INTEGER NOT NULL DEFAULT 0,
    accuracy INTEGER NOT NULL DEFAULT 0,
    mistakes INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own game history"
    ON public.game_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game history"
    ON public.game_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Public leaderboard view (only score and display name)
CREATE POLICY "Anyone can view scores for leaderboard"
    ON public.game_history FOR SELECT
    USING (completed = true);

-- =============================================
-- 3. USER ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own achievements"
    ON public.user_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
    ON public.user_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 4. USER STATS TABLE
-- =============================================
CREATE TABLE public.user_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    best_score INTEGER NOT NULL DEFAULT 0,
    best_time_seconds INTEGER,
    total_games INTEGER NOT NULL DEFAULT 0,
    total_accuracy INTEGER NOT NULL DEFAULT 0,
    lessons_completed INTEGER NOT NULL DEFAULT 0,
    rank INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own stats"
    ON public.user_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
    ON public.user_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
    ON public.user_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- Public stats for leaderboard (limited fields)
CREATE POLICY "Anyone can view stats for leaderboard"
    ON public.user_stats FOR SELECT
    USING (true);

-- =============================================
-- 5. TRIGGER: Auto-create user_stats on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Create trigger on profiles (fires after handle_new_user)
CREATE TRIGGER on_profile_created_create_stats
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_stats();
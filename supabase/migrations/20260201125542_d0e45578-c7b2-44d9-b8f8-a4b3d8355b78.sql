-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'user');

-- Create enum for game session status
CREATE TYPE public.game_status AS ENUM ('waiting', 'active', 'question', 'results', 'finished');

-- Create profiles table for authenticated users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create quizzes table
CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    order_num INTEGER NOT NULL DEFAULT 1,
    time_limit INTEGER NOT NULL DEFAULT 20 CHECK (time_limit >= 5 AND time_limit <= 60),
    max_points INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create answers table
CREATE TABLE public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    order_num INTEGER NOT NULL DEFAULT 1 CHECK (order_num >= 1 AND order_num <= 4)
);

-- Create game_sessions table
CREATE TABLE public.game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    game_pin TEXT NOT NULL UNIQUE,
    status game_status NOT NULL DEFAULT 'waiting',
    current_question INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participants table (students joining games)
CREATE TABLE public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
    nickname TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    total_score INTEGER NOT NULL DEFAULT 0
);

-- Create responses table (student answers)
CREATE TABLE public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    answer_id UUID REFERENCES public.answers(id) ON DELETE SET NULL,
    response_time INTEGER NOT NULL DEFAULT 0,
    points_earned INTEGER NOT NULL DEFAULT 0,
    answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (participant_id, question_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
    RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON public.quizzes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for user_roles (only admins can manage, users can view own)
CREATE POLICY "Users can view own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for quizzes
CREATE POLICY "Anyone can view published quizzes"
    ON public.quizzes FOR SELECT
    USING (is_published = true);

CREATE POLICY "Creators can view own quizzes"
    ON public.quizzes FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Teachers can create quizzes"
    ON public.quizzes FOR INSERT
    WITH CHECK (
        auth.uid() = created_by AND
        (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'))
    );

CREATE POLICY "Creators can update own quizzes"
    ON public.quizzes FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete own quizzes"
    ON public.quizzes FOR DELETE
    USING (auth.uid() = created_by);

-- RLS Policies for questions
CREATE POLICY "Anyone can view questions of published quizzes"
    ON public.questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = quiz_id AND (q.is_published = true OR q.created_by = auth.uid())
        )
    );

CREATE POLICY "Creators can manage questions"
    ON public.questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = quiz_id AND q.created_by = auth.uid()
        )
    );

-- RLS Policies for answers
CREATE POLICY "Anyone can view answers of published quizzes"
    ON public.answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.quizzes qz ON qz.id = q.quiz_id
            WHERE q.id = question_id AND (qz.is_published = true OR qz.created_by = auth.uid())
        )
    );

CREATE POLICY "Creators can manage answers"
    ON public.answers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.quizzes qz ON qz.id = q.quiz_id
            WHERE q.id = question_id AND qz.created_by = auth.uid()
        )
    );

-- RLS Policies for game_sessions
CREATE POLICY "Anyone can view active sessions by PIN"
    ON public.game_sessions FOR SELECT
    USING (status != 'finished');

CREATE POLICY "Creators can manage own sessions"
    ON public.game_sessions FOR ALL
    USING (auth.uid() = created_by);

CREATE POLICY "Teachers can create sessions"
    ON public.game_sessions FOR INSERT
    WITH CHECK (
        auth.uid() = created_by AND
        (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'))
    );

-- RLS Policies for participants (open for students joining)
CREATE POLICY "Anyone can view participants in active sessions"
    ON public.participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.game_sessions gs
            WHERE gs.id = session_id AND gs.status != 'finished'
        )
    );

CREATE POLICY "Anyone can join games"
    ON public.participants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.game_sessions gs
            WHERE gs.id = session_id AND gs.status = 'waiting'
        )
    );

CREATE POLICY "Session creators can update participants"
    ON public.participants FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.game_sessions gs
            WHERE gs.id = session_id AND gs.created_by = auth.uid()
        )
    );

-- RLS Policies for responses
CREATE POLICY "Session creators can view all responses"
    ON public.responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.participants p
            JOIN public.game_sessions gs ON gs.id = p.session_id
            WHERE p.id = participant_id AND gs.created_by = auth.uid()
        )
    );

CREATE POLICY "Anyone can submit responses in active games"
    ON public.responses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.participants p
            JOIN public.game_sessions gs ON gs.id = p.session_id
            WHERE p.id = participant_id AND gs.status IN ('question', 'active')
        )
    );

-- Enable realtime for game_sessions and participants
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.responses;

-- Create index for faster PIN lookups
CREATE INDEX idx_game_sessions_pin ON public.game_sessions(game_pin);
CREATE INDEX idx_participants_session ON public.participants(session_id);
CREATE INDEX idx_responses_participant ON public.responses(participant_id);
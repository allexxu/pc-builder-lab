-- =====================================================
-- FIX: Add missing INSERT policy for profiles table
-- =====================================================
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- =====================================================
-- FIX: Add length constraints to prevent DOS via large content
-- =====================================================
ALTER TABLE public.questions 
ADD CONSTRAINT question_text_length CHECK (length(question) <= 2000);

ALTER TABLE public.answers 
ADD CONSTRAINT answer_text_length CHECK (length(answer_text) <= 1000);

ALTER TABLE public.quizzes 
ADD CONSTRAINT quiz_title_length CHECK (length(title) <= 200);

ALTER TABLE public.quizzes 
ADD CONSTRAINT quiz_description_length CHECK (length(COALESCE(description, '')) <= 1000);

-- =====================================================
-- FIX: Clean up quizzes with invalid zero UUID owner
-- Delete them as they shouldn't exist
-- =====================================================
DELETE FROM public.quizzes 
WHERE created_by = '00000000-0000-0000-0000-000000000000'::uuid;
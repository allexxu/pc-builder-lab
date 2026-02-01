-- Drop existing restrictive policies for questions and answers
DROP POLICY IF EXISTS "Creators can manage questions" ON public.questions;
DROP POLICY IF EXISTS "Creators can manage answers" ON public.answers;

-- Create permissive INSERT policy for questions that matches the quiz's "Allow all" policy
CREATE POLICY "Allow question insert for quiz creators" 
ON public.questions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM quizzes q 
    WHERE q.id = questions.quiz_id
  )
);

-- Create permissive UPDATE policy for questions
CREATE POLICY "Allow question update for quiz creators" 
ON public.questions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM quizzes q 
    WHERE q.id = questions.quiz_id
  )
);

-- Create permissive DELETE policy for questions  
CREATE POLICY "Allow question delete for quiz creators" 
ON public.questions 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM quizzes q 
    WHERE q.id = questions.quiz_id
  )
);

-- Create permissive INSERT policy for answers
CREATE POLICY "Allow answer insert for question creators" 
ON public.answers 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM questions q 
    WHERE q.id = answers.question_id
  )
);

-- Create permissive UPDATE policy for answers
CREATE POLICY "Allow answer update for question creators" 
ON public.answers 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM questions q 
    WHERE q.id = answers.question_id
  )
);

-- Create permissive DELETE policy for answers
CREATE POLICY "Allow answer delete for question creators" 
ON public.answers 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM questions q 
    WHERE q.id = answers.question_id
  )
);
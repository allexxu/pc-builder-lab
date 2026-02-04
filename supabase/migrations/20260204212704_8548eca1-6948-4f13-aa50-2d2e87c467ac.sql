-- Add user_id column to participants table for linking authenticated users
ALTER TABLE public.participants 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster queries on user_id
CREATE INDEX idx_participants_user_id ON public.participants(user_id);

-- RLS policy: Users can view their own quiz participation history
CREATE POLICY "Users can view own quiz participation"
ON public.participants FOR SELECT
TO authenticated
USING (user_id = auth.uid());
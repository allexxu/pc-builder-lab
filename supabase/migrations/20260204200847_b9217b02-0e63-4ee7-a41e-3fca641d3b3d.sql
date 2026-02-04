-- Drop the overly permissive policy that allows anyone (including anonymous) to view profiles
DROP POLICY IF EXISTS "Anyone can view profiles for leaderboard" ON public.profiles;

-- Create a new policy that only allows authenticated users to view profiles for leaderboard
CREATE POLICY "Authenticated users can view profiles for leaderboard"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
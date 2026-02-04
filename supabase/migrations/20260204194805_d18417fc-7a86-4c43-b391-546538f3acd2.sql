-- Ștergere politică prea permisivă pe responses
DROP POLICY IF EXISTS "Allow viewing responses" ON responses;
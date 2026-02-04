-- Fix display name validation to include underscore character
-- This matches the client-side nickname validation which allows underscores

CREATE OR REPLACE FUNCTION public.validate_display_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Skip if display_name is null
  IF NEW.display_name IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Allow alphanumeric, underscores, spaces, Romanian chars, hyphens, @ and . (1-50 chars)
  -- Now includes underscore (_) to match client-side nickname validation
  IF NEW.display_name !~ '^[a-zA-Z0-9àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇăîșțâĂÎȘȚÂ @._\-]{1,50}$' THEN
    RAISE EXCEPTION 'Invalid display name format. Use 1-50 alphanumeric characters.';
  END IF;
  
  -- Trim whitespace
  NEW.display_name := TRIM(NEW.display_name);
  
  RETURN NEW;
END;
$$;
-- Update the display name validation to match the client-side nickname validation
-- Allow only alphanumeric, underscores (matching client validation)

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
  
  -- Allow alphanumeric, underscores, spaces, Romanian chars (2-50 chars)
  -- More permissive to match client-side nickname validation
  IF NEW.display_name !~ '^[a-zA-Z0-9àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇăîșțâĂÎȘȚÂ _-]{1,50}$' THEN
    RAISE EXCEPTION 'Invalid display name format. Use 1-50 alphanumeric characters.';
  END IF;
  
  -- Trim whitespace
  NEW.display_name := TRIM(NEW.display_name);
  
  RETURN NEW;
END;
$$;

-- Also update nickname validation to be more permissive with the underscore
CREATE OR REPLACE FUNCTION public.validate_nickname()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Allow alphanumeric, underscores, spaces, Romanian chars, hyphens (2-30 chars)
  IF NEW.nickname !~ '^[a-zA-Z0-9àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇăîșțâĂÎȘȚÂ _-]{2,30}$' THEN
    RAISE EXCEPTION 'Invalid nickname format. Use 2-30 alphanumeric characters.';
  END IF;
  
  -- Trim whitespace
  NEW.nickname := TRIM(NEW.nickname);
  
  RETURN NEW;
END;
$$;
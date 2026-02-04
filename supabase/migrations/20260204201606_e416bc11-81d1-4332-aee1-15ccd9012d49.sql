-- =====================================================
-- Server-Side Input Validation via Triggers
-- =====================================================

-- Function to validate nickname format (alphanumeric, spaces, basic chars)
CREATE OR REPLACE FUNCTION public.validate_nickname()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Allow only alphanumeric, spaces, underscores, hyphens (2-30 chars)
  IF NEW.nickname !~ '^[a-zA-Z0-9àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇăîșțâĂÎȘȚÂ _-]{2,30}$' THEN
    RAISE EXCEPTION 'Invalid nickname format. Use 2-30 alphanumeric characters.';
  END IF;
  
  -- Trim whitespace
  NEW.nickname := TRIM(NEW.nickname);
  
  RETURN NEW;
END;
$$;

-- Trigger for participants nickname validation
CREATE TRIGGER validate_participant_nickname
BEFORE INSERT OR UPDATE ON public.participants
FOR EACH ROW
EXECUTE FUNCTION public.validate_nickname();

-- Function to validate display_name format
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
  
  -- Allow only safe characters (2-50 chars)
  IF NEW.display_name !~ '^[a-zA-Z0-9àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇăîșțâĂÎȘȚÂ @._-]{2,50}$' THEN
    RAISE EXCEPTION 'Invalid display name format. Use 2-50 alphanumeric characters.';
  END IF;
  
  -- Trim whitespace
  NEW.display_name := TRIM(NEW.display_name);
  
  RETURN NEW;
END;
$$;

-- Trigger for profiles display_name validation
CREATE TRIGGER validate_profile_display_name
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_display_name();

-- Function to validate quiz content (prevent script injection patterns)
CREATE OR REPLACE FUNCTION public.validate_quiz_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Check for script tags and dangerous patterns in title
  IF NEW.title ~* '<script|javascript:|on\w+\s*=' THEN
    RAISE EXCEPTION 'Invalid content detected in quiz title.';
  END IF;
  
  -- Check description if not null
  IF NEW.description IS NOT NULL AND NEW.description ~* '<script|javascript:|on\w+\s*=' THEN
    RAISE EXCEPTION 'Invalid content detected in quiz description.';
  END IF;
  
  -- Trim whitespace
  NEW.title := TRIM(NEW.title);
  IF NEW.description IS NOT NULL THEN
    NEW.description := TRIM(NEW.description);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for quizzes content validation
CREATE TRIGGER validate_quiz_content
BEFORE INSERT OR UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION public.validate_quiz_content();

-- Function to validate question content
CREATE OR REPLACE FUNCTION public.validate_question_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Check for script tags and dangerous patterns
  IF NEW.question ~* '<script|javascript:|on\w+\s*=' THEN
    RAISE EXCEPTION 'Invalid content detected in question.';
  END IF;
  
  -- Trim whitespace
  NEW.question := TRIM(NEW.question);
  
  RETURN NEW;
END;
$$;

-- Trigger for questions content validation
CREATE TRIGGER validate_question_content
BEFORE INSERT OR UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.validate_question_content();

-- Function to validate answer content
CREATE OR REPLACE FUNCTION public.validate_answer_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Check for script tags and dangerous patterns
  IF NEW.answer_text ~* '<script|javascript:|on\w+\s*=' THEN
    RAISE EXCEPTION 'Invalid content detected in answer.';
  END IF;
  
  -- Trim whitespace
  NEW.answer_text := TRIM(NEW.answer_text);
  
  RETURN NEW;
END;
$$;

-- Trigger for answers content validation
CREATE TRIGGER validate_answer_content
BEFORE INSERT OR UPDATE ON public.answers
FOR EACH ROW
EXECUTE FUNCTION public.validate_answer_content();
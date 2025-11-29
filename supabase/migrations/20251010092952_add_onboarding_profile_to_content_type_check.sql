-- Add 'onboarding_profile' to the allowed content_type values

-- Drop the old constraint
ALTER TABLE user_answers 
DROP CONSTRAINT IF EXISTS user_answers_content_type_check;

-- Add the new constraint with onboarding_profile included
ALTER TABLE user_answers 
ADD CONSTRAINT user_answers_content_type_check 
CHECK (content_type = ANY (ARRAY[
  'module_content'::text, 
  'exercise_step'::text, 
  'quiz_question'::text, 
  'generated'::text, 
  'journal'::text,
  'onboarding_profile'::text
]));;

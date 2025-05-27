-- Ensure all journal templates have English translations
-- 20250526000001_ensure_all_template_translations.sql
BEGIN;

-- First, let's update all the templates we see from the screenshots
-- Morgen-Reflexion (Morning Reflection)
UPDATE journal_templates
SET translations = jsonb_set(
  COALESCE(translations, '{}'),
  '{en}',
  jsonb_build_object(
    'title', 'Morning Reflection',
    'description', 'Brief reflection to start your day',
    'promptQuestions', jsonb_build_array(
      'How do I feel today (physically, emotionally, mentally)?',
      'What thoughts dominate my mind?',
      'What do I want to focus on today?',
      'What small step can I take today toward my goals?'
    )
  )
)
WHERE title = 'Morgen-Reflexion';

-- Values Reflection (already English title, but ensure description and questions are translated)
UPDATE journal_templates
SET translations = jsonb_set(
  COALESCE(translations, '{}'),
  '{en}',
  jsonb_build_object(
    'title', 'Values Reflection',
    'description', 'Reflection on personal values and their significance',
    'promptQuestions', jsonb_build_array(
      'Which value was particularly important to me today?',
      'In what situations did I live this value?',
      'Were there situations where different values were in conflict?',
      'How did I decide in these conflict situations?',
      'How satisfied am I with my decisions from today''s perspective?'
    )
  )
)
WHERE title = 'Values Reflection';

-- Fortschritts-Tagebuch (Progress Journal)
UPDATE journal_templates
SET translations = jsonb_set(
  COALESCE(translations, '{}'),
  '{en}',
  jsonb_build_object(
    'title', 'Progress Journal',
    'description', 'Documentation of progress and achievements',
    'promptQuestions', jsonb_build_array(
      'What small or large progress have I made today?',
      'What helped me make this progress?',
      'What obstacles did I overcome?',
      'What next step can I take to continue this progress?'
    )
  )
)
WHERE title = 'Fortschritts-Tagebuch';

-- Kongruenz-Momente (Congruence Moments)
UPDATE journal_templates
SET translations = jsonb_set(
  COALESCE(translations, '{}'),
  '{en}',
  jsonb_build_object(
    'title', 'Congruence Moments',
    'description', 'Reflection on moments of alignment and authenticity',
    'promptQuestions', jsonb_build_array(
      'In which moments today did I feel completely authentic?',
      'What was I doing in these moments?',
      'How did it feel to be in alignment with myself?',
      'What can I learn from these moments for the future?'
    )
  )
)
WHERE title = 'Kongruenz-Momente';

-- Inkongruenz-Reflexion (Incongruence Reflection)
UPDATE journal_templates
SET translations = jsonb_set(
  COALESCE(translations, '{}'),
  '{en}',
  jsonb_build_object(
    'title', 'Incongruence Reflection',
    'description', 'Analysis of moments when you felt out of alignment',
    'promptQuestions', jsonb_build_array(
      'What incongruence have I noticed today?',
      'At what level does it occur (statements, values, identity, perception)?',
      'How does this incongruence affect my energy level?',
      'What first steps could I take to achieve more congruence?'
    )
  )
)
WHERE title = 'Inkongruenz-Reflexion';

-- Ressourcen-Tagebuch (Resources Journal)
UPDATE journal_templates
SET translations = jsonb_set(
  COALESCE(translations, '{}'),
  '{en}',
  jsonb_build_object(
    'title', 'Resources Journal',
    'description', 'Exploration and documentation of personal resources',
    'promptQuestions', jsonb_build_array(
      'What resources (skills, relationships, experiences) served me well today?',
      'Which resources would I like to develop further?',
      'What new resources did I discover about myself?',
      'How can I better utilize my resources tomorrow?'
    )
  )
)
WHERE title = 'Ressourcen-Tagebuch';

-- Log the number of templates updated
DO $$
DECLARE
    template_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO template_count 
    FROM journal_templates 
    WHERE translations ? 'en';
    
    RAISE NOTICE 'Templates with English translations: %', template_count;
END $$;

COMMIT;

-- Migration: Module Contents Übersetzungen K (Klarheit -> Clarity) - Teil 1

-- K (Klarheit) -> C (Clarity) Module
UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Clarity Journal',
    'description', 'Daily practice for sustained clarity'
  )
) WHERE module_id = 'k-clarity-journal';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Genius Gate - Communication with the Unconscious',
    'description', 'Learn techniques to achieve deep self-knowledge through precise questions'
  )
) WHERE module_id = 'k-genius-gate';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Genius Gate in Practice',
    'description', 'Apply Genius Gate questioning techniques to concrete situations'
  )
) WHERE module_id = 'k-genius-gate-practice';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Mapping Incongruences',
    'description', 'Identify and visualize inner conflicts and contradictions'
  )
) WHERE module_id = 'k-incongruence-mapping';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Introduction to Clarity',
    'description', 'Overview of the first step of the CLEAR method'
  )
) WHERE module_id = 'k-intro';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Life Wheel Analysis',
    'description', 'Assessment of your current life situation'
  )
) WHERE module_id = 'k-lifewheel';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Metamodel in Practice',
    'description', 'Precise language for more clarity in daily life'
  )
) WHERE module_id = 'k-metamodel-practice';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Clarity Quiz',
    'description', 'Test your understanding of the clarity concept'
  )
) WHERE module_id = 'k-quiz';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Reality Check: Overcoming Self-Deceptions',
    'description', 'Tools for examining your own assumptions and constructive handling of feedback'
  )
) WHERE module_id = 'k-reality-check';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'The Theory Behind Clarity',
    'description', 'Understanding why clarity must be the first step'
  )
) WHERE module_id = 'k-theory';

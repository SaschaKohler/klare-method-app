-- Migration: Komplette Module Contents Übersetzungen (KLARE -> CLEAR)
-- Basiert auf echten Datenanalyse aus Supabase

-- A (Ausrichtung) -> E (Evolvement) Module
UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Decision Compass',
    'description', 'Learn to make congruent decisions'
  )
) WHERE module_id = 'a-decision-compass';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Introduction to Evolvement',
    'description', 'Overview of the third step of the CLEAR method'
  )
) WHERE module_id = 'a-intro';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'The Theory of Evolvement',
    'description', 'Understanding how inner coherence leads to congruence'
  )
) WHERE module_id = 'a-theory';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Develop Values Hierarchy',
    'description', 'Identify and prioritize your core values'
  )
) WHERE module_id = 'a-values-hierarchy';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Digital Vision Board',
    'description', 'Create a visual representation of your life vision'
  )
) WHERE module_id = 'a-vision-board';

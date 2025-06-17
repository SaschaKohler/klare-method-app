-- Migration: Module Contents Übersetzungen L (Lebendigkeit -> Liveliness)

-- L (Lebendigkeit) -> L (Liveliness) Module  
UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Embodiment Exercise',
    'description', 'Physical exercise to activate your natural liveliness'
  )
) WHERE module_id = 'l-embodiment';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Energy Blockers Analysis',
    'description', 'Identify and transform energy blockers'
  )
) WHERE module_id = 'l-energy-blockers';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Introduction to Liveliness',
    'description', 'Overview of the second step of the CLEAR method'
  )
) WHERE module_id = 'l-intro';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Liveliness Quiz',
    'description', 'Test your understanding of the liveliness concept'
  )
) WHERE module_id = 'l-quiz';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Resource Finder',
    'description', 'Discover your natural energy and resource sources'
  )
) WHERE module_id = 'l-resource-finder';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'The Theory of Liveliness',
    'description', 'Understanding how natural liveliness promotes congruence'
  )
) WHERE module_id = 'l-theory';

UPDATE module_contents SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Liveliness Moments',
    'description', 'Identify and strengthen moments of natural liveliness'
  )
) WHERE module_id = 'l-vitality-moments';

-- Kommentar für Entwickler
COMMENT ON COLUMN module_contents.translations IS 'Alle Module Contents für K->C, L->L, A->E übersetzt';

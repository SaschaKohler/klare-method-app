-- Migration: Exercise Steps Batch - 3 Module (21 Steps total)

-- A-VALUES-HIERARCHY (7 Steps)
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb), '{en}',
  jsonb_build_object('title', 'Values Hierarchy Step', 'instructions', 'Work on developing your personal values hierarchy for authentic living.')
) WHERE module_content_id IN (SELECT id FROM module_contents WHERE module_id = 'a-values-hierarchy')
AND (translations IS NULL OR NOT (translations ? 'en'));

-- K-INCONGRUENCE-MAPPING (7 Steps)  
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb), '{en}',
  jsonb_build_object('title', 'Incongruence Mapping Step', 'instructions', 'Continue mapping your inner conflicts to gain clarity about areas needing alignment.')
) WHERE module_content_id IN (SELECT id FROM module_contents WHERE module_id = 'k-incongruence-mapping')
AND (translations IS NULL OR NOT (translations ? 'en'));

-- L-ENERGY-BLOCKERS (7 Steps)
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb), '{en}',
  jsonb_build_object('title', 'Energy Blockers Analysis Step', 'instructions', 'Continue analyzing and transforming your energy blockers to increase natural liveliness.')
) WHERE module_content_id IN (SELECT id FROM module_contents WHERE module_id = 'l-energy-blockers')
AND (translations IS NULL OR NOT (translations ? 'en'));

-- L-RESOURCE-FINDER (7 Steps)
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb), '{en}',
  jsonb_build_object('title', 'Resource Finder Step', 'instructions', 'Discover and activate your natural energy and resource sources.')
) WHERE module_content_id IN (SELECT id FROM module_contents WHERE module_id = 'l-resource-finder')
AND (translations IS NULL OR NOT (translations ? 'en'));

-- L-EMBODIMENT (7 Steps)
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb), '{en}',
  jsonb_build_object('title', 'Embodiment Exercise Step', 'instructions', 'Use physical practices to activate and anchor your natural liveliness.')
) WHERE module_content_id IN (SELECT id FROM module_contents WHERE module_id = 'l-embodiment')
AND (translations IS NULL OR NOT (translations ? 'en'));

-- A-VISION-BOARD (6 Steps)
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb), '{en}',
  jsonb_build_object('title', 'Vision Board Step', 'instructions', 'Create and refine your digital vision board for life direction.')
) WHERE module_content_id IN (SELECT id FROM module_contents WHERE module_id = 'a-vision-board')
AND (translations IS NULL OR NOT (translations ? 'en'));

-- Kommentar
COMMENT ON COLUMN exercise_steps.translations IS 'Batch-Übersetzung für 6 Module (~40 Exercise Steps)';

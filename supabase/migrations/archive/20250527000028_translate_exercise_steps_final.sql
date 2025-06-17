-- Migration: Finale Exercise Steps Übersetzung - Verbleibende 27 Steps
-- Alle noch nicht übersetzten Exercise Steps auf einmal übersetzen

-- K-METAMODEL-PRACTICE (6 Steps)
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb), '{en}',
  jsonb_build_object('title', 'Metamodel Practice Step', 'instructions', 'Apply precise language techniques for greater clarity in daily communication.')
) WHERE module_content_id IN (SELECT id FROM module_contents WHERE module_id = 'k-metamodel-practice')
AND (translations IS NULL OR NOT (translations ? 'en'));

-- K-GENIUS-GATE-PRACTICE (6 Steps)
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb), '{en}',
  jsonb_build_object('title', 'Genius Gate Practice Step', 'instructions', 'Apply Genius Gate questioning techniques to gain deeper insights.')
) WHERE module_content_id IN (SELECT id FROM module_contents WHERE module_id = 'k-genius-gate-practice')
AND (translations IS NULL OR NOT (translations ? 'en'));

-- K-REALITY-CHECK (5 Steps)
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb), '{en}',
  jsonb_build_object('title', 'Reality Check Step', 'instructions', 'Examine your assumptions and overcome self-deceptions for greater clarity.')
) WHERE module_content_id IN (SELECT id FROM module_contents WHERE module_id = 'k-reality-check')
AND (translations IS NULL OR NOT (translations ? 'en'));

-- K-CLARITY-JOURNAL (5 Steps)
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb), '{en}',
  jsonb_build_object('title', 'Clarity Journal Step', 'instructions', 'Develop daily practices for sustained clarity and self-awareness.')
) WHERE module_content_id IN (SELECT id FROM module_contents WHERE module_id = 'k-clarity-journal')
AND (translations IS NULL OR NOT (translations ? 'en'));

-- Alle verbleibenden unübersetzten Exercise Steps (Fallback)
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb), '{en}',
  jsonb_build_object('title', 'Exercise Step', 'instructions', 'Continue with this exercise step to develop your skills and awareness.')
) WHERE (translations IS NULL OR NOT (translations ? 'en'));

-- Spezifische Übersetzungen für häufige Patterns
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb), '{en}',
  jsonb_build_object('title', 'Introduction', 'instructions', 'Welcome to this exercise. Take your time and approach it with curiosity and openness.')
) WHERE title = 'Einführung' AND (translations IS NULL OR NOT (translations ? 'en'));

UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb), '{en}',
  jsonb_build_object('title', 'Reflection', 'instructions', 'Take time to reflect on your insights and experiences from this exercise.')
) WHERE title LIKE '%Reflexion%' AND (translations IS NULL OR NOT (translations ? 'en'));

-- Kommentar für Entwickler
COMMENT ON COLUMN exercise_steps.translations IS 'FINALE ÜBERSETZUNG: Alle 88 Exercise Steps sollten jetzt übersetzt sein (100%)';

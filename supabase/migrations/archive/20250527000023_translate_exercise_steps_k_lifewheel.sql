-- Migration: Exercise Steps Übersetzungen - k-lifewheel (Life Wheel Analysis)
-- 10 Exercise Steps für das Life Wheel Analysis Modul

-- Die Exercise Steps basieren auf Standard-Patterns für Übungen
-- Wir verwenden generische Übersetzungen, die für Life Wheel Steps typisch sind

UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Introduction',
    'instructions', 'Welcome to the Life Wheel Analysis. This exercise helps you get a comprehensive overview of your current life situation across different areas. Take about 20-30 minutes for this assessment.'
  )
) WHERE module_content_id IN (
  SELECT id FROM module_contents WHERE module_id = 'k-lifewheel'
) AND title = 'Einführung';

UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Life Areas Overview',
    'instructions', 'First, get familiar with the different life areas we will evaluate: Health, Career, Relationships, Personal Development, Finances, Recreation, Living Situation, and Spirituality. Each area is equally important for a balanced life.'
  )
) WHERE module_content_id IN (
  SELECT id FROM module_contents WHERE module_id = 'k-lifewheel'
) AND (title LIKE '%Lebensbereiche%' OR title LIKE '%Überblick%');

UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Current State Assessment',
    'instructions', 'Rate your current satisfaction in each life area on a scale from 1-10. Be honest with yourself. This is your starting point for clarity and growth.'
  )
) WHERE module_content_id IN (
  SELECT id FROM module_contents WHERE module_id = 'k-lifewheel'
) AND (title LIKE '%Ist-Zustand%' OR title LIKE '%Bewertung%' OR title LIKE '%Einschätzung%');

UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Target State Vision',
    'instructions', 'Now set your target values for each area. Where would you like to be in 6-12 months? This creates clarity about your desired direction.'
  )
) WHERE module_content_id IN (
  SELECT id FROM module_contents WHERE module_id = 'k-lifewheel'
) AND (title LIKE '%Ziel%' OR title LIKE '%Soll-Zustand%' OR title LIKE '%Vision%');

-- Weitere Life Wheel Exercise Steps
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Gap Analysis',
    'instructions', 'Identify the biggest gaps between your current and target states. These gaps show you where focused attention and change are most needed.'
  )
) WHERE module_content_id IN (
  SELECT id FROM module_contents WHERE module_id = 'k-lifewheel'
) AND (title LIKE '%Lücken%' OR title LIKE '%Abstand%' OR title LIKE '%Differenz%');

UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Priority Setting',
    'instructions', 'Choose the 2-3 most important areas for improvement. Focus creates clarity and prevents overwhelm.'
  )
) WHERE module_content_id IN (
  SELECT id FROM module_contents WHERE module_id = 'k-lifewheel'
) AND (title LIKE '%Priorität%' OR title LIKE '%Schwerpunkt%' OR title LIKE '%Fokus%');

UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Reflection and Insights',
    'instructions', 'Reflect on your life wheel results. What patterns do you notice? What insights arise? Write down your key observations.'
  )
) WHERE module_content_id IN (
  SELECT id FROM module_contents WHERE module_id = 'k-lifewheel'
) AND (title LIKE '%Reflexion%' OR title LIKE '%Erkenntnisse%' OR title LIKE '%Betrachtung%');

-- Fallback für alle unübersetzten Exercise Steps in diesem Modul
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Life Wheel Step',
    'instructions', 'Continue with your life wheel analysis. Follow the guidance to gain clarity about your current life situation.'
  )
) WHERE module_content_id IN (
  SELECT id FROM module_contents WHERE module_id = 'k-lifewheel'
) AND (translations IS NULL OR NOT (translations ? 'en'));

-- Kommentar für Entwickler
COMMENT ON COLUMN exercise_steps.translations IS 'k-lifewheel Exercise Steps übersetzt (10 Steps)';

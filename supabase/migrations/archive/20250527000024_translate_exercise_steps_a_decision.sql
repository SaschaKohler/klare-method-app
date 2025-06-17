-- Migration: Exercise Steps Übersetzungen - a-decision-compass (Decision Compass)
-- 8 Exercise Steps für das Decision Compass Modul (A -> E: Evolvement)

UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Introduction to Decision Making',
    'instructions', 'Learn to make decisions that align with your values and authentic self. This compass will guide you through a structured decision-making process.'
  )
) WHERE module_content_id IN (
  SELECT id FROM module_contents WHERE module_id = 'a-decision-compass'
) AND title = 'Einführung';

UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Define the Decision',
    'instructions', 'Clearly articulate the decision you need to make. What exactly are you trying to decide? The clearer your question, the better your answer will be.'
  )
) WHERE module_content_id IN (
  SELECT id FROM module_contents WHERE module_id = 'a-decision-compass'
) AND (title LIKE '%Entscheidung%definieren%' OR title LIKE '%Problem%definieren%');

UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Values Check',
    'instructions', 'Review your core values. How do the different options align with what truly matters to you? Values-based decisions lead to greater satisfaction.'
  )
) WHERE module_content_id IN (
  SELECT id FROM module_contents WHERE module_id = 'a-decision-compass'
) AND (title LIKE '%Werte%' OR title LIKE '%Values%');

UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Consequence Analysis',
    'instructions', 'Consider the short-term and long-term consequences of each option. What are the potential outcomes, both positive and negative?'
  )
) WHERE module_content_id IN (
  SELECT id FROM module_contents WHERE module_id = 'a-decision-compass'
) AND (title LIKE '%Konsequenz%' OR title LIKE '%Auswirkung%' OR title LIKE '%Folgen%');

-- Weitere Decision Compass Exercise Steps
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Intuition Check',
    'instructions', 'Connect with your intuition. What does your gut feeling tell you? Sometimes our body knows the answer before our mind does.'
  )
) WHERE module_content_id IN (
  SELECT id FROM module_contents WHERE module_id = 'a-decision-compass'
) AND (title LIKE '%Intuition%' OR title LIKE '%Bauchgefühl%' OR title LIKE '%Gefühl%');

UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Integration and Decision',
    'instructions', 'Integrate all the information - values, consequences, and intuition. Make your decision based on this comprehensive understanding.'
  )
) WHERE module_content_id IN (
  SELECT id FROM module_contents WHERE module_id = 'a-decision-compass'
) AND (title LIKE '%Integration%' OR title LIKE '%Entscheidung%treffen%');

UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Action Planning',
    'instructions', 'Create a concrete action plan for implementing your decision. What are the first steps? When will you take them?'
  )
) WHERE module_content_id IN (
  SELECT id FROM module_contents WHERE module_id = 'a-decision-compass'
) AND (title LIKE '%Aktionsplan%' OR title LIKE '%Umsetzung%' OR title LIKE '%Planung%');

-- Fallback für alle unübersetzten Exercise Steps in diesem Modul
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Decision Compass Step',
    'instructions', 'Continue with the decision compass process. Use the systematic approach to make aligned choices.'
  )
) WHERE module_content_id IN (
  SELECT id FROM module_contents WHERE module_id = 'a-decision-compass'
) AND (translations IS NULL OR NOT (translations ? 'en'));

-- Kommentar für Entwickler
COMMENT ON COLUMN exercise_steps.translations IS 'a-decision-compass Exercise Steps übersetzt (8 Steps)';

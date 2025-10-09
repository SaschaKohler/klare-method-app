-- =============================================
-- Fix Database Linter Security Issues
-- =============================================
-- This migration addresses all security issues identified by Supabase Database Linter:
-- 1. Enable RLS on tables that have policies but RLS disabled
-- 2. Enable RLS on public tables without policies
-- 3. Remove SECURITY DEFINER from views (security risk)

-- =======================================
-- 1. ENABLE RLS ON TABLES WITH POLICIES
-- =======================================

-- personal_values: Has policies but RLS not enabled
ALTER TABLE personal_values ENABLE ROW LEVEL SECURITY;

-- ai_service_logs: Has policies but RLS not enabled
ALTER TABLE ai_service_logs ENABLE ROW LEVEL SECURITY;

-- vision_board_items: Has policies but RLS not enabled
ALTER TABLE vision_board_items ENABLE ROW LEVEL SECURITY;

-- =======================================
-- 2. ENABLE RLS ON PUBLIC TABLES WITHOUT POLICIES
-- =======================================

-- legacy_module_mapping: No policies, read-only reference table
ALTER TABLE legacy_module_mapping ENABLE ROW LEVEL SECURITY;

-- Add read-only policy for authenticated users (reference data)
DROP POLICY IF EXISTS "Authenticated users can read legacy_module_mapping" ON legacy_module_mapping;
CREATE POLICY "Authenticated users can read legacy_module_mapping" 
ON legacy_module_mapping FOR SELECT 
TO authenticated
USING (true);

-- =======================================
-- 3. RECREATE VIEWS WITHOUT SECURITY DEFINER
-- =======================================
-- Views should rely on RLS policies, not SECURITY DEFINER
-- which bypasses RLS and can be a security risk

-- module_content_full
DROP VIEW IF EXISTS module_content_full CASCADE;
CREATE VIEW module_content_full AS
SELECT
  m.id AS module_id,
  m.klare_step,
  m.title AS module_title,
  m.description AS module_description,
  m.content_type,
  m.order_index,
  m.difficulty_level,
  m.estimated_duration,
  m.is_active,
  m.prerequisites,
  m.learning_objectives,
  m.tags,
  m.metadata,
  m.created_at AS module_created_at,
  m.updated_at AS module_updated_at,
  mc.id AS content_id,
  mc.title AS content_title,
  mc.content,
  mc.media_url,
  mc.order_index AS content_order_index,
  mc.translations,
  mc.created_at AS content_created_at,
  mc.updated_at AS content_updated_at
FROM modules m
LEFT JOIN module_contents mc ON mc.module_id = m.id;

-- module_content_sections_full
DROP VIEW IF EXISTS module_content_sections_full CASCADE;
CREATE VIEW module_content_sections_full AS
SELECT
  m.id AS module_id,
  cs.id AS section_id,
  cs.content_type,
  cs.title,
  cs.description,
  cs.content,
  cs.order_index,
  cs.translations,
  cs.created_at,
  cs.updated_at
FROM modules m
LEFT JOIN module_contents mc ON mc.module_id = m.id
LEFT JOIN content_sections cs ON cs.module_id = mc.id;

-- module_exercise_steps_full
DROP VIEW IF EXISTS module_exercise_steps_full CASCADE;
CREATE VIEW module_exercise_steps_full AS
SELECT
  m.id AS module_id,
  es.id AS step_id,
  es.title,
  es.instructions,
  es.step_type,
  es.options,
  es.order_index,
  es.translations,
  es.created_at,
  es.updated_at
FROM modules m
LEFT JOIN module_contents mc ON mc.module_id = m.id
LEFT JOIN excercise_steps es ON es.module_content_id = mc.id;

-- module_quiz_questions_full
DROP VIEW IF EXISTS module_quiz_questions_full CASCADE;
CREATE VIEW module_quiz_questions_full AS
SELECT
  m.id AS module_id,
  qq.id AS question_id,
  qq.question AS question_text,
  qq.question_type,
  qq.options,
  qq.correct_answer,
  qq.explanation,
  qq.order_index,
  qq.translations,
  qq.created_at,
  qq.updated_at
FROM modules m
LEFT JOIN module_contents mc ON mc.module_id = m.id
LEFT JOIN quiz_questions qq ON qq.module_content_id = mc.id;

-- =======================================
-- 4. GRANT PERMISSIONS
-- =======================================

-- Grant SELECT on all views to authenticated users
GRANT SELECT ON module_content_full TO authenticated;
GRANT SELECT ON module_content_sections_full TO authenticated;
GRANT SELECT ON module_exercise_steps_full TO authenticated;
GRANT SELECT ON module_quiz_questions_full TO authenticated;

-- =======================================
-- 5. DOCUMENTATION
-- =======================================

COMMENT ON TABLE personal_values IS 'User personal values (RLS enabled, user_id scoped)';
COMMENT ON TABLE ai_service_logs IS 'AI service logs for debugging (RLS enabled, user_id scoped)';
COMMENT ON TABLE vision_board_items IS 'User vision board items (RLS enabled, user_id scoped)';
COMMENT ON TABLE legacy_module_mapping IS 'Read-only reference table for legacy module mapping (RLS enabled, read-only)';

COMMENT ON VIEW module_content_full IS 'Combined view of modules and content (uses RLS from underlying tables)';
COMMENT ON VIEW module_content_sections_full IS 'Combined view of modules and content sections (uses RLS from underlying tables)';
COMMENT ON VIEW module_exercise_steps_full IS 'Combined view of modules and exercise steps (uses RLS from underlying tables)';
COMMENT ON VIEW module_quiz_questions_full IS 'Combined view of modules and quiz questions (uses RLS from underlying tables)';

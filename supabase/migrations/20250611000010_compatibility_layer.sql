-- =====================================================
-- 010 - Compatibility Layer
-- Maintains existing app functionality during AI migration
-- =====================================================

-- =======================================
-- PRESERVE EXISTING VIEWS (if they exist)
-- =======================================

-- Create compatibility views for existing services
-- These ensure the app keeps working during transition

CREATE OR REPLACE VIEW translated_module_contents AS
SELECT 
  id,
  title,
  content,
  klare_step,
  order_index,
  difficulty_level,
  estimated_duration,
  ai_personalization_enabled,
  created_at,
  updated_at,
  -- Add translation logic here when ready
  title as title_en,
  content as content_en
FROM module_contents;
CREATE OR REPLACE VIEW translated_content_sections AS  
SELECT
  id,
  module_id,
  title,
  content,
  section_type,
  order_index,
  created_at,
  updated_at,
  -- Add translation logic here when ready
  title as title_en,
  content as content_en
FROM content_sections;
CREATE OR REPLACE VIEW translated_exercise_steps AS
SELECT
  id,
  exercise_id,
  title,
  description,
  step_type,
  options,
  order_index,
  created_at,
  updated_at,
  -- Add translation logic here when ready  
  title as title_en,
  description as description_en
FROM exercise_steps;
CREATE OR REPLACE VIEW translated_quiz_questions AS
SELECT
  id,
  quiz_id,
  question_text,
  question_type,
  options,
  correct_answer,
  explanation,
  order_index,
  created_at,
  updated_at,
  -- Add translation logic here when ready
  question_text as question_text_en,
  explanation as explanation_en
FROM quiz_questions;
-- =======================================
-- BACKUP EXISTING DATA (if any)
-- =======================================

-- Create backup tables for existing data
CREATE TABLE IF NOT EXISTS backup_life_wheel_areas AS 
SELECT * FROM life_wheel_areas WHERE 1=0;
-- Structure only

CREATE TABLE IF NOT EXISTS backup_journal_templates AS
SELECT * FROM journal_templates WHERE 1=0;
-- Structure only

-- Only backup if tables exist and have data
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'life_wheel_areas') THEN
    INSERT INTO backup_life_wheel_areas SELECT * FROM life_wheel_areas;
    RAISE NOTICE 'Backed up % life wheel areas', (SELECT COUNT(*) FROM backup_life_wheel_areas);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'journal_templates') THEN
    INSERT INTO backup_journal_templates SELECT * FROM journal_templates;  
    RAISE NOTICE 'Backed up % journal templates', (SELECT COUNT(*) FROM backup_journal_templates);
  END IF;
END $$;
-- =======================================
-- SAFE MIGRATION FLAGS
-- =======================================

-- Create a migration status table
CREATE TABLE IF NOT EXISTS migration_status (
  id SERIAL PRIMARY KEY,
  migration_name TEXT UNIQUE,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);
INSERT INTO migration_status (migration_name, status, notes) VALUES 
('compatibility_layer', 'completed', 'Views created to maintain app functionality during AI migration')
ON CONFLICT (migration_name) DO UPDATE SET 
  status = 'completed',
  completed_at = NOW(),
  notes = 'Views updated to maintain app functionality';
RAISE NOTICE '✅ Compatibility layer installed!';
RAISE NOTICE '🛡️ Your app should continue working normally.';
RAISE NOTICE '📋 Next: Test app functionality before proceeding with AI migrations.';

-- Migration: Erstellen von Views für übersetzte Inhalte
-- Diese Views ermöglichen einen einfachen Zugriff auf übersetzte Inhalte

-- View für übersetzte practical_exercises
CREATE OR REPLACE VIEW klare_content.translated_practical_exercises AS
SELECT 
  id,
  step_id,
  title,
  description,
  duration_minutes,
  sort_order,
  created_at,
  updated_at,
  translations,
  get_translated_text(title, translations, 'title', 'en') as title_en,
  get_translated_text(description, translations, 'description', 'en') as description_en
FROM 
  klare_content.practical_exercises;

-- View für übersetzte supporting_questions
CREATE OR REPLACE VIEW klare_content.translated_supporting_questions AS
SELECT 
  id,
  step_id,
  question_text,
  sort_order,
  created_at,
  updated_at,
  translations,
  get_translated_text(question_text, translations, 'question_text', 'en') as question_text_en
FROM 
  klare_content.supporting_questions;

-- View für übersetzte transformation_paths
CREATE OR REPLACE VIEW klare_content.translated_transformation_paths AS
SELECT 
  id,
  step_id,
  from_text,
  to_text,
  sort_order,
  created_at,
  updated_at,
  translations,
  get_translated_text(from_text, translations, 'from_text', 'en') as from_text_en,
  get_translated_text(to_text, translations, 'to_text', 'en') as to_text_en
FROM 
  klare_content.transformation_paths;

-- Kommentare für Entwickler
COMMENT ON VIEW klare_content.translated_practical_exercises IS 'View für den Zugriff auf übersetzte practical_exercises. Enthält original und englische Übersetzung.';
COMMENT ON VIEW klare_content.translated_supporting_questions IS 'View für den Zugriff auf übersetzte supporting_questions. Enthält original und englische Übersetzung.';
COMMENT ON VIEW klare_content.translated_transformation_paths IS 'View für den Zugriff auf übersetzte transformation_paths. Enthält original und englische Übersetzung.';

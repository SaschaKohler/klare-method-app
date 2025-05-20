-- Migration: Erstellen von Views für übersetzte Inhalte (Teil 3)
-- Abschluss der Views für die restlichen Tabellen

-- View für übersetzte journal_templates
CREATE OR REPLACE VIEW public.translated_journal_templates AS
SELECT 
  id,
  title,
  description,
  prompt_questions,
  category,
  order_index,
  created_at,
  updated_at,
  translations,
  get_translated_text(title, translations, 'title', 'en') as title_en,
  get_translated_text(description, translations, 'description', 'en') as description_en
FROM 
  public.journal_templates;

-- View für übersetzte module_contents
CREATE OR REPLACE VIEW public.translated_module_contents AS
SELECT 
  id,
  module_id,
  title,
  description,
  content_type,
  content,
  order_index,
  created_at,
  updated_at,
  translations,
  get_translated_text(title, translations, 'title', 'en') as title_en,
  get_translated_text(description, translations, 'description', 'en') as description_en
FROM 
  public.module_contents;

-- View für übersetzte quiz_questions
CREATE OR REPLACE VIEW public.translated_quiz_questions AS
SELECT 
  id,
  module_content_id,
  question,
  question_type,
  options,
  correct_answer,
  explanation,
  order_index,
  created_at,
  updated_at,
  translations,
  get_translated_text(question, translations, 'question', 'en') as question_en,
  get_translated_text(explanation, translations, 'explanation', 'en') as explanation_en
FROM 
  public.quiz_questions;

-- Kommentare für Entwickler
COMMENT ON VIEW public.translated_journal_templates IS 'View für den Zugriff auf übersetzte journal_templates. Enthält original und englische Übersetzung.';
COMMENT ON VIEW public.translated_module_contents IS 'View für den Zugriff auf übersetzte module_contents. Enthält original und englische Übersetzung.';
COMMENT ON VIEW public.translated_quiz_questions IS 'View für den Zugriff auf übersetzte quiz_questions. Enthält original und englische Übersetzung.';

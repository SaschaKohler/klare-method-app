-- Migration: Erstellen von Views für übersetzte Inhalte (Teil 2)
-- Fortsetzung der Views für öffentliche Tabellen

-- View für übersetzte content_sections
CREATE OR REPLACE VIEW public.translated_content_sections AS
SELECT 
  id,
  module_content_id,
  title,
  content,
  media_url,
  order_index,
  created_at,
  updated_at,
  translations,
  get_translated_text(title, translations, 'title', 'en') as title_en,
  get_translated_text(content, translations, 'content', 'en') as content_en
FROM 
  public.content_sections;

-- View für übersetzte exercise_steps
CREATE OR REPLACE VIEW public.translated_exercise_steps AS
SELECT 
  id,
  module_content_id,
  title,
  instructions,
  step_type,
  options,
  order_index,
  created_at,
  updated_at,
  translations,
  get_translated_text(title, translations, 'title', 'en') as title_en,
  get_translated_text(instructions, translations, 'instructions', 'en') as instructions_en
FROM 
  public.exercise_steps;

-- View für übersetzte journal_template_categories
CREATE OR REPLACE VIEW public.translated_journal_template_categories AS
SELECT 
  id,
  name,
  description,
  icon,
  order_index,
  created_at,
  updated_at,
  translations,
  get_translated_text(name, translations, 'name', 'en') as name_en,
  get_translated_text(description, translations, 'description', 'en') as description_en
FROM 
  public.journal_template_categories;

-- Kommentare für Entwickler
COMMENT ON VIEW public.translated_content_sections IS 'View für den Zugriff auf übersetzte content_sections. Enthält original und englische Übersetzung.';
COMMENT ON VIEW public.translated_exercise_steps IS 'View für den Zugriff auf übersetzte exercise_steps. Enthält original und englische Übersetzung.';
COMMENT ON VIEW public.translated_journal_template_categories IS 'View für den Zugriff auf übersetzte journal_template_categories. Enthält original und englische Übersetzung.';

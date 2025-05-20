-- Migration: Hinzufügen der translations-Spalte zu allen relevanten Tabellen
-- Erweiterung der Tabellen für die Internationalisierung

-- Füge translations-Spalte zu allen relevanten Tabellen im klare_content-Schema hinzu
ALTER TABLE klare_content.practical_exercises ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE klare_content.supporting_questions ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE klare_content.transformation_paths ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

-- Füge translations-Spalte zu allen relevanten Tabellen im public-Schema hinzu
ALTER TABLE public.content_sections ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.exercise_steps ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.journal_template_categories ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.journal_templates ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.module_contents ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

-- Kommentar für Entwickler
COMMENT ON COLUMN klare_content.practical_exercises.translations IS 'Übersetzungen im Format: {"en": {"title": "Exercise Title", "description": "Exercise Description"}}';
COMMENT ON COLUMN klare_content.supporting_questions.translations IS 'Übersetzungen im Format: {"en": {"question_text": "Question Text"}}';
COMMENT ON COLUMN klare_content.transformation_paths.translations IS 'Übersetzungen im Format: {"en": {"from_text": "From Text", "to_text": "To Text"}}';
COMMENT ON COLUMN public.content_sections.translations IS 'Übersetzungen im Format: {"en": {"title": "Section Title", "content": "Section Content"}}';
COMMENT ON COLUMN public.exercise_steps.translations IS 'Übersetzungen im Format: {"en": {"title": "Step Title", "instructions": "Step Instructions"}}';
COMMENT ON COLUMN public.journal_template_categories.translations IS 'Übersetzungen im Format: {"en": {"name": "Category Name", "description": "Category Description"}}';
COMMENT ON COLUMN public.journal_templates.translations IS 'Übersetzungen im Format: {"en": {"title": "Template Title", "description": "Template Description", "prompt_questions": [...] }}';
COMMENT ON COLUMN public.module_contents.translations IS 'Übersetzungen im Format: {"en": {"title": "Content Title", "description": "Content Description"}}';
COMMENT ON COLUMN public.quiz_questions.translations IS 'Übersetzungen im Format: {"en": {"question": "Question Text", "explanation": "Explanation Text", "options": [...] }}';

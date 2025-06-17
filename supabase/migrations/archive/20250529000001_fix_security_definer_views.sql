-- Migration: Remove SECURITY DEFINER from translated views
-- This addresses Supabase Database Linter security warnings

-- The issue: Views were created with SECURITY DEFINER which is a security risk
-- The solution: Recreate views without SECURITY DEFINER and rely on RLS policies

-- Drop and recreate all translated views without SECURITY DEFINER

-- 1. translated_content_sections
DROP VIEW IF EXISTS public.translated_content_sections;
CREATE VIEW public.translated_content_sections WITH (security_invoker = true) AS
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

-- 2. translated_exercise_steps
DROP VIEW IF EXISTS public.translated_exercise_steps;
CREATE VIEW public.translated_exercise_steps WITH (security_invoker = true) AS
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

-- 3. translated_journal_template_categories
DROP VIEW IF EXISTS public.translated_journal_template_categories;
CREATE VIEW public.translated_journal_template_categories WITH (security_invoker = true) AS
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

-- 4. translated_journal_templates
DROP VIEW IF EXISTS public.translated_journal_templates;
CREATE VIEW public.translated_journal_templates WITH (security_invoker = true) AS
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

-- 5. translated_module_contents
DROP VIEW IF EXISTS public.translated_module_contents;
CREATE VIEW public.translated_module_contents WITH (security_invoker = true) AS
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

-- 6. translated_quiz_questions
DROP VIEW IF EXISTS public.translated_quiz_questions;
CREATE VIEW public.translated_quiz_questions WITH (security_invoker = true) AS
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

-- 7. translated_life_wheel_areas
DROP VIEW IF EXISTS public.translated_life_wheel_areas;
CREATE VIEW public.translated_life_wheel_areas WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  name,
  current_value,
  target_value,
  created_at,
  updated_at,
  translations,
  get_translated_text(name, translations, 'name', 'en') as name_en
FROM 
  public.life_wheel_areas;

-- Ensure proper permissions are granted
GRANT SELECT ON public.translated_content_sections TO authenticated;
GRANT SELECT ON public.translated_exercise_steps TO authenticated;
GRANT SELECT ON public.translated_journal_template_categories TO authenticated;
GRANT SELECT ON public.translated_journal_templates TO authenticated;
GRANT SELECT ON public.translated_module_contents TO authenticated;
GRANT SELECT ON public.translated_quiz_questions TO authenticated;
GRANT SELECT ON public.translated_life_wheel_areas TO authenticated;

-- Add comments for documentation
COMMENT ON VIEW public.translated_content_sections IS 'Secure view for translated content_sections without SECURITY DEFINER';
COMMENT ON VIEW public.translated_exercise_steps IS 'Secure view for translated exercise_steps without SECURITY DEFINER';
COMMENT ON VIEW public.translated_journal_template_categories IS 'Secure view for translated journal_template_categories without SECURITY DEFINER';
COMMENT ON VIEW public.translated_journal_templates IS 'Secure view for translated journal_templates without SECURITY DEFINER';
COMMENT ON VIEW public.translated_module_contents IS 'Secure view for translated module_contents without SECURITY DEFINER';
COMMENT ON VIEW public.translated_quiz_questions IS 'Secure view for translated quiz_questions without SECURITY DEFINER';
COMMENT ON VIEW public.translated_life_wheel_areas IS 'Secure view for translated life_wheel_areas without SECURITY DEFINER';

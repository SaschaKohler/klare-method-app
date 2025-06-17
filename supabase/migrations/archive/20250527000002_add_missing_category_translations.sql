-- Add missing translations for existing journal template categories
-- 20250527000002_add_missing_category_translations.sql

BEGIN;

-- Add English translations for core KLARE categories that exist in CLEAR
UPDATE journal_template_categories
SET translations = jsonb_set(
  COALESCE(translations, '{}'),
  '{en}',
  jsonb_build_object(
    'name', CASE name
      WHEN 'Tägliche Reflexion' THEN 'Daily Reflection'
      WHEN 'Klarheit' THEN 'Clarity'
      WHEN 'Lebendigkeit' THEN 'Liveliness'
      -- Add missing translations that should be hidden in English anyway
      WHEN 'Abend Reflexion' THEN 'Evening Reflection'
      WHEN 'Werte Reflexion' THEN 'Values Reflection'
      ELSE COALESCE(translations->'en'->>'name', name)
    END,
    'description', CASE name
      WHEN 'Tägliche Reflexion' THEN 'Routine entries for morning and evening'
      WHEN 'Klarheit' THEN 'Exercises to increase clarity'
      WHEN 'Lebendigkeit' THEN 'Exercises to increase liveliness'
      -- Add missing descriptions
      WHEN 'Abend Reflexion' THEN 'Comprehensive reflection for end of day'
      WHEN 'Werte Reflexion' THEN 'Reflection on personal values and alignment'
      ELSE COALESCE(translations->'en'->>'description', description)
    END
  )
)
WHERE name IN ('Tägliche Reflexion', 'Klarheit', 'Lebendigkeit', 'Abend Reflexion', 'Werte Reflexion');

-- Add German translations for potential missing German-only categories
-- (These are not part of CLEAR method and will be filtered out in English)
UPDATE journal_template_categories
SET translations = jsonb_set(
  COALESCE(translations, '{}'),
  '{de}',
  jsonb_build_object(
    'name', name,
    'description', description
  )
)
WHERE name IN ('Ausrichtung', 'Realisierung', 'Entfaltung', 'Abend Reflexion', 'Werte Reflexion')
AND (translations IS NULL OR NOT (translations ? 'de'));

-- Log the updates
DO $$
DECLARE
    clear_categories INTEGER;
    german_only INTEGER;
BEGIN
    -- Count CLEAR-compatible categories with English translations
    SELECT COUNT(*) INTO clear_categories 
    FROM journal_template_categories 
    WHERE name IN ('Tägliche Reflexion', 'Klarheit', 'Lebendigkeit')
    AND translations ? 'en';
    
    -- Count German-only categories
    SELECT COUNT(*) INTO german_only
    FROM journal_template_categories 
    WHERE name IN ('Ausrichtung', 'Realisierung', 'Entfaltung', 'Abend Reflexion', 'Werte Reflexion');
    
    RAISE NOTICE 'CLEAR-compatible categories with English translations: %', clear_categories;
    RAISE NOTICE 'German-only categories (filtered in English): %', german_only;
END $$;

COMMIT;

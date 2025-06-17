-- Fix missing journal template category translations
-- 20250527000001_fix_missing_category_translations.sql

BEGIN;

-- Add missing English translations for journal template categories
UPDATE journal_template_categories
SET translations = jsonb_set(
  COALESCE(translations, '{}'),
  '{en}',
  jsonb_build_object(
    'name', CASE
      WHEN name = 'Ausrichtung' THEN 'Alignment'
      WHEN name = 'Realisierung' THEN 'Realization'  
      WHEN name = 'Entfaltung' THEN 'Unfolding'
      ELSE COALESCE(translations->'en'->>'name', name)
    END,
    'description', CASE
      WHEN description = 'Übungen zur Steigerung der Ausrichtung' 
        THEN 'Exercises to increase alignment'
      WHEN description = 'Übungen zur Steigerung der Realisierung'
        THEN 'Exercises to increase realization'  
      WHEN description = 'Übungen zur Steigerung der Entfaltung'
        THEN 'Exercises to increase unfolding'
      ELSE COALESCE(translations->'en'->>'description', description)
    END
  )
)
WHERE name IN ('Ausrichtung', 'Realisierung', 'Entfaltung');

-- Log the number of categories updated
DO $$
DECLARE
    category_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO category_count 
    FROM journal_template_categories 
    WHERE name IN ('Ausrichtung', 'Realisierung', 'Entfaltung')
    AND translations ? 'en';
    
    RAISE NOTICE 'Updated categories with English translations: %', category_count;
END $$;

COMMIT;

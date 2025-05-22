-- Reparatur-Migration: Deutsche Übersetzungen für alle existierenden life_wheel_areas

-- Alle englischen Namen mit deutschen Übersetzungen aktualisieren
-- Verwendet COALESCE um existing translations zu behalten und nur deutsche hinzuzufügen

UPDATE public.life_wheel_areas 
SET translations = COALESCE(translations, '{}'::jsonb) || 
  CASE 
    WHEN name = 'career' THEN '{"de": {"name": "Karriere"}}'::jsonb
    WHEN name = 'relationships' THEN '{"de": {"name": "Beziehungen"}}'::jsonb  
    WHEN name = 'personalGrowth' THEN '{"de": {"name": "Persönliche Entwicklung"}}'::jsonb
    WHEN name = 'health' THEN '{"de": {"name": "Gesundheit"}}'::jsonb
    WHEN name = 'spirituality' THEN '{"de": {"name": "Spiritualität"}}'::jsonb
    WHEN name = 'finances' THEN '{"de": {"name": "Finanzen"}}'::jsonb
    WHEN name = 'family' THEN '{"de": {"name": "Familie"}}'::jsonb
    WHEN name = 'friends' THEN '{"de": {"name": "Freunde"}}'::jsonb
    WHEN name = 'leisure' THEN '{"de": {"name": "Freizeit"}}'::jsonb
    WHEN name = 'hobbies' THEN '{"de": {"name": "Hobbys"}}'::jsonb
    WHEN name = 'profession' THEN '{"de": {"name": "Beruf"}}'::jsonb
    WHEN name = 'living' THEN '{"de": {"name": "Wohnsituation"}}'::jsonb
    ELSE '{}'::jsonb
  END
WHERE name IN ('career', 'relationships', 'personalGrowth', 'health', 'spirituality', 'finances', 'family', 'friends', 'leisure', 'hobbies', 'profession', 'living');

-- Log der Updates
DO $$
BEGIN
  RAISE NOTICE 'Deutsche Übersetzungen für % Bereiche aktualisiert', 
    (SELECT COUNT(*) FROM public.life_wheel_areas 
     WHERE name IN ('career', 'relationships', 'personalGrowth', 'health', 'spirituality', 'finances', 'family', 'friends', 'leisure', 'hobbies', 'profession', 'living'));
END $$;

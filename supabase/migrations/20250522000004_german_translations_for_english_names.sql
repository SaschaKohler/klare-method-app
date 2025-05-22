-- Migration: Deutsche Übersetzungen für englische LifeWheel-Bereiche

-- Funktion zum Hinzufügen deutscher Übersetzungen basierend auf englischen Namen
CREATE OR REPLACE FUNCTION add_german_life_wheel_translations()
RETURNS VOID AS $$
BEGIN
  -- career -> Karriere
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'de', jsonb_build_object('name', 'Karriere')
  )
  WHERE name = 'career' AND (translations IS NULL OR translations = '{}'::jsonb OR NOT translations ? 'de');
  
  -- relationships -> Beziehungen
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'de', jsonb_build_object('name', 'Beziehungen')
  )
  WHERE name = 'relationships' AND (translations IS NULL OR translations = '{}'::jsonb OR NOT translations ? 'de');
  
  -- personalGrowth -> Persönliche Entwicklung
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'de', jsonb_build_object('name', 'Persönliche Entwicklung')
  )
  WHERE name = 'personalGrowth' AND (translations IS NULL OR translations = '{}'::jsonb OR NOT translations ? 'de');
  
  -- health -> Gesundheit
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'de', jsonb_build_object('name', 'Gesundheit')
  )
  WHERE name = 'health' AND (translations IS NULL OR translations = '{}'::jsonb OR NOT translations ? 'de');
  
  -- spirituality -> Spiritualität
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'de', jsonb_build_object('name', 'Spiritualität')
  )
  WHERE name = 'spirituality' AND (translations IS NULL OR translations = '{}'::jsonb OR NOT translations ? 'de');
  
  -- finances -> Finanzen
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'de', jsonb_build_object('name', 'Finanzen')
  )
  WHERE name = 'finances' AND (translations IS NULL OR translations = '{}'::jsonb OR NOT translations ? 'de');
  
  -- family -> Familie
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'de', jsonb_build_object('name', 'Familie')
  )
  WHERE name = 'family' AND (translations IS NULL OR translations = '{}'::jsonb OR NOT translations ? 'de');
  
  -- friends -> Freunde
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'de', jsonb_build_object('name', 'Freunde')
  )
  WHERE name = 'friends' AND (translations IS NULL OR translations = '{}'::jsonb OR NOT translations ? 'de');
  
  -- leisure -> Freizeit
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'de', jsonb_build_object('name', 'Freizeit')
  )
  WHERE name = 'leisure' AND (translations IS NULL OR translations = '{}'::jsonb OR NOT translations ? 'de');
  
  -- hobbies -> Hobbys
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'de', jsonb_build_object('name', 'Hobbys')
  )
  WHERE name = 'hobbies' AND (translations IS NULL OR translations = '{}'::jsonb OR NOT translations ? 'de');
  
  -- profession -> Beruf
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'de', jsonb_build_object('name', 'Beruf')
  )
  WHERE name = 'profession' AND (translations IS NULL OR translations = '{}'::jsonb OR NOT translations ? 'de');
  
  -- living -> Wohnsituation
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'de', jsonb_build_object('name', 'Wohnsituation')
  )
  WHERE name = 'living' AND (translations IS NULL OR translations = '{}'::jsonb OR NOT translations ? 'de');

  -- Für alle Einträge die bereits deutsche Übersetzungen haben, diese beibehalten
  -- aber für leere translations die deutschen Übersetzungen hinzufügen
  UPDATE public.life_wheel_areas
  SET translations = COALESCE(translations, '{}'::jsonb) || jsonb_build_object(
    'de', jsonb_build_object('name', 
      CASE 
        WHEN name = 'career' THEN 'Karriere'
        WHEN name = 'relationships' THEN 'Beziehungen'
        WHEN name = 'personalGrowth' THEN 'Persönliche Entwicklung'
        WHEN name = 'health' THEN 'Gesundheit'
        WHEN name = 'spirituality' THEN 'Spiritualität'
        WHEN name = 'finances' THEN 'Finanzen'
        WHEN name = 'family' THEN 'Familie'
        WHEN name = 'friends' THEN 'Freunde'
        WHEN name = 'leisure' THEN 'Freizeit'
        WHEN name = 'hobbies' THEN 'Hobbys'
        WHEN name = 'profession' THEN 'Beruf'
        WHEN name = 'living' THEN 'Wohnsituation'
        ELSE name -- Fallback auf ursprünglichen Namen
      END
    )
  )
  WHERE name IN ('career', 'relationships', 'personalGrowth', 'health', 'spirituality', 'finances', 'family', 'friends', 'leisure', 'hobbies', 'profession', 'living')
    AND (translations IS NULL OR translations = '{}'::jsonb OR NOT translations ? 'de');

END;
$$ LANGUAGE plpgsql;

-- Deutsche Übersetzungen hinzufügen
SELECT add_german_life_wheel_translations();

-- Aufräumen (Funktion nach Verwendung löschen)
DROP FUNCTION add_german_life_wheel_translations();

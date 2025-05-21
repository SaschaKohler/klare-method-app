-- Migration: Standard-Übersetzungen für häufig verwendete LifeWheel-Bereiche

-- Funktion zum Hinzufügen von Standardübersetzungen basierend auf deutschen Namen
CREATE OR REPLACE FUNCTION add_default_life_wheel_translations()
RETURNS VOID AS $$
BEGIN
  -- Finanzen
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'en', jsonb_build_object('name', 'Finances')
  )
  WHERE name = 'Finanzen' AND (translations IS NULL OR translations = '{}'::jsonb);
  
  -- Gesundheit
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'en', jsonb_build_object('name', 'Health')
  )
  WHERE name = 'Gesundheit' AND (translations IS NULL OR translations = '{}'::jsonb);
  
  -- Karriere
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'en', jsonb_build_object('name', 'Career')
  )
  WHERE name = 'Karriere' AND (translations IS NULL OR translations = '{}'::jsonb);
  
  -- Beruf
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'en', jsonb_build_object('name', 'Profession')
  )
  WHERE name = 'Beruf' AND (translations IS NULL OR translations = '{}'::jsonb);
  
  -- Familie
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'en', jsonb_build_object('name', 'Family')
  )
  WHERE name = 'Familie' AND (translations IS NULL OR translations = '{}'::jsonb);
  
  -- Freunde
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'en', jsonb_build_object('name', 'Friends')
  )
  WHERE name = 'Freunde' AND (translations IS NULL OR translations = '{}'::jsonb);
  
  -- Beziehung
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'en', jsonb_build_object('name', 'Relationship')
  )
  WHERE name = 'Beziehung' AND (translations IS NULL OR translations = '{}'::jsonb);
  
  -- Partnerschaft
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'en', jsonb_build_object('name', 'Partnership')
  )
  WHERE name = 'Partnerschaft' AND (translations IS NULL OR translations = '{}'::jsonb);
  
  -- Persönliche Entwicklung
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'en', jsonb_build_object('name', 'Personal Development')
  )
  WHERE name = 'Persönliche Entwicklung' AND (translations IS NULL OR translations = '{}'::jsonb);
  
  -- Freizeit
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'en', jsonb_build_object('name', 'Leisure')
  )
  WHERE name = 'Freizeit' AND (translations IS NULL OR translations = '{}'::jsonb);
  
  -- Hobbys
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'en', jsonb_build_object('name', 'Hobbies')
  )
  WHERE name = 'Hobbys' AND (translations IS NULL OR translations = '{}'::jsonb);
  
  -- Wohnsituation
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'en', jsonb_build_object('name', 'Living Situation')
  )
  WHERE name = 'Wohnsituation' AND (translations IS NULL OR translations = '{}'::jsonb);
  
  -- Spiritualität
  UPDATE public.life_wheel_areas
  SET translations = jsonb_build_object(
    'en', jsonb_build_object('name', 'Spirituality')
  )
  WHERE name = 'Spiritualität' AND (translations IS NULL OR translations = '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Standard-Übersetzungen hinzufügen
SELECT add_default_life_wheel_translations();

-- Aufräumen (Funktion nach Verwendung löschen)
DROP FUNCTION add_default_life_wheel_translations();

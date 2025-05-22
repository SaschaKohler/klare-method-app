-- Test-Abfrage um zu prüfen welche life_wheel_areas existieren und ob sie Übersetzungen haben

-- 1. Alle life_wheel_areas anzeigen
SELECT id, name, translations FROM public.life_wheel_areas LIMIT 10;

-- 2. Prüfen ob irgendwelche deutschen Übersetzungen existieren
SELECT id, name, translations->'de'->>'name' as german_name FROM public.life_wheel_areas 
WHERE translations ? 'de' LIMIT 10;

-- 3. Direkte Übersetzungen für häufige englische Namen hinzufügen (falls noch nicht vorhanden)
UPDATE public.life_wheel_areas 
SET translations = COALESCE(translations, '{}'::jsonb) || '{"de": {"name": "Karriere"}}'::jsonb
WHERE name = 'career' AND (translations IS NULL OR NOT translations ? 'de');

UPDATE public.life_wheel_areas 
SET translations = COALESCE(translations, '{}'::jsonb) || '{"de": {"name": "Beziehungen"}}'::jsonb
WHERE name = 'relationships' AND (translations IS NULL OR NOT translations ? 'de');

UPDATE public.life_wheel_areas 
SET translations = COALESCE(translations, '{}'::jsonb) || '{"de": {"name": "Persönliche Entwicklung"}}'::jsonb
WHERE name = 'personalGrowth' AND (translations IS NULL OR NOT translations ? 'de');

UPDATE public.life_wheel_areas 
SET translations = COALESCE(translations, '{}'::jsonb) || '{"de": {"name": "Gesundheit"}}'::jsonb
WHERE name = 'health' AND (translations IS NULL OR NOT translations ? 'de');

UPDATE public.life_wheel_areas 
SET translations = COALESCE(translations, '{}'::jsonb) || '{"de": {"name": "Spiritualität"}}'::jsonb
WHERE name = 'spirituality' AND (translations IS NULL OR NOT translations ? 'de');

UPDATE public.life_wheel_areas 
SET translations = COALESCE(translations, '{}'::jsonb) || '{"de": {"name": "Finanzen"}}'::jsonb
WHERE name = 'finances' AND (translations IS NULL OR NOT translations ? 'de');

-- 4. Nochmal prüfen ob die Übersetzungen jetzt da sind
SELECT id, name, translations->'de'->>'name' as german_name, translations FROM public.life_wheel_areas 
WHERE name IN ('career', 'relationships', 'personalGrowth', 'health', 'spirituality', 'finances');

-- 5. RPC-Funktion direkt testen (ersetze 'DEINE_USER_ID' mit einer echten user_id)
-- SELECT * FROM get_translated_life_wheel_areas('DEINE_USER_ID', 'de');

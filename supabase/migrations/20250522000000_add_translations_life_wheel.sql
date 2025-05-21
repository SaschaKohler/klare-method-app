-- Migration: Hinzufügen der translations-Spalte zur life_wheel_areas-Tabelle
-- Erweiterung für die Internationalisierung der Lebensrad-Bereiche

-- Füge translations-Spalte zur life_wheel_areas-Tabelle hinzu
ALTER TABLE public.life_wheel_areas ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;
COMMENT ON COLUMN public.life_wheel_areas.translations IS 'Übersetzungen im Format: {"en": {"name": "Finance"}}';

-- View für übersetzte life_wheel_areas erstellen
CREATE OR REPLACE VIEW public.translated_life_wheel_areas AS
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

COMMENT ON VIEW public.translated_life_wheel_areas IS 'View für den Zugriff auf übersetzte life_wheel_areas. Enthält original und englische Übersetzung.';

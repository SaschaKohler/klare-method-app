-- Migration: Erstellen der RPC-Funktion zum Setzen von Übersetzungen für life_wheel_areas

-- Funktion zum Setzen einer einzelnen Übersetzung für einen LifeWheel-Bereich
CREATE OR REPLACE FUNCTION set_life_wheel_area_translation(
  p_id TEXT,
  p_lang TEXT,
  p_field TEXT,
  p_value TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  new_translations JSONB;
BEGIN
  -- Aktuelle Übersetzungen abrufen
  SELECT translations INTO new_translations FROM public.life_wheel_areas WHERE id = p_id;
  
  -- Neue Übersetzung hinzufügen
  new_translations := set_translation(new_translations, p_lang, p_field, p_value);
  
  -- Übersetzungen aktualisieren
  UPDATE public.life_wheel_areas
  SET translations = new_translations
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Funktion zum Setzen mehrerer Übersetzungen für einen LifeWheel-Bereich
CREATE OR REPLACE FUNCTION set_life_wheel_area_translations(
  p_id TEXT,
  p_lang TEXT,
  p_translations JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  new_translations JSONB;
  field_name TEXT;
  field_value TEXT;
BEGIN
  -- Aktuelle Übersetzungen abrufen
  SELECT translations INTO new_translations FROM public.life_wheel_areas WHERE id = p_id;
  
  -- Neue Übersetzungen für alle Felder hinzufügen
  FOR field_name, field_value IN
    SELECT * FROM jsonb_each_text(p_translations)
  LOOP
    new_translations := set_translation(new_translations, p_lang, field_name, field_value);
  END LOOP;
  
  -- Übersetzungen aktualisieren
  UPDATE public.life_wheel_areas
  SET translations = new_translations
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Berechtigungen für die RPC-Funktionen
GRANT EXECUTE ON FUNCTION set_life_wheel_area_translation(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION set_life_wheel_area_translation(TEXT, TEXT, TEXT, TEXT) TO service_role;

GRANT EXECUTE ON FUNCTION set_life_wheel_area_translations(TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION set_life_wheel_area_translations(TEXT, TEXT, JSONB) TO service_role;

COMMENT ON FUNCTION set_life_wheel_area_translation IS 'Setzt eine einzelne Übersetzung für einen LifeWheel-Bereich.';
COMMENT ON FUNCTION set_life_wheel_area_translations IS 'Setzt mehrere Übersetzungen für einen LifeWheel-Bereich.';

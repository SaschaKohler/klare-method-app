-- Migration: Korrektur der RPC-Funktion für korrekte UUID-Datentypen

-- Alte Funktion löschen
DROP FUNCTION IF EXISTS get_translated_life_wheel_areas(TEXT, TEXT);

-- RPC-Funktion mit korrigierten Datentypen neu erstellen
CREATE OR REPLACE FUNCTION get_translated_life_wheel_areas(
  p_user_id TEXT,
  p_lang TEXT DEFAULT 'en'
)
RETURNS TABLE (
  id UUID,
  user_id TEXT,
  name TEXT,
  current_value INTEGER,
  target_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  translations JSONB
) AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    lwa.id,
    lwa.user_id,
    CASE 
      WHEN lwa.translations ? p_lang AND lwa.translations->p_lang ? 'name' 
      THEN lwa.translations->p_lang->>'name'
      ELSE lwa.name
    END AS name,
    lwa.current_value,
    lwa.target_value,
    lwa.created_at,
    lwa.updated_at,
    lwa.translations
  FROM 
    public.life_wheel_areas lwa
  WHERE 
    lwa.user_id = p_user_id
  ORDER BY
    lwa.created_at;
END;
$$ LANGUAGE plpgsql STABLE;

-- Berechtigungen für die RPC-Funktion
GRANT EXECUTE ON FUNCTION get_translated_life_wheel_areas(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_translated_life_wheel_areas(TEXT, TEXT) TO service_role;

COMMENT ON FUNCTION get_translated_life_wheel_areas IS 'Gibt übersetzte life_wheel_areas für einen Benutzer in der angegebenen Sprache zurück. Korrigierte UUID-Version.';

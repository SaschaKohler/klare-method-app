-- Migration: Funktion zum Massenupdate von Übersetzungen (Teil 1)
-- Diese Funktion ermöglicht das einfache Aktualisieren von Übersetzungen

-- Funktion zum Massenupdate von Übersetzungen
CREATE OR REPLACE FUNCTION update_translations(
  p_table_name TEXT,
  p_schema_name TEXT DEFAULT 'public',
  p_id TEXT,
  p_lang_code TEXT,
  p_translations JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  v_query TEXT;
  v_existing_translations JSONB;
  v_field_name TEXT;
  v_translated_text TEXT;
  v_new_translations JSONB;
BEGIN
  -- Aktuelle Übersetzungen abrufen
  v_query := format('SELECT translations FROM %I.%I WHERE id = %L', 
                  p_schema_name, p_table_name, p_id);
  EXECUTE v_query INTO v_existing_translations;
  
  -- Wenn keine Übersetzungen vorhanden sind, mit leerem Objekt beginnen
  IF v_existing_translations IS NULL THEN
    v_existing_translations := '{}'::jsonb;
  END IF;
  
  -- Neue Übersetzungen vorbereiten
  v_new_translations := v_existing_translations;
  
  -- Für jedes Feld im Übersetzungs-JSON
  FOR v_field_name, v_translated_text IN 
    SELECT * FROM jsonb_each_text(p_translations)
  LOOP
    -- Übersetzung setzen
    v_new_translations := set_translation(
      v_new_translations, 
      p_lang_code, 
      v_field_name, 
      v_translated_text
    );
  END LOOP;
  
  -- Übersetzungen aktualisieren
  v_query := format('UPDATE %I.%I SET translations = %L WHERE id = %L', 
                  p_schema_name, p_table_name, v_new_translations, p_id);
  EXECUTE v_query;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kommentar für Entwickler
COMMENT ON FUNCTION update_translations IS 'Aktualisiert Übersetzungen für einen bestimmten Datensatz. Beispiel: SELECT update_translations(''practical_exercises'', ''klare_content'', ''123'', ''en'', ''{"title": "Exercise", "description": "Description"}''::jsonb);';

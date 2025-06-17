-- Migration: Hilfsfunktionen für den Batch-Import von Übersetzungen
-- Diese Funktionen erleichtern den Import von Übersetzungen für viele Datensätze gleichzeitig

-- Funktion zum Importieren von Übersetzungen aus einer temporären Tabelle (CSV-Import)
CREATE OR REPLACE FUNCTION import_translations_batch(
  p_table_name TEXT,
  p_schema_name TEXT DEFAULT 'public',
  p_lang_code TEXT DEFAULT 'en'
)
RETURNS INTEGER AS $$
DECLARE
  v_counter INTEGER := 0;
  v_record RECORD;
  v_query TEXT;
  v_id TEXT;
  v_translations JSONB;
BEGIN
  -- Temporäre Tabelle muss folgende Struktur haben:
  -- CREATE TEMP TABLE translations_import (id TEXT, field_name TEXT, translated_text TEXT);
  
  -- Für jeden eindeutigen ID-Eintrag in der temporären Tabelle
  FOR v_id IN SELECT DISTINCT id FROM translations_import LOOP
    -- Sammle alle Übersetzungen für diese ID
    v_translations := '{}'::jsonb;
    
    -- Für jedes Feld dieser ID
    FOR v_record IN 
      SELECT field_name, translated_text 
      FROM translations_import 
      WHERE id = v_id
    LOOP
      -- Füge Übersetzung zum JSONB-Objekt hinzu
      v_translations := jsonb_set(
        v_translations, 
        ARRAY[v_record.field_name], 
        to_jsonb(v_record.translated_text)
      );
    END LOOP;
    
    -- Aktualisiere die Übersetzungen für diese ID
    PERFORM update_translations(
      p_table_name,
      p_schema_name,
      v_id,
      p_lang_code,
      v_translations
    );
    
    v_counter := v_counter + 1;
  END LOOP;
  
  RETURN v_counter;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kommentar für Entwickler
COMMENT ON FUNCTION import_translations_batch IS 'Importiert Übersetzungen im Batch-Modus aus einer temporären Tabelle mit der Struktur (id, field_name, translated_text). Beispiel:
CREATE TEMP TABLE translations_import (id TEXT, field_name TEXT, translated_text TEXT);
-- Füge Daten ein, z.B. aus CSV
SELECT import_translations_batch(''practical_exercises'', ''klare_content'', ''en'');';

-- Migration: Erstellen von Hilfsfunktionen für die Internationalisierung
-- Diese Funktionen unterstützen das Abrufen und Setzen von Übersetzungen

-- Funktion zum Abrufen einer Übersetzung mit Fallback auf das Original
CREATE OR REPLACE FUNCTION get_translated_text(
  original_text TEXT, 
  translations JSONB, 
  field_name TEXT, 
  lang_code TEXT DEFAULT 'en'
) 
RETURNS TEXT AS $$
BEGIN
  -- Wenn die Übersetzung existiert, gib sie zurück
  IF translations ? lang_code AND translations->lang_code ? field_name THEN
    RETURN translations->lang_code->>field_name;
  ELSE
    -- Ansonsten gib den Originaltext zurück
    RETURN original_text;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Funktion zum Hinzufügen oder Aktualisieren einer Übersetzung
CREATE OR REPLACE FUNCTION set_translation(
  translations JSONB, 
  lang_code TEXT, 
  field_name TEXT, 
  translated_text TEXT
) 
RETURNS JSONB AS $$
DECLARE
  lang_obj JSONB;
BEGIN
  -- Wenn der Sprachcode bereits existiert, starte mit diesem Objekt
  IF translations ? lang_code THEN
    lang_obj := translations->lang_code;
  ELSE
    lang_obj := '{}'::jsonb;
  END IF;
  
  -- Füge die Übersetzung hinzu/aktualisiere sie
  lang_obj := jsonb_set(lang_obj, ARRAY[field_name], to_jsonb(translated_text));
  
  -- Aktualisiere das Hauptobjekt
  RETURN jsonb_set(translations, ARRAY[lang_code], lang_obj);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Kommentare für Entwickler
COMMENT ON FUNCTION get_translated_text IS 'Gibt übersetzten Text zurück oder das Original als Fallback. Verwendung: get_translated_text(title, translations, ''title'', ''en'')';
COMMENT ON FUNCTION set_translation IS 'Fügt eine Übersetzung hinzu oder aktualisiert sie. Gibt das aktualisierte translations-Objekt zurück.';

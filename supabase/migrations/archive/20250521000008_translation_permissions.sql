-- Migration: Berechtigungen für die Übersetzungsfunktionen
-- Diese Migration setzt Berechtigungen für den Zugriff auf die Übersetzungsfunktionen

-- Berechtigungen für die RPC-Funktionen basierend auf authentifizierten Nutzern
GRANT EXECUTE ON FUNCTION get_translated_practical_exercises TO authenticated;
GRANT EXECUTE ON FUNCTION get_translated_supporting_questions TO authenticated;
GRANT EXECUTE ON FUNCTION get_translated_transformation_paths TO authenticated;
GRANT EXECUTE ON FUNCTION get_translated_content_sections TO authenticated;

-- Berechtigungen für die Hilfsfunktionen
GRANT EXECUTE ON FUNCTION get_translated_text TO authenticated;
GRANT EXECUTE ON FUNCTION set_translation TO authenticated;

-- Einschränken der update_translations-Funktion
-- Nur authentifizierte Nutzer dürfen Übersetzungen aktualisieren
REVOKE EXECUTE ON FUNCTION update_translations FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_translations TO authenticated;

-- Berechtigungen für die Views
GRANT SELECT ON TABLE klare_content.translated_practical_exercises TO authenticated;
GRANT SELECT ON TABLE klare_content.translated_supporting_questions TO authenticated;
GRANT SELECT ON TABLE klare_content.translated_transformation_paths TO authenticated;
GRANT SELECT ON TABLE public.translated_content_sections TO authenticated;
GRANT SELECT ON TABLE public.translated_exercise_steps TO authenticated;
GRANT SELECT ON TABLE public.translated_journal_template_categories TO authenticated;
GRANT SELECT ON TABLE public.translated_journal_templates TO authenticated;
GRANT SELECT ON TABLE public.translated_module_contents TO authenticated;
GRANT SELECT ON TABLE public.translated_quiz_questions TO authenticated;

-- Kommentar für Entwickler
COMMENT ON FUNCTION update_translations IS 'Diese Funktion erfordert Authentication. Nur authentifizierte Benutzer können Übersetzungen aktualisieren.';

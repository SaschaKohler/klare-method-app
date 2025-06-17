-- Migration: Anweisungen und Vervollständigung der Content Section Übersetzungen
-- Diese Migration enthält Anweisungen für die weitere Entwicklung

-- Hinweis: Dies ist die Basis-Implementierung der Content Section Übersetzungen
-- Weitere Content Sections müssen nach und nach übersetzt werden, wenn sie identifiziert werden

-- R (Realisierung) -> A (Action) Content Sections werden benötigt
-- E (Entfaltung) -> R (Realization) Content Sections werden benötigt

-- Test der View-Funktionalität
-- Nach Anwendung dieser Migrationen sollte folgende Query englische Übersetzungen anzeigen:
-- SELECT title, title_en, content, content_en FROM translated_content_sections WHERE title_en IS NOT NULL;

-- Weitere Übersetzungen können mit folgendem Pattern hinzugefügt werden:
-- UPDATE content_sections SET translations = jsonb_set(
--   COALESCE(translations, '{}'::jsonb),
--   '{en}',
--   '{"title": "English Title", "content": "English Content..."}'::jsonb
-- ) WHERE title = 'Deutscher Titel';

-- Kommentar für Entwickler
COMMENT ON VIEW translated_content_sections IS 'View funktioniert jetzt mit englischen Übersetzungen für K (Clarity), L (Liveliness), A->E (Evolvement) Content Sections. Weitere Übersetzungen für R->A (Action) und E->R (Realization) folgen in zukünftigen Migrationen.';

-- Optional: Test-Query für Entwickler (als Kommentar)
-- SELECT 
--   title as german_title,
--   title_en as english_title,
--   CASE 
--     WHEN title_en IS NOT NULL AND title_en != title THEN 'TRANSLATED'
--     ELSE 'NEEDS_TRANSLATION'
--   END as translation_status
-- FROM translated_content_sections 
-- ORDER BY translation_status, title;

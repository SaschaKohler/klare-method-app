-- Migration: Englische Übersetzungen für Entfaltung (E) Content Sections
-- KLARE -> CLEAR: E = Entfaltung -> R = Realization

-- Diese Migration ist vorbereitet für zukünftige E (Entfaltung) Content Sections
-- Sobald entsprechende deutsche Content Sections erstellt werden, können hier
-- die englischen Übersetzungen hinzugefügt werden

-- Beispiel-Pattern für zukünftige E->R Übersetzungen:
-- UPDATE content_sections SET translations = jsonb_set(
--   COALESCE(translations, '{}'::jsonb),
--   '{en}',
--   '{"title": "What is Realization?", "content": "# What is Realization?\n\nRealization is the natural unfolding of your authentic potential..."}'::jsonb
-- ) WHERE title = 'Was ist Entfaltung?';

-- UPDATE content_sections SET translations = jsonb_set(
--   COALESCE(translations, '{}'::jsonb),
--   '{en}',
--   '{"title": "Continuous Growth", "content": "# Continuous Growth\n\nSustainable development and expansion..."}'::jsonb
-- ) WHERE title = 'Kontinuierliches Wachstum';

-- UPDATE content_sections SET translations = jsonb_set(
--   COALESCE(translations, '{}'::jsonb),
--   '{en}',
--   '{"title": "Effortless Manifestation", "content": "# Effortless Manifestation\n\nWhen action flows naturally from alignment..."}'::jsonb
-- ) WHERE title = 'Mühelose Manifestation';

-- Placeholder-Updates für Demonstration (werden nur ausgeführt wenn entsprechende deutsche Titel existieren)
UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "Complete Congruence in All Dimensions", "content": "# Complete Congruence in All Dimensions\n\nAchieving harmony and alignment across all areas of life."}'::jsonb
) WHERE title = 'Vollständige Kongruenz in allen Dimensionen';

UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "Continuous Growth", "content": "# Continuous Growth\n\nEmbracing ongoing development and the natural evolution of your authentic self."}'::jsonb
) WHERE title = 'Kontinuierliches Wachstum';

-- Kommentar für Entwickler
COMMENT ON COLUMN content_sections.translations IS 'E->R (Realization) Übersetzungsstruktur vorbereitet. Weitere Übersetzungen folgen wenn entsprechende deutsche Content Sections erstellt werden.';

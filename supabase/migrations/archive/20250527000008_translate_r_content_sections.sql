-- Migration: Englische Übersetzungen für Realisierung (R) Content Sections
-- KLARE -> CLEAR: R = Realisierung -> A = Action

-- Diese Migration ist vorbereitet für zukünftige R (Realisierung) Content Sections
-- Sobald entsprechende deutsche Content Sections erstellt werden, können hier
-- die englischen Übersetzungen hinzugefügt werden

-- Beispiel-Pattern für zukünftige R->A Übersetzungen:
-- UPDATE content_sections SET translations = jsonb_set(
--   COALESCE(translations, '{}'::jsonb),
--   '{en}',
--   '{"title": "What is Action?", "content": "# What is Action?\n\nAction is about turning insights into reality..."}'::jsonb
-- ) WHERE title = 'Was ist Realisierung?';

-- UPDATE content_sections SET translations = jsonb_set(
--   COALESCE(translations, '{}'::jsonb),
--   '{en}',
--   '{"title": "From Ideas to Implementation", "content": "# From Ideas to Implementation\n\nThe gap between knowing and doing..."}'::jsonb
-- ) WHERE title = 'Von Ideen zur Umsetzung';

-- UPDATE content_sections SET translations = jsonb_set(
--   COALESCE(translations, '{}'::jsonb),
--   '{en}',
--   '{"title": "Sustainable Integration in Daily Life", "content": "# Sustainable Integration in Daily Life\n\nMaking new patterns stick..."}'::jsonb
-- ) WHERE title = 'Nachhaltige Integration im Alltag';

-- Placeholder-Update für Demonstration (wird nur ausgeführt wenn entsprechende deutsche Titel existieren)
UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "Consistent Realization", "content": "# Consistent Realization\n\nTurning insights into consistent action and sustainable change in daily life."}'::jsonb
) WHERE title = 'Konsequente Realisierung';

UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "Self-Reinforcing New Habits", "content": "# Self-Reinforcing New Habits\n\nCreating habits that maintain themselves and support continued growth."}'::jsonb
) WHERE title = 'Selbstverstärkende neue Gewohnheiten';

-- Kommentar für Entwickler
COMMENT ON COLUMN content_sections.translations IS 'R->A (Action) Übersetzungsstruktur vorbereitet. Weitere Übersetzungen folgen wenn entsprechende deutsche Content Sections erstellt werden.';

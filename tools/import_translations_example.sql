-- SQL-Skript zum Importieren von Übersetzungen
-- Dieses Skript zeigt, wie Übersetzungen importiert werden können

-- Erstelle eine temporäre Tabelle für den Import
CREATE TEMP TABLE translations_import (
  id TEXT,
  field_name TEXT,
  translated_text TEXT
);

-- Beispielhafte Einfügungen (ersetzen Sie diese durch Ihre tatsächlichen Übersetzungen)
-- Format: table_id, Feldname, übersetzter Text

-- Beispiel 1: Übersetzung für eine practical_exercise
INSERT INTO translations_import (id, field_name, translated_text) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'title', 'Exercise Title in English'),
('123e4567-e89b-12d3-a456-426614174000', 'description', 'This is the exercise description in English.');

-- Beispiel 2: Übersetzung für eine supporting_question
INSERT INTO translations_import (id, field_name, translated_text) VALUES
('123e4567-e89b-12d3-a456-426614174001', 'question_text', 'This is a supporting question in English?');

-- Beispiel 3: Übersetzung für einen transformation_path
INSERT INTO translations_import (id, field_name, translated_text) VALUES
('123e4567-e89b-12d3-a456-426614174002', 'from_text', 'From this state (English)'),
('123e4567-e89b-12d3-a456-426614174002', 'to_text', 'To this state (English)');

-- Import der Übersetzungen mit den Batch-Import-Funktionen
-- Ersetzen Sie 'table_name' und 'schema_name' durch die tatsächlichen Werte

-- Für practical_exercises
SELECT import_translations_batch('practical_exercises', 'klare_content', 'en');

-- Für supporting_questions
SELECT import_translations_batch('supporting_questions', 'klare_content', 'en');

-- Für transformation_paths
SELECT import_translations_batch('transformation_paths', 'klare_content', 'en');

-- Diese Skript kann als Vorlage verwendet werden. In der Praxis würden Sie:
-- 1. Die exportierten Daten übersetzen (manuell oder durch einen Übersetzungsdienst)
-- 2. Die Übersetzungen in das richtige Format für den Import konvertieren
-- 3. Dieses Skript mit den tatsächlichen Übersetzungen ausführen

-- Alternativ können Sie auch die update_translations-Funktion direkt für einzelne Einträge verwenden:
SELECT update_translations(
  'practical_exercises',
  'klare_content',
  '123e4567-e89b-12d3-a456-426614174000',
  'en',
  '{"title": "Exercise Title in English", "description": "This is the exercise description in English."}'::jsonb
);

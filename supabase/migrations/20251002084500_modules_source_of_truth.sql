-- =============================================
-- Modules as source of truth for module metadata
-- =============================================

-- 1) Harmonize IDs as UUID
ALTER TABLE module_contents
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN module_content_id TYPE uuid USING module_content_id::uuid;

ALTER TABLE content_sections
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN module_id TYPE uuid USING module_id::uuid;

ALTER TABLE excercise_steps
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN module_content_id TYPE uuid USING module_content_id::uuid;

ALTER TABLE quiz_questions
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN module_content_id TYPE uuid USING module_content_id::uuid;

-- 3) Legacy mapping zwischen Slugs, Modulen und Bestandsinhalten
CREATE TABLE IF NOT EXISTS legacy_module_mapping (
  slug text PRIMARY KEY,
  module_id uuid NOT NULL,
  legacy_module_content_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

WITH mapping_data(slug, legacy_module_content_id) AS (
  VALUES
    ('a-intro',            '54b29d5a-ca3f-4c8c-83c2-e9af20353032'),
    ('a-theory',           '3d29b000-6cb4-4944-ae50-5a53c43ca721'),
    ('a-values-hierarchy', '4f95c8a5-10db-4be4-9a55-d547ce5faed4'),
    ('a-vision-board',     '6e5efcb9-b7eb-43df-9a62-bcb349973711'),
    ('k-clarity-journal',  'cacab4bf-807d-4fc4-894a-fea946d80590'),
    ('k-reality-check',        'K', 'Realitäts-Check Übung',                   'Ehrliche Bestandsaufnahme Ihrer aktuellen Situation',                                    'exercise', 4, 20),
    ('k-incongruence-finder',  'K', 'Inkongruenz-Finder',                      'Diskrepanzen zwischen Denken, Fühlen und Handeln erkennen',                              'exercise', 5, 25),
    ('k-reflection',           'K', 'Klarheits-Reflexion',                     'Reflexion der Erkenntnisse aus den Klarheits-Übungen',                                   'exercise', 6, 10),
    ('k-quiz',                 'K', 'Klarheits-Quiz',                          'Verständnis des Klarheits-Konzepts überprüfen',                                          'quiz',     7,  5),
    ('k-genius-gate',          'K', 'Genius Gate – Kommunikation mit dem Unbewussten', 'Techniken, um durch präzise Fragen zu tiefer Selbsterkenntnis zu gelangen',         'theory',   4, 15),
    ('k-genius-gate-practice', 'K', 'Genius Gate in der Praxis',               'Praktische Anwendung der Genius-Gate-Fragetechniken in konkreten Situationen',            'exercise', 5, 20),
    ('k-incongruence-mapping', 'K', 'Inkongruenzen kartieren',                 'Innere Konflikte erkennen und visualisieren, um Harmonie zu schaffen',                    'exercise', 6, 25),
    ('k-metamodel-practice',   'K', 'Metamodell in der Praxis',                'Präzise Sprache nutzen, um Klarheit im Alltag zu fördern',                                 'exercise', 7, 20),
    ('k-clarity-journal',      'K', 'Klarheits-Tagebuch',                      'Tägliche Praxis, um Klarheit dauerhaft zu verankern',                                     'exercise', 8, 15),
    ('l-embodiment',       'af170333-2007-4203-a16c-df1fee452491'),
    ('l-energy-blockers',  '9bf7a223-8c2d-46d4-8b0b-f0b8eade8ed0'),
    ('l-intro',            'd8b8af00-7d10-47b5-8a70-9a7d9da97203'),
    ('l-quiz',             'd9fa6bb3-f70a-4e35-a219-93aec6961a2f'),
    ('l-resource-finder',  'e73eed23-fabc-4a23-967b-9693aa850135'),
    ('l-vitality-moments', '708b3dc7-ee21-4517-a514-d4e4ab24279e')
)
INSERT INTO legacy_module_mapping (slug, module_id, legacy_module_content_id)
SELECT md.slug,
       m.id,
       md.legacy_module_content_id::uuid
FROM mapping_data md
JOIN modules m ON m.slug = md.slug
ON CONFLICT (slug) DO UPDATE
SET module_id = EXCLUDED.module_id,
    legacy_module_content_id = EXCLUDED.legacy_module_content_id;

-- 4) Module-Inhalte mit neuen Modul-IDs verknüpfen
ALTER TABLE module_contents
  ADD COLUMN IF NOT EXISTS module_id uuid;

UPDATE module_contents mc
SET module_id = map.module_id
FROM legacy_module_mapping map
WHERE mc.module_content_id = map.legacy_module_content_id;

ALTER TABLE module_contents
  ALTER COLUMN module_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS module_contents_module_id_idx ON module_contents(module_id);

-- 2) Link module_contents to modules and copy metadata
ALTER TABLE module_contents
  ADD COLUMN IF NOT EXISTS module_id uuid REFERENCES modules(id);

UPDATE module_contents mc
SET module_id = m.id
FROM modules m
WHERE mc.module_content_id = m.id;

ALTER TABLE module_contents
  ALTER COLUMN module_id SET NOT NULL,
  DROP COLUMN module_content_id;

ALTER TABLE module_contents
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS content_type text,
  ADD COLUMN IF NOT EXISTS klare_step text,
  ADD COLUMN IF NOT EXISTS difficulty_level integer,
  ADD COLUMN IF NOT EXISTS duration integer,
  ADD COLUMN IF NOT EXISTS estimated_duration integer,
  ADD COLUMN IF NOT EXISTS title_localized text;

UPDATE module_contents mc
SET
  description = m.description,
  content_type = m.content_type,
  klare_step = m.klare_step,
  difficulty_level = m.difficulty_level,
  estimated_duration = m.estimated_duration,
  title_localized = m.title
FROM modules m
WHERE mc.module_id = m.id;

-- 3) Views that combine module metadata and content
CREATE OR REPLACE VIEW module_content_full AS
SELECT
  m.id AS module_id,
  m.klare_step,
  m.title AS module_title,
  m.description AS module_description,
  m.content_type,
  m.order_index,
  m.difficulty_level,
  m.estimated_duration,
  m.is_active,
  m.prerequisites,
  m.learning_objectives,
  m.tags,
  m.metadata,
  m.created_at AS module_created_at,
  m.updated_at AS module_updated_at,
  mc.id AS content_id,
  mc.title AS content_title,
  mc.content,
  mc.media_url,
  mc.order_index AS content_order_index,
  mc.translations,
  mc.created_at AS content_created_at,
  mc.updated_at AS content_updated_at
FROM modules m
LEFT JOIN module_contents mc ON mc.module_id = m.id;

CREATE OR REPLACE VIEW module_content_sections_full AS
SELECT
  m.id AS module_id,
  cs.id AS section_id,
  cs.content_type,
  cs.title,
  cs.description,
  cs.content,
  cs.order_index,
  cs.translations,
  cs.created_at,
  cs.updated_at
FROM modules m
LEFT JOIN module_contents mc ON mc.module_id = m.id
LEFT JOIN content_sections cs ON cs.module_id = mc.id;

CREATE OR REPLACE VIEW module_exercise_steps_full AS
SELECT
  m.id AS module_id,
  es.id AS step_id,
  es.title,
  es.instructions,
  es.step_type,
  es.options,
  es.order_index,
  es.translations,
  es.created_at,
  es.updated_at
FROM modules m
LEFT JOIN module_contents mc ON mc.module_id = m.id
LEFT JOIN excercise_steps es ON es.module_content_id = mc.id;

CREATE OR REPLACE VIEW module_quiz_questions_full AS
SELECT
  m.id AS module_id,
  qq.id AS question_id,
  qq.question AS question_text,
  qq.question_type,
  qq.options,
  qq.correct_answer,
  qq.explanation,
  qq.order_index,
  qq.translations,
  qq.created_at,
  qq.updated_at
FROM modules m
LEFT JOIN module_contents mc ON mc.module_id = m.id
LEFT JOIN quiz_questions qq ON qq.module_content_id = mc.id;

-- 4) Helpful indexes
CREATE INDEX IF NOT EXISTS module_contents_module_id_idx ON module_contents(module_id);
CREATE INDEX IF NOT EXISTS module_contents_klare_step_idx ON module_contents(klare_step);

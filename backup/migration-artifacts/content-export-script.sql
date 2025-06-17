-- KLARE-App Content Export Script
-- Based on Migration Plan from Obsidian

-- Create export directory first (run in terminal):
-- mkdir -p /tmp/klare-export

-- Export alle wertvollen Inhalte
COPY (SELECT * FROM module_contents) TO '/tmp/klare-export/module_contents.csv' CSV HEADER;
COPY (SELECT * FROM content_sections) TO '/tmp/klare-export/content_sections.csv' CSV HEADER;
COPY (SELECT * FROM exercise_steps) TO '/tmp/klare-export/exercise_steps.csv' CSV HEADER;
COPY (SELECT * FROM quiz_questions) TO '/tmp/klare-export/quiz_questions.csv' CSV HEADER;
COPY (SELECT * FROM journal_templates) TO '/tmp/klare-export/journal_templates.csv' CSV HEADER;
COPY (SELECT * FROM journal_template_categories) TO '/tmp/klare-export/template_categories.csv' CSV HEADER;

-- Translation Data (wichtig!)
COPY (
  SELECT id, title, translations
  FROM module_contents 
  WHERE translations IS NOT NULL
) TO '/tmp/klare-export/module_translations.csv' CSV HEADER;

-- Life Wheel Areas Export
COPY (SELECT * FROM life_wheel_areas) TO '/tmp/klare-export/life_wheel_areas.csv' CSV HEADER;

-- User Data (falls vorhanden)
COPY (SELECT * FROM user_profiles) TO '/tmp/klare-export/user_profiles.csv' CSV HEADER;
COPY (SELECT * FROM life_wheel_snapshots) TO '/tmp/klare-export/life_wheel_snapshots.csv' CSV HEADER;

-- klare_content Schema Export
COPY (SELECT * FROM klare_content.practical_exercises) TO '/tmp/klare-export/practical_exercises.csv' CSV HEADER;
COPY (SELECT * FROM klare_content.supporting_questions) TO '/tmp/klare-export/supporting_questions.csv' CSV HEADER;
COPY (SELECT * FROM klare_content.transformation_paths) TO '/tmp/klare-export/transformation_paths.csv' CSV HEADER;

-- Export completed views for reference
COPY (SELECT * FROM translated_module_contents) TO '/tmp/klare-export/translated_module_contents.csv' CSV HEADER;
COPY (SELECT * FROM translated_content_sections) TO '/tmp/klare-export/translated_content_sections.csv' CSV HEADER;
COPY (SELECT * FROM translated_exercise_steps) TO '/tmp/klare-export/translated_exercise_steps.csv' CSV HEADER;
COPY (SELECT * FROM translated_journal_templates) TO '/tmp/klare-export/translated_journal_templates.csv' CSV HEADER;

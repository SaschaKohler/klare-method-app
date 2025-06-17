-- Migration: Englische Übersetzungen für weitere Content Sections (Teil 1)
-- Übersetzung von spezifischen Content Sections, die bereits vorhanden sind

-- Universal Modeling Processes Detail
UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "The Universal Modeling Processes in Detail", "content": "# The Universal Modeling Processes in Detail\n\n## How Our Brain Filters Reality\n\nEvery second, our nervous system processes millions of bits of information, but we can only consciously process about 7±2 pieces of information. This requires three fundamental processes:\n\n### 1. Deletion (Tilgung)\nWe filter out information that seems irrelevant or overwhelming.\n\n### 2. Distortion (Verzerrung)  \nWe modify information to fit our existing beliefs and mental models.\n\n### 3. Generalization (Verallgemeinerung)\nWe create rules and patterns from limited experiences.\n\nUnderstanding these processes is essential for developing true clarity."}'::jsonb
) WHERE title = 'Die universalen Modellierungsprozesse im Detail';

-- Selbsttäuschung
UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "The Psychology of Self-Deception", "content": "# The Psychology of Self-Deception\n\nSelf-deception is one of the biggest obstacles to clarity. We unconsciously protect ourselves from uncomfortable truths through various psychological mechanisms:\n\n## Common Self-Deception Patterns\n- Rationalization of uncomfortable behaviors\n- Selective attention to confirming information\n- Minimizing problems or their consequences\n- Projecting responsibility onto others\n\n## Breaking Through Self-Deception\n- Cultivate radical honesty with yourself\n- Seek feedback from trusted sources\n- Question your automatic assumptions\n- Practice mindful self-observation"}'::jsonb
) WHERE title = 'Die Psychologie der Selbsttäuschung';

-- Reality Check
UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "The Four Pillars of Reality Check", "content": "# The Four Pillars of Reality Check\n\nA systematic reality check helps you see your situation clearly and objectively:\n\n## 1. Factual Assessment\nWhat are the objective, measurable facts?\n\n## 2. Emotional Awareness\nWhat are you feeling, and why?\n\n## 3. Pattern Recognition\nWhat recurring themes do you notice?\n\n## 4. Blind Spot Investigation\nWhat might you be missing or avoiding?\n\nThese four pillars create a comprehensive foundation for clarity."}'::jsonb
) WHERE title = 'Die vier Säulen des Reality-Checks';

-- Energy Sources and Blocks (from Liveliness)
UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "Energy Sources and Blocks", "content": "# Energy Sources and Blocks\n\n## Natural Energy Sources\n- Intrinsic motivation and passion\n- Connection to personal values\n- Meaningful relationships\n- Creative expression\n- Physical vitality and health\n- Spiritual practices and connection\n\n## Common Energy Drains\n- Chronic stress and overwhelm\n- Toxic relationships or environments\n- Activities that conflict with values\n- Physical neglect or poor health habits\n- Lack of purpose or meaning\n- Suppressed emotions or creativity\n\nBalancing these elements is key to sustainable liveliness."}'::jsonb
) WHERE title = 'Energiequellen und Blockaden';

-- Kommentar für Entwickler
COMMENT ON COLUMN content_sections.translations IS 'Weitere englische Übersetzungen für Content Sections hinzugefügt (Teil 1)';

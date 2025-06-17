-- Migration: Englische Übersetzungen für Lebendigkeit (L) Content Sections
-- KLARE -> CLEAR: L = Lebendigkeit -> L = Liveliness

-- Lebendigkeit Hauptinhalte
UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "What is Liveliness?", "content": "# What is Liveliness?\n\nLiveliness is the natural vitality and energy that flows through us when we are aligned with our authentic self. It is not forced excitement or artificial stimulation, but rather the organic aliveness that emerges when we remove obstacles to our natural state.\n\nLiveliness manifests as:\n- Natural enthusiasm and energy\n- Spontaneous joy and lightness\n- Effortless engagement with life\n- A sense of vitality and presence"}'::jsonb
) WHERE title = 'Was ist Lebendigkeit?';

UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "Blocks to Liveliness", "content": "# Blocks to Liveliness\n\nVarious factors can block our natural vitality and energy:\n\n## Internal Blocks\n- Limiting beliefs about ourselves\n- Suppressed emotions and feelings\n- Perfectionism and self-criticism\n- Fear of judgment or rejection\n\n## External Blocks\n- Toxic relationships or environments\n- Overwhelming responsibilities\n- Lack of boundaries\n- Disconnection from nature and body\n\nRecognizing these blocks is the first step to transforming them."}'::jsonb
) WHERE title = 'Blockaden der Lebendigkeit';

UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "The Path Back to Liveliness", "content": "# The Path Back to Liveliness\n\nRecovering your natural vitality requires a gentle but consistent approach:\n\n## 1. Awareness\nNotice when you feel most alive and energized. What conditions support your liveliness?\n\n## 2. Release\nIdentify and release the blocks that drain your energy.\n\n## 3. Nourishment\nEngage in activities that naturally restore and increase your vitality.\n\n## 4. Integration\nMake liveliness-supporting practices a regular part of your daily life."}'::jsonb
) WHERE title = 'Der Weg zurück zur Lebendigkeit';

-- Lebendigkeit Theorie
UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "The Scientific Foundation", "content": "# The Scientific Foundation of Liveliness\n\nResearch from psychology, neurobiology, and somatic studies provides evidence for the importance of natural vitality:\n\n- Positive psychology shows that intrinsic motivation leads to greater well-being\n- Neuroscience reveals how joy and enthusiasm enhance cognitive function\n- Somatic research demonstrates the body-mind connection in vitality\n- Studies on flow states show the power of effortless engagement"}'::jsonb
) WHERE title = 'Die wissenschaftliche Basis' AND EXISTS (
  SELECT 1 FROM module_contents mc 
  WHERE mc.id = content_sections.module_content_id 
  AND mc.module_id LIKE '%lebendigkeit%'
);

UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "The Body-Mind Connection in Liveliness", "content": "# The Body-Mind Connection in Liveliness\n\nThe body is not just a vessel for the mind, but an intelligent system with its own wisdom. Physical practices can provide more direct pathways to liveliness than purely mental approaches.\n\n## Embodiment Research\nStudies show that posture, movement patterns, and physical habits profoundly influence our mental and emotional states.\n\n## Practical Applications\n- Breathwork for energy regulation\n- Movement for vitality activation\n- Body awareness for emotional intelligence\n- Grounding practices for presence"}'::jsonb
) WHERE title = 'Der Körper-Geist-Zusammenhang';

-- Kommentar für Entwickler
COMMENT ON COLUMN content_sections.translations IS 'Englische Übersetzungen für Lebendigkeit (L) Content Sections hinzugefügt - KLARE->CLEAR: L->L';

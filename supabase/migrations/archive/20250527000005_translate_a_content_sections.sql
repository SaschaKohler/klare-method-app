-- Migration: Englische Übersetzungen für Ausrichtung (A) Content Sections  
-- KLARE -> CLEAR: A = Ausrichtung -> E = Evolvement (Entwicklung/Evolution)

-- Ausrichtung Hauptinhalte
UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "What is Evolvement?", "content": "# What is Evolvement?\n\nEvolvement (Ausrichtung) means living in harmony with your deepest values and authentic self. It is the process of aligning your actions, goals, and daily choices with what truly matters to you.\n\nEvolvement includes:\n- Clarity about your core values\n- Alignment between beliefs and actions\n- Integration of different life areas\n- Coherent life vision and direction\n- Authentic self-expression"}'::jsonb
) WHERE title = 'Was ist Ausrichtung?';

UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "The Challenge of Evolvement", "content": "# The Challenge of Evolvement\n\nMany people struggle to align their actions with their deeper values:\n\n## Common Challenges\n- Conflicting priorities and demands\n- Unclear or unconscious values\n- External pressures and expectations\n- Fear of change or judgment\n- Compartmentalized life areas\n\n## The Cost of Misalignment\n- Chronic stress and dissatisfaction\n- Feeling fragmented or inauthentic\n- Difficulty making decisions\n- Lack of meaning and purpose"}'::jsonb
) WHERE title = 'Die Herausforderung der Ausrichtung';

UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "The Path to Evolvement", "content": "# The Path to Evolvement\n\nAchieving true alignment requires a systematic approach:\n\n## 1. Values Clarification\nIdentify your core values and their hierarchy.\n\n## 2. Vision Development\nCreate a compelling vision of your aligned life.\n\n## 3. Integration Process\nAlign your actions with your values across all life areas.\n\n## 4. Decision Framework\nDevelop criteria for making value-based decisions.\n\n## 5. Continuous Refinement\nRegularly review and adjust your alignment as you grow."}'::jsonb
) WHERE title = 'Der Weg zur Ausrichtung';

-- Ausrichtung Theorie
UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "The Scientific Foundation", "content": "# The Scientific Foundation of Evolvement\n\nResearch from values psychology, identity development, and systems theory supports the importance of alignment:\n\n- Values-based living correlates with higher life satisfaction\n- Identity coherence reduces psychological stress\n- Integrated life approaches improve well-being\n- Purpose-driven behavior enhances resilience"}'::jsonb
) WHERE title = 'Die wissenschaftliche Basis' AND EXISTS (
  SELECT 1 FROM module_contents mc 
  WHERE mc.id = content_sections.module_content_id 
  AND mc.module_id LIKE '%ausrichtung%'
);

-- Kommentar für Entwickler
COMMENT ON COLUMN content_sections.translations IS 'Englische Übersetzungen für Ausrichtung (A) Content Sections hinzugefügt - KLARE->CLEAR: A->E';

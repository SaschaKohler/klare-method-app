-- Migration: Englische Übersetzungen für Klarheit (K) Content Sections
-- KLARE -> CLEAR: K = Klarheit -> C = Clarity

-- Klarheit Intro Content
UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "The Universal Modeling Processes", "content": "# The Universal Modeling Processes\n\nOur brain processes information through three fundamental mechanisms: Deletion, Distortion, and Generalization. Understanding these processes is crucial for developing clarity about our current situation.\n\n## Deletion\nWe filter out most of the information around us to avoid cognitive overload. However, this can lead to important details being overlooked.\n\n## Distortion\nWe interpret information based on our beliefs and experiences, which can lead to misunderstandings.\n\n## Generalization\nWe create patterns and rules from limited experiences, which can be both helpful and limiting."}'::jsonb
) WHERE title = 'Die drei universalen Modellierungsprozesse';

UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "The Theory Behind Clarity", "content": "# The Theory Behind Clarity\n\nClarity is the foundation of the CLEAR method. It involves honest self-reflection and precise assessment of your current situation. Only when we see reality clearly can we make meaningful changes.\n\nThe clarity step helps you:\n- Recognize your current situation honestly\n- Identify patterns and unconscious processes\n- Develop authentic self-awareness\n- Create a solid foundation for transformation"}'::jsonb
) WHERE title = 'Die Theorie hinter Klarheit';

-- Genius Gate Content
UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "The Fundamentals of the Genius Gate", "content": "# The Fundamentals of the Genius Gate\n\nThe Genius Gate is a powerful questioning technique that helps you uncover deleted, distorted, or generalized information. It serves as a gateway to deeper understanding and clarity.\n\nBy asking the right questions, you can:\n- Recover deleted information\n- Recognize distortions in your thinking\n- Challenge limiting generalizations\n- Gain clarity about your true situation"}'::jsonb
) WHERE title = 'Die Grundlagen des Genius Gate';

UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  '{"title": "The Core Questions of the Genius Gate", "content": "# The Core Questions of the Genius Gate\n\nThe Genius Gate uses specific questions to uncover hidden information:\n\n**For Deletion:** \"What specifically?\", \"Who exactly?\", \"When precisely?\"\n\n**For Distortion:** \"How specifically?\", \"According to whom?\", \"What evidence?\"\n\n**For Generalization:** \"Always?\", \"Never?\", \"Everyone?\", \"All?\"\n\nThese questions help you move from vague statements to precise, actionable insights."}'::jsonb
) WHERE title = 'Die Kernfragen des Genius Gate';

-- Kommentar für Entwickler
COMMENT ON COLUMN content_sections.translations IS 'Englische Übersetzungen für Klarheit (K) Content Sections hinzugefügt - KLARE->CLEAR: K->C';

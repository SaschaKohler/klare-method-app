-- Migration: Übersetzung der verbleibenden Content Sections
-- Basiert auf der Liste der unübersetzten Content Sections aus der Analyse

-- Verbleibende wichtige Content Sections
UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Daily Application',
    'content', 'The Genius Gate is not a one-time tool, but a daily practice. Here''s how you can integrate it into your daily routine and use it for continuous self-development and clarity.'
  )
) WHERE title = 'Anwendung im Alltag';

UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'The Concept of Logical Levels',
    'content', '# The Concept of Logical Levels\n\nThe theory of logical levels developed by Robert Dilts describes different levels of change and experience:\n\n## Environment (Where & When)\nThe external context and conditions\n\n## Behavior (What)\nSpecific actions and reactions\n\n## Capabilities (How) \nSkills, strategies, and states\n\n## Beliefs & Values (Why)\nBeliefs, values, and motivations\n\n## Identity (Who)\nSense of self and mission\n\n## Purpose/Spirit (For What)\nConnection to the larger whole\n\nUnderstanding these levels helps create sustainable alignment.'
  )
) WHERE title = 'Das Konzept der logischen Ebenen';

UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Your Path to Clarity',
    'content', 'In the following modules you will:\n\n1. Create your life wheel to get an overview of different life areas\n2. Learn the Genius Gate technique for precise questioning\n3. Recognize and overcome self-deceptions\n4. Develop skills for ongoing clarity in daily life\n\nEach step builds on the previous one and leads you to greater self-awareness and authentic self-knowledge.'
  )
) WHERE title = 'Ihr Weg zur Klarheit';

UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Causal Modeling Process',
    'content', 'Our worldview emerges through a causal modeling process. We perceive the world through our five senses, but our nervous system can only process a limited amount of information consciously. This requires filtering, interpretation, and pattern creation - processes that can lead to clarity or confusion.'
  )
) WHERE title = 'Kausaler Modellierungsprozess';

UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Meta-Model of Language',
    'content', 'The Meta-Model of language is a powerful tool for gaining clarity. It helps us recognize the hidden structure of language and recover deleted, distorted, or generalized information. Through precise questions, we can uncover the full picture behind vague statements.'
  )
) WHERE title = 'Meta-Modell der Sprache';

UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Practical Application',
    'content', 'The application of these theories in daily life can be transformative:\n\n1. **Observe Your Language**: Notice when you use vague or absolute statements\n2. **Ask Precise Questions**: Use Meta-Model questions to gain clarity\n3. **Challenge Assumptions**: Question your automatic thought patterns\n4. **Seek Evidence**: Look for concrete facts behind general statements\n\nThese practices lead to greater self-awareness and more effective communication.'
  )
) WHERE title = 'Praktische Anwendung';

UPDATE content_sections SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Why is Clarity so Important?',
    'content', 'Clarity is the cornerstone of every successful change. Without a clear understanding of your current situation, you lack the foundation for any meaningful transformation. It''s like trying to navigate without knowing your starting point - you might move, but you won''t reach your desired destination efficiently.'
  )
) WHERE title = 'Warum ist Klarheit so wichtig?';

-- Kommentar für Entwickler
COMMENT ON COLUMN content_sections.translations IS 'Verbleibende wichtige Content Sections übersetzt - fast vollständige Abdeckung erreicht';

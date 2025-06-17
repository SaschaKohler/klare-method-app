-- Migration: Englische Übersetzungen für Quiz Questions (Teil 3)

UPDATE quiz_questions SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'question', 'Why is the body an important aspect when working with liveliness?',
    'explanation', 'The body is not just a vehicle for our mind, but an intelligent system with its own wisdom. Physical practices can provide more direct and faster pathways to greater liveliness than purely mental processes. Embodiment research shows that posture, movement patterns, and physical habits profoundly influence our mental and emotional states.',
    'options', jsonb_build_array(
      'Because physical fitness is the most important thing',
      'Because the body stores memories and emotions',
      'Because the body is an intelligent system that can directly influence our mental and emotional states',
      'Because body exercises are easier than mental exercises'
    )
  )
) WHERE question = 'Warum ist der Körper ein wichtiger Aspekt bei der Arbeit mit Lebendigkeit?';

-- Weitere Quiz Questions falls vorhanden
UPDATE quiz_questions SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'question', 'What are typical energy blockers that can hinder our natural liveliness?',
    'explanation', 'Energy blockers are internal or external factors that drain our natural vitality and prevent us from accessing our authentic energy sources.',
    'options', jsonb_build_array(
      'Perfectionism and self-criticism',
      'Regular exercise',
      'Healthy nutrition',
      'Adequate sleep'
    )
  )
) WHERE question = 'Was sind typische Energieblocker, die unsere natürliche Lebendigkeit behindern können?';

-- Kommentar für Entwickler
COMMENT ON COLUMN quiz_questions.translations IS 'Quiz Questions Übersetzungen für K (Clarity) und L (Liveliness) hinzugefügt';

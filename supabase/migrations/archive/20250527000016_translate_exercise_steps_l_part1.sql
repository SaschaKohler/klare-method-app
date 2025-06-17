-- Migration: Englische Übersetzungen für Exercise Steps (Lebendigkeit - Teil 1)
-- Übersetzung von Vitality Moments Exercise Steps

-- Lebendigkeit: Vitality Moments - Einführung
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Introduction',
    'instructions', 'In this exercise, you will learn to consciously perceive and strengthen moments of natural liveliness.

Liveliness often shows itself in small, everyday moments - a smile that comes from the heart, enjoying a cup of tea, or the joy of hearing a favorite song. These moments are clues to your natural, authentic state.

Take about 15 minutes for this exercise. Find a quiet place where you can be undisturbed.'
  )
) WHERE title = 'Einführung' AND instructions LIKE '%Lebendigkeit bewusst wahrzunehmen%';

-- Lebendigkeit: Vitality Moments - Schritt 1
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Remembering Liveliness Moments',
    'instructions', 'Think back to the last three days. When did you feel particularly alive, energized, or authentic?

These could be small moments like:
- A moment of laughter with friends
- A walk in nature that felt refreshing
- Successfully completing a task
- A moment of deep connection with someone
- Feeling grateful or appreciative

Write down at least 3-5 such moments. Be as specific as possible about what exactly made these moments special.'
  )
) WHERE title LIKE '%Lebendigkeits-Momente%' AND instructions LIKE '%letzten drei Tage%';

-- Lebendigkeit: Vitality Moments - Schritt 2  
UPDATE exercise_steps SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'title', 'Body Signals of Liveliness',
    'instructions', 'Now focus on the physical sensations during your liveliness moments.

How did your body feel during these moments?
- Was your breathing deeper or lighter?
- Did you feel warmth, tingling, or expansion?
- How was your posture or movement?
- Did you feel energy flowing through specific parts of your body?

These physical signals are important indicators of your authentic state. Write down what you noticed about your body during these moments.'
  )
) WHERE instructions LIKE '%körperlichen Empfindungen%' AND instructions LIKE '%Lebendigkeits-Momente%';

-- Kommentar für Entwickler
COMMENT ON COLUMN exercise_steps.translations IS 'Erste Übersetzungen für Lebendigkeit Exercise Steps hinzugefügt';

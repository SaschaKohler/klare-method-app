-- Migration: Englische Übersetzungen für Quiz Questions (Teil 2)

UPDATE quiz_questions SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'question', 'Which of the following are natural (not artificial) energy sources?',
    'explanation', 'Natural energy sources come from within us and are sustainable. Intrinsic motivation and connection to our values are natural energy sources, while substances like caffeine or stress-induced adrenaline represent artificial, short-term energy sources.',
    'options', jsonb_build_array(
      'Intrinsic motivation and passion',
      'Caffeine and stimulants', 
      'Connection to personal values',
      'Stress and time pressure'
    )
  )
) WHERE question = 'Welche der folgenden sind natürliche (nicht künstliche) Energiequellen?';

UPDATE quiz_questions SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'question', 'What is a "Liveliness Moment"?',
    'explanation', 'Liveliness moments are times when we feel particularly energized, present, and authentic. These moments give us clues about our natural state of congruence and serve as important reference points for the CLEAR method.',
    'options', jsonb_build_array(
      'A scheduled break in the daily routine',
      'A moment of high physical activity',
      'A time when we feel particularly energized and authentic',
      'A meditation or mindfulness exercise'
    )
  )
) WHERE question = 'Was ist ein "Lebendigkeits-Moment"?';

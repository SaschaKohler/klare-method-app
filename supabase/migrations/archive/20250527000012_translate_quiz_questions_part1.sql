-- Migration: Englische Übersetzungen für Quiz Questions
-- Übersetzung der deutschen Quiz-Fragen ins Englische

-- Klarheit (K) Quiz Question
UPDATE quiz_questions SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'question', 'Why is clarity the necessary first step in the CLEAR method?',
    'explanation', 'Without honest assessment of your current situation (clarity about the IS-state), you lack the starting point for any meaningful change. It would be like planning a journey without knowing your starting point.',
    'options', jsonb_build_array(
      'Because it is the easiest to achieve',
      'Because without knowledge of the current state, no targeted change can be achieved', 
      'Because it is the most fun',
      'Because clarity is the fastest to achieve'
    )
  )
) WHERE question = 'Warum ist Klarheit der notwendige erste Schritt in der KLARE-Methode?';

-- Lebendigkeit (L) Quiz Questions
UPDATE quiz_questions SET translations = jsonb_set(
  COALESCE(translations, '{}'::jsonb),
  '{en}',
  jsonb_build_object(
    'question', 'What is the primary purpose of the Liveliness step in the CLEAR method?',
    'explanation', 'The Liveliness step (L) serves to identify and activate your natural resources and energy sources. This is an essential step after recognizing your current situation in the Clarity phase (C) and before developing a new direction.',
    'options', jsonb_build_array(
      'To relax and reduce stress',
      'To identify and activate natural energy sources',
      'To plan future goals',
      'To analyze past mistakes'
    )
  )
) WHERE question = 'Was ist der primäre Zweck des Lebendigkeits-Schritts in der KLARE-Methode?';

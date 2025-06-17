-- 20250523000001_add_journal_templates_translations.sql
BEGIN;

-- Englische Übersetzungen für deutsche Template-Titel
UPDATE journal_templates
SET translations = jsonb_build_object(
  'en', jsonb_build_object(
    'title', CASE
      WHEN title = 'Tägliche Reflexion' THEN 'Daily Reflection'
      WHEN title = 'Klarheitsfragen' THEN 'Clarity Questions'
      WHEN title = 'Inkongruenz-Reflexion' THEN 'Incongruence Reflection'
      WHEN title = 'Genius Gate Anwendung' THEN 'Genius Gate Application'
      WHEN title = 'Metamodell-Praxis' THEN 'Metamodel Practice'
      WHEN title = 'Energiebilanz' THEN 'Energy Balance'
      WHEN title = 'Werte-Reflexion' THEN 'Values Reflection'
      WHEN title = 'Zielvisualisierung' THEN 'Goal Visualization'
      WHEN title = 'Dankbarkeits-Journal' THEN 'Gratitude Journal'
      -- Fallback: Titel unverändert lassen
      ELSE title
    END,
    'description', CASE
      WHEN description = 'Tiefere Analyse einer erkannten Inkongruenz' 
        THEN 'Deeper analysis of a recognized incongruence'
      WHEN description = 'Anwendung der Genius Gate-Fragen auf eine aktuelle Situation' 
        THEN 'Application of Genius Gate questions to a current situation'
      WHEN description = 'Anwendung des Metamodells auf eigene Aussagen und Gedanken' 
        THEN 'Application of the Metamodel to your own statements and thoughts'
      -- Fallback: Beschreibung unverändert lassen
      ELSE description
    END,
    'promptQuestions', CASE
      WHEN title = 'Inkongruenz-Reflexion' THEN jsonb_build_array(
        'What incongruence have I noticed?',
        'At what level does it occur (statements, values, identity, perception)?',
        'How does this incongruence affect my energy level?',
        'What first steps could I take to achieve more congruence?'
      )
      WHEN title = 'Genius Gate Anwendung' THEN jsonb_build_array(
        'What situation or thought is occupying me right now?',
        'Which universal modeling process (distortion, deletion, generalization) am I using?',
        'What additional information would help me better understand the situation?',
        'What alternative perspectives could I consider?',
        'What action or insight creates more clarity for me now?'
      )
      WHEN title = 'Metamodell-Praxis' THEN jsonb_build_array(
        'A thought or statement that went through my mind today?',
        'What Metamodel violation might be contained in it?',
        'What specific question would help recover the missing information?',
        'How does my perception change when I answer this question?'
      )
      -- Fallback: Bestehende Fragen beibehalten
      ELSE prompt_questions::jsonb
    END
  )
)
WHERE translations IS NULL OR NOT (translations ? 'en');

-- Englische Übersetzungen für Template-Kategorien
UPDATE journal_template_categories
SET translations = jsonb_build_object(
  'en', jsonb_build_object(
    'name', CASE
      WHEN name = 'Tägliche Reflexion' THEN 'Daily Reflection'
      WHEN name = 'Klarheit' THEN 'Clarity'
      WHEN name = 'Lebendigkeit' THEN 'Liveliness'
      WHEN name = 'Ausdruck' THEN 'Expression'
      WHEN name = 'Resonanz' THEN 'Resonance'
      WHEN name = 'Entwicklung' THEN 'Development'
      -- Fallback: Name unverändert lassen
      ELSE name
    END,
    'description', CASE
      WHEN description = 'Tägliche Übungen zur Selbstreflexion' 
        THEN 'Daily exercises for self-reflection'
      WHEN description = 'Übungen zur Steigerung der Klarheit' 
        THEN 'Exercises to increase clarity'
      WHEN description = 'Übungen zur Steigerung der Lebendigkeit'
        THEN 'Exercises to increase liveliness'
      WHEN description = 'Übungen zum authentischen Ausdruck'
        THEN 'Exercises for authentic expression'
      WHEN description = 'Übungen zur Verbesserung von Beziehungen'
        THEN 'Exercises to improve relationships'
      WHEN description = 'Übungen zur persönlichen Entwicklung'
        THEN 'Exercises for personal development'
      -- Fallback: Beschreibung unverändert lassen
      ELSE description
    END
  )
)
WHERE translations IS NULL OR NOT (translations ? 'en');

COMMIT;

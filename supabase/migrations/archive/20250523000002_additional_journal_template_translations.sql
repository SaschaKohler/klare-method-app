-- Da wir nun den JournalService und den Store angepasst haben, 
-- erstellen wir noch eine Migration, um weitere Journal-Templates zu übersetzen.

-- 20250523000002_additional_journal_template_translations.sql
BEGIN;

-- Morgendliche und abendliche Reflexionen
UPDATE journal_templates
SET translations = jsonb_build_object(
  'en', jsonb_build_object(
    'title', CASE
      WHEN title = 'Morgen-Reflexion' THEN 'Morning Reflection'
      WHEN title = 'Abend-Reflexion' THEN 'Evening Reflection'
      WHEN title = 'Werte-Reflexion' THEN 'Values Reflection'
      WHEN title = 'Fortschritts-Tagebuch' THEN 'Progress Journal'
      WHEN title = 'Achtsamkeits-Übung' THEN 'Mindfulness Exercise'
      WHEN title = 'Dankbarkeits-Journal' THEN 'Gratitude Journal'
      WHEN title = 'Fokus-Planung' THEN 'Focus Planning'
      WHEN title = 'Emotionales Tagebuch' THEN 'Emotional Journal'
      ELSE title -- Fallback: Titel unverändert lassen
    END,
    'description', CASE
      WHEN description = 'Kurze Reflexion für den Start in den Tag' 
        THEN 'Brief reflection to start your day'
      WHEN description = 'Täglicher Rückblick am Abend' 
        THEN 'Daily review in the evening'
      WHEN description = 'Reflexion über die persönlichen Werte und ihre Bedeutung' 
        THEN 'Reflection on personal values and their significance'
      WHEN description = 'Dokumentation von Fortschritten und Erfolgen' 
        THEN 'Documentation of progress and achievements'
      WHEN description = 'Übung zur Steigerung der Achtsamkeit und Präsenz' 
        THEN 'Exercise to increase mindfulness and presence'
      WHEN description = 'Fokus auf Dinge, für die man dankbar ist' 
        THEN 'Focus on things you are grateful for'
      WHEN description = 'Planung des Tages mit klarem Fokus' 
        THEN 'Planning the day with a clear focus'
      WHEN description = 'Tagebuch zum Reflektieren von Emotionen' 
        THEN 'Journal for reflecting on emotions'
      ELSE description -- Fallback
    END,
    'promptQuestions', CASE
      WHEN title = 'Morgen-Reflexion' THEN jsonb_build_array(
        'How do I feel today (physically, emotionally, mentally)?',
        'What thoughts dominate my mind?',
        'What do I want to focus on today?',
        'What small step can I take today toward my goals?'
      )
      WHEN title = 'Abend-Reflexion' THEN jsonb_build_array(
        'What went well today?',
        'What challenges did I face?',
        'What did I learn today?',
        'What am I grateful for today?'
      )
      WHEN title = 'Werte-Reflexion' THEN jsonb_build_array(
        'Which value was particularly important to me today?',
        'In what situations did I live this value?',
        'How did living this value affect my well-being?',
        'Where was it difficult to live this value?',
        'How can I integrate this value more into my daily life?'
      )
      WHEN title = 'Fortschritts-Tagebuch' THEN jsonb_build_array(
        'What small or large progress have I made today?',
        'What helped me make this progress?',
        'What obstacles did I overcome?',
        'What next step can I take to continue this progress?'
      )
      -- Fallback: Bestehende Fragen beibehalten
      ELSE prompt_questions::jsonb
    END
  )
)
WHERE translations IS NULL OR NOT (translations ? 'en')
AND (title IN ('Morgen-Reflexion', 'Abend-Reflexion', 'Werte-Reflexion', 'Fortschritts-Tagebuch', 
               'Achtsamkeits-Übung', 'Dankbarkeits-Journal', 'Fokus-Planung', 'Emotionales Tagebuch'));

-- Zusätzliche Kategorien übersetzen
UPDATE journal_template_categories
SET translations = jsonb_build_object(
  'en', jsonb_build_object(
    'name', CASE
      WHEN name = 'Morgenroutine' THEN 'Morning Routine'
      WHEN name = 'Abendroutine' THEN 'Evening Routine'
      WHEN name = 'Persönliche Entwicklung' THEN 'Personal Development'
      WHEN name = 'Achtsamkeit' THEN 'Mindfulness'
      WHEN name = 'Produktivität' THEN 'Productivity'
      WHEN name = 'Emotionen' THEN 'Emotions'
      ELSE name -- Fallback
    END,
    'description', CASE
      WHEN description = 'Übungen für den Morgen' 
        THEN 'Exercises for the morning'
      WHEN description = 'Übungen für den Abend' 
        THEN 'Exercises for the evening'
      WHEN description = 'Übungen zur persönlichen Weiterentwicklung' 
        THEN 'Exercises for personal growth'
      WHEN description = 'Übungen für mehr Achtsamkeit im Alltag' 
        THEN 'Exercises for more mindfulness in everyday life'
      WHEN description = 'Übungen für bessere Produktivität' 
        THEN 'Exercises for better productivity'
      WHEN description = 'Übungen zur emotionalen Verarbeitung' 
        THEN 'Exercises for emotional processing'
      ELSE description -- Fallback
    END
  )
)
WHERE translations IS NULL OR NOT (translations ? 'en')
AND (name IN ('Morgenroutine', 'Abendroutine', 'Persönliche Entwicklung', 
              'Achtsamkeit', 'Produktivität', 'Emotionen'));

COMMIT;

-- supabase/migrations/20250520000003_l_quiz.sql

-- Diese Migration fügt das Modul l-quiz (Lebendigkeits-Quiz) hinzu

-- Module 7: l-quiz (Lebendigkeits-Quiz)
INSERT INTO public.module_contents (module_id, content_type, title, description, content, order_index)
VALUES (
  'l-quiz',
  'quiz',
  'Lebendigkeits-Quiz',
  'Testen Sie Ihr Verständnis des Lebendigkeits-Konzepts',
  jsonb_build_object(
    'intro_text', 'Dieses Quiz testet Ihr Verständnis der Schlüsselkonzepte zum Thema Lebendigkeit. Beantworten Sie die folgenden Fragen, um Ihr Wissen zu überprüfen.',
    'quiz_questions', jsonb_build_array(
      jsonb_build_object(
        'id', 'l_quiz_q1',
        'question', 'Was ist der primäre Zweck des Lebendigkeits-Schritts in der KLARE-Methode?',
        'question_type', 'single_choice',
        'options', jsonb_build_array(
          'Vergangene Emotionen aufzuarbeiten',
          'Natürliche Ressourcen und Energiequellen zu aktivieren',
          'Neue Gewohnheiten zu entwickeln',
          'Zukünftige Lebensziele zu definieren'
        ),
        'correct_answer', '1',
        'explanation', 'Der Lebendigkeit-Schritt (L) dient dazu, Ihre natürlichen Ressourcen und Energiequellen zu identifizieren und zu aktivieren. Dies ist ein wesentlicher Schritt, nachdem Sie in der Klarheits-Phase (K) Ihre aktuelle Situation erkannt haben und bevor Sie eine neue Ausrichtung entwickeln.'
      ),
      jsonb_build_object(
        'id', 'l_quiz_q2',
        'question', 'Welche der folgenden sind natürliche (nicht künstliche) Energiequellen?',
        'question_type', 'multiple_choice',
        'options', jsonb_build_array(
          'Intrinsische Motivation und Begeisterung',
          'Hohe Dosen Koffein und Energy-Drinks',
          'Tiefe Verbindung zu persönlichen Werten',
          'Adrenalin durch Zeitdruck und Stress'
        ),
        'correct_answer', jsonb_build_array('0', '2'),
        'explanation', 'Natürliche Energiequellen kommen aus unserem Inneren und sind nachhaltig. Intrinsische Motivation und die Verbindung zu unseren Werten sind natürliche Energiequellen, während Substanzen wie Koffein oder Stress-induziertes Adrenalin künstliche, kurzfristige Energiequellen darstellen.'
      ),
      jsonb_build_object(
        'id', 'l_quiz_q3',
        'question', 'Was ist ein "Lebendigkeits-Moment"?',
        'question_type', 'single_choice',
        'options', jsonb_build_array(
          'Ein künstlich herbeigeführter Zustand extremer Euphorie',
          'Eine Erinnerung an vergangene Erfolge und Errungenschaften',
          'Ein Moment, in dem wir uns besonders energetisiert, präsent und authentisch fühlen',
          'Eine Planungssitzung für zukünftige Veränderungen'
        ),
        'correct_answer', '2',
        'explanation', 'Lebendigkeits-Momente sind Zeiten, in denen wir uns besonders energetisiert, präsent und authentisch fühlen. Diese Momente geben uns Hinweise auf unseren natürlichen Zustand der Kongruenz und dienen als wichtige Orientierungspunkte für die KLARE-Methode.'
      ),
      jsonb_build_object(
        'id', 'l_quiz_q4',
        'question', 'Warum ist der Körper ein wichtiger Aspekt bei der Arbeit mit Lebendigkeit?',
        'question_type', 'single_choice',
        'options', jsonb_build_array(
          'Weil körperliche Fitness die einzige Quelle echter Energie ist',
          'Weil der Körper zwar wichtig, aber vom Geist strikt getrennt ist',
          'Weil der Körper ein intelligentes System mit eigener Weisheit ist und direkte Wege zur Lebendigkeit bietet',
          'Weil nur durch sportliche Betätigung dauerhafte Veränderung möglich ist'
        ),
        'correct_answer', '2',
        'explanation', 'Der Körper ist nicht nur ein Transportmittel für unseren Geist, sondern ein intelligentes System mit eigener Weisheit. Körperliche Praktiken können direktere und schnellere Wege zu mehr Lebendigkeit bieten als rein gedankliche Prozesse. Die Embodiment-Forschung zeigt, dass Körperhaltung, Bewegungsmuster und physische Gewohnheiten unsere mentalen und emotionalen Zustände tiefgreifend beeinflussen.'
      )
    )
  ),
  7
)
ON CONFLICT (id) DO UPDATE
SET content_type = EXCLUDED.content_type,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    order_index = EXCLUDED.order_index,
    updated_at = now();
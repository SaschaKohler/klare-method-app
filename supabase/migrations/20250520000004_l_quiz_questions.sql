-- supabase/migrations/20250520000004_l_quiz_questions.sql

-- Diese Migration fügt die restlichen Fragen für das Modul l-quiz (Lebendigkeits-Quiz) hinzu

-- Die restlichen Quiz-Fragen für l-quiz hinzufügen
-- Wir müssen die Inhalte des vorhandenen Quiz abrufen und dann aktualisieren
UPDATE public.module_contents
SET content = jsonb_set(
  content, 
  '{quiz_questions}', 
  (
    SELECT jsonb_build_array(
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
      ),
      jsonb_build_object(
        'id', 'l_quiz_q5',
        'question', 'Was sind typische Energieblocker, die unsere natürliche Lebendigkeit behindern können?',
        'question_type', 'multiple_choice',
        'options', jsonb_build_array(
          'Ungelöste emotionale Konflikte',
          'Bewegung und körperliche Aktivität',
          'Übermäßige Selbstkritik und negative Glaubenssätze',
          'Tiefe Verbundenheit mit anderen Menschen'
        ),
        'correct_answer', jsonb_build_array('0', '2'),
        'explanation', 'Typische Energieblocker sind ungelöste emotionale Konflikte sowie übermäßige Selbstkritik und negative Glaubenssätze. Im Gegensatz dazu sind Bewegung und tiefe Verbundenheit mit anderen Menschen typischerweise Energiespender, die unsere Lebendigkeit fördern.'
      ),
      jsonb_build_object(
        'id', 'l_quiz_q6',
        'question', 'Welche der folgenden Aussagen über die Transformation von Energieblockern ist korrekt?',
        'question_type', 'single_choice',
        'options', jsonb_build_array(
          'Energieblocker müssen vollständig vermieden werden, um Lebendigkeit zu erreichen',
          'Energieblocker können nur durch professionelle Hilfe überwunden werden',
          'Energieblocker haben oft eine ursprüngliche Schutzfunktion, die verstanden werden sollte',
          'Energieblocker sind permanente Persönlichkeitsmerkmale, die nicht verändert werden können'
        ),
        'correct_answer', '2',
        'explanation', 'Energieblocker haben oft eine ursprüngliche Schutzfunktion, die zu einem früheren Zeitpunkt in unserem Leben sinnvoll war. Das Verständnis dieser Funktion ist ein wichtiger Schritt, um die Blocker zu transformieren, anstatt sie nur zu bekämpfen oder zu vermeiden.'
      ),
      jsonb_build_object(
        'id', 'l_quiz_q7',
        'question', 'Was ist die Rolle der "Verankerung" bei körperlichen Übungen zur Lebendigkeit?',
        'question_type', 'single_choice',
        'options', jsonb_build_array(
          'Eine Methode, um negative Emotionen zu unterdrücken',
          'Eine Technik, um schnell wieder mit dem Gefühl der Lebendigkeit in Kontakt zu kommen',
          'Ein Ritual, das nur in speziellen Umgebungen funktioniert',
          'Eine Strategie, um andere Menschen zu beeinflussen'
        ),
        'correct_answer', '1',
        'explanation', 'Verankerung oder "Ankern" ist eine Technik, bei der wir eine körperliche Geste oder Berührung mit einem bestimmten emotionalen Zustand verbinden. Der Anker kann später genutzt werden, um schnell wieder mit dem Gefühl der Lebendigkeit in Kontakt zu kommen, besonders in herausfordernden Situationen.'
      )
    )
  )
)
WHERE module_id = 'l-quiz';
-- supabase/migrations/20250410000000_content_schema.sql

-- Schema für Inhalte der KLARE-Methode-App

-- Neue Felder für die users-Tabelle hinzufügen
ALTER TABLE users ADD COLUMN IF NOT EXISTS join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS completed_modules TEXT[] DEFAULT '{}';

-- Tabelle für Modul-Inhalte
CREATE TABLE module_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('intro', 'theory', 'text', 'video', 'exercise', 'quiz')),
  title TEXT NOT NULL,
  description TEXT,
  content JSONB,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Inhaltsabschnitte
CREATE TABLE content_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_content_id UUID NOT NULL REFERENCES module_contents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  media_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Übungsschritte
CREATE TABLE exercise_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_content_id UUID NOT NULL REFERENCES module_contents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('reflection', 'practice', 'input', 'selection', 'journal')),
  options JSONB,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Quiz-Fragen
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_content_id UUID NOT NULL REFERENCES module_contents(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'single_choice', 'text', 'true_false')),
  options JSONB,
  correct_answer JSONB,
  explanation TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Benutzerergebnisse bei Übungen
CREATE TABLE user_exercise_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_step_id UUID NOT NULL REFERENCES exercise_steps(id) ON DELETE CASCADE,
  answer JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Benutzer-Quiz-Antworten
CREATE TABLE user_quiz_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  user_answer JSONB,
  is_correct BOOLEAN,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sicherheitsrichtlinien für neue Tabellen
ALTER TABLE module_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_answers ENABLE ROW LEVEL SECURITY;

-- Lese-Zugriff für alle authentifizierten Benutzer auf Inhaltstabellen
CREATE POLICY "Authenticated users can read module contents" 
ON module_contents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read content sections" 
ON content_sections FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read exercise steps" 
ON exercise_steps FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read quiz questions" 
ON quiz_questions FOR SELECT TO authenticated USING (true);

-- Policies für Benutzerergebnisse
CREATE POLICY "Users can insert their own exercise results" 
ON user_exercise_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own exercise results" 
ON user_exercise_results FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz answers" 
ON user_quiz_answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own quiz answers" 
ON user_quiz_answers FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Testinhalte für den K-Bereich (Klarheit) hinzufügen
-- Modul "Einführung in die Klarheit" hinzufügen
INSERT INTO module_contents (
  module_id,
  content_type,
  title,
  description,
  content,
  order_index
) VALUES (
  'k-intro',
  'intro',
  'Einführung in die Klarheit',
  'Überblick über den ersten Schritt der KLARE-Methode',
  '{
    "intro_text": "Willkommen zum ersten Schritt der KLARE-Methode: Klarheit. In diesem Modul werden wir gemeinsam entdecken, warum Klarheit der Grundstein für jede erfolgreiche Veränderung ist und wie Sie durch ehrliche Selbstreflexion einen klaren Blick auf Ihre aktuelle Situation gewinnen können.",
    "key_points": [
      "Warum Klarheit der notwendige erste Schritt ist",
      "Wie wir unsere eigene Wahrnehmung verzerren",
      "Die drei universalen Modellierungsprozesse: Verzerrung, Generalisierung, Tilgung",
      "Wie Sie durch bewusste Wahrnehmung zu einer ehrlichen Standortbestimmung kommen"
    ],
    "duration_minutes": 5,
    "video_url": ""
  }',
  1
);

-- Abschnitte für das Einführungsmodul hinzufügen
INSERT INTO content_sections (
  module_content_id,
  title,
  content,
  order_index
) VALUES 
(
  (SELECT id FROM module_contents WHERE module_id = 'k-intro' LIMIT 1),
  'Warum ist Klarheit so wichtig?',
  'Klarheit ist der Grundstein für jede erfolgreiche Veränderung. Ohne ein klares Verständnis Ihres IST-Zustands fehlt Ihnen der Ausgangspunkt für jede sinnvolle Veränderung. Stellen Sie sich vor, Sie möchten mit dem Auto zu einem bestimmten Ziel fahren, wissen aber nicht, wo Sie sich gerade befinden - wie sollten Sie den Weg dorthin finden?

Mit Klarheit beginnen bedeutet, ehrlich zu sich selbst zu sein. Es bedeutet, die aktuelle Situation ohne Schönfärberei oder übermäßige Selbstkritik zu betrachten. Diese ehrliche Standortbestimmung mag zunächst unbequem sein, ist aber der notwendige erste Schritt zu authentischer Veränderung.',
  1
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-intro' LIMIT 1),
  'Die drei universalen Modellierungsprozesse',
  'Unsere Wahrnehmung der Welt ist nicht objektiv, sondern geprägt von drei grundlegenden Prozessen:

1. **Verzerrung**: Wir interpretieren die Realität und verändern sie dadurch.
   Beispiel: "Sie hat mich ignoriert" (statt: "Sie hat mich nicht gesehen")

2. **Generalisierung**: Wir übertragen einzelne Erfahrungen auf alle ähnlichen Situationen.
   Beispiel: "Ich kann nicht vor Gruppen sprechen" (nach einer schlechten Erfahrung)

3. **Tilgung**: Wir blenden bestimmte Aspekte der Realität aus.
   Beispiel: Wir überhören Komplimente, nehmen aber Kritik stark wahr

Diese Prozesse helfen uns, die Komplexität der Welt zu bewältigen, können aber auch zu einem verzerrten Selbstbild führen. Im Klarheits-Schritt lernen wir, diese Prozesse bewusst wahrzunehmen.',
  2
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-intro' LIMIT 1),
  'Ihr Weg zur Klarheit',
  'In den folgenden Modulen werden Sie:

1. Ihr Lebensrad erstellen, um einen Überblick über verschiedene Lebensbereiche zu gewinnen
2. Konkrete Inkongruenzen in Ihrem Leben identifizieren
3. Die Kraft der präzisen Sprache nutzen, um Klarheit zu gewinnen
4. Werkzeuge kennenlernen, um Verzerrungen, Generalisierungen und Tilgungen zu erkennen

Der Prozess mag manchmal herausfordernd sein, aber die gewonnene Klarheit wird Ihnen als solides Fundament für alle weiteren Schritte dienen.',
  3
);

-- Modul "Die Theorie hinter Klarheit" hinzufügen
INSERT INTO module_contents (
  module_id,
  content_type,
  title,
  description,
  content,
  order_index
) VALUES (
  'k-theory',
  'theory',
  'Die Theorie hinter Klarheit',
  'Verstehen, warum Klarheit der erste Schritt sein muss',
  '{
    "intro_text": "In diesem Modul tauchen wir tiefer in die theoretischen Grundlagen der Klarheit ein und untersuchen, wie unser Gehirn die Welt filtert und modelliert. Dieses Verständnis ist wesentlich, um die eigenen Wahrnehmungsverzerrungen zu erkennen.",
    "key_concepts": [
      "Kausaler Modellierungsprozess",
      "Die Architektur eines Weltbildes",
      "Das Meta-Modell der Sprache",
      "Wie wir Klarheit durch präzise Kommunikation gewinnen"
    ],
    "duration_minutes": 10
  }',
  2
);

-- Abschnitte für das Theorie-Modul hinzufügen
INSERT INTO content_sections (
  module_content_id,
  title,
  content,
  order_index
) VALUES 
(
  (SELECT id FROM module_contents WHERE module_id = 'k-theory' LIMIT 1),
  'Kausaler Modellierungsprozess',
  'Unser Weltbild entsteht durch einen kausalen Modellierungsprozess. Wir nehmen die Welt über unsere fünf Sinne wahr (VAKOG - visuell, auditiv, kinästhetisch, olfaktorisch, gustatorisch), verarbeiten diese Informationen und bilden daraus unser "Modell der Welt".

Wichtig zu verstehen: **Die Landkarte ist nicht das Gebiet**. Unsere innere Repräsentation der Welt ist nie die Welt selbst, sondern immer nur unsere subjektive Interpretation davon. 

Die Art, wie wir diese Modellierung vornehmen, prägt unsere Erfahrung der Realität grundlegend. Konflikte zwischen Menschen entstehen oft, wenn unterschiedliche Weltmodelle aufeinandertreffen.',
  1
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-theory' LIMIT 1),
  'Meta-Modell der Sprache',
  'Das Meta-Modell der Sprache ist ein mächtiges Werkzeug, um Klarheit zu gewinnen. Es hilft uns, die typischen Verzerrungen, Generalisierungen und Tilgungen in unserer Sprache zu erkennen und aufzulösen.

**Beispiele für Meta-Modell-Verletzungen:**

1. **Verzerrungen**:
   - Gedankenlesen: "Er mag mich nicht" (Woher weißt du das?)
   - Ursache-Wirkung: "Du machst mich wütend" (Wie genau bewirkt sein Verhalten deine Wut?)

2. **Generalisierungen**:
   - Universalquantoren: "Ich schaffe das nie" (Wirklich nie? Keine Ausnahmen?)
   - Modaloperatoren: "Ich muss perfekt sein" (Was würde passieren, wenn nicht?)

3. **Tilgungen**:
   - Unvollständige Vergleiche: "Das ist besser" (Besser als was?)
   - Nominalisierungen: "Die Angst kontrolliert mich" (Wie genau ängstigt du dich?)

Durch gezielte Fragen können wir diese Verzerrungen aufdecken und so zu einer präziseren Repräsentation der Wirklichkeit gelangen.',
  2
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-theory' LIMIT 1),
  'Praktische Anwendung',
  'Die Anwendung dieser Theorien im Alltag kann transformativ wirken:

1. **Beobachten Sie Ihre Sprache**: Achten Sie auf Absolutismen wie "immer", "nie", "alle", "keiner".

2. **Stellen Sie Meta-Modell-Fragen**:
   - "Woher weißt du das?"
   - "Immer? Wirklich ohne Ausnahme?"
   - "Was genau meinst du mit...?"
   - "Verglichen womit?"

3. **Werden Sie präziser**: Je genauer Sie beschreiben können, was in Ihnen vorgeht, desto klarer wird Ihr Verständnis der Situation.

4. **Hinterfragen Sie Ihre Annahmen**: Oft halten wir Interpretationen für Fakten. Prüfen Sie: "Ist das wirklich so oder ist es nur meine Interpretation?"

Diese Bewusstheit ist der erste Schritt zur Transformation. Wenn wir erkennen, wie wir unsere Realität konstruieren, können wir beginnen, sie bewusst zu verändern.',
  3
);

-- Modul "Lebensrad-Analyse" hinzufügen
INSERT INTO module_contents (
  module_id,
  content_type,
  title,
  description,
  content,
  order_index
) VALUES (
  'k-lifewheel',
  'exercise',
  'Lebensrad-Analyse',
  'Bestandsaufnahme Ihrer aktuellen Lebenssituation',
  '{
    "intro_text": "Das Lebensrad ist ein kraftvolles Werkzeug zur Standortbestimmung. In dieser Übung werden Sie acht zentrale Lebensbereiche bewerten und einen klaren Überblick über Ihre aktuelle Lebenssituation gewinnen.",
    "duration_minutes": 15,
    "areas": [
      "Gesundheit",
      "Karriere",
      "Finanzen",
      "Persönliches Wachstum",
      "Freizeit",
      "Familie",
      "Beziehungen",
      "Spiritualität"
    ]
  }',
  3
);

-- Übungsschritte für die Lebensrad-Analyse hinzufügen
INSERT INTO exercise_steps (
  module_content_id,
  title,
  instructions,
  step_type,
  options,
  order_index
) VALUES 
(
  (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1),
  'Einführung zum Lebensrad',
  'Das Lebensrad ist ein leistungsstarkes Werkzeug zur Selbstreflexion. Es hilft Ihnen, einen klaren Überblick über verschiedene Lebensbereiche zu gewinnen und Ungleichgewichte zu identifizieren.

In dieser Übung werden Sie acht zentrale Lebensbereiche auf einer Skala von 1 (sehr unzufrieden) bis 10 (vollkommen zufrieden) bewerten. Nehmen Sie sich Zeit für diese Bewertung und seien Sie ehrlich zu sich selbst. Es gibt keine richtigen oder falschen Antworten - es geht nur um Ihre persönliche Einschätzung Ihrer aktuellen Situation.',
  'reflection',
  '{}',
  1
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1),
  'Gesundheit bewerten',
  'Wie zufrieden sind Sie mit Ihrem körperlichen und mentalen Wohlbefinden? Berücksichtigen Sie dabei:

- Ernährung und Essgewohnheiten
- Bewegung und Sport
- Schlafqualität und -dauer
- Stresslevel und Stressbewältigung
- Energielevel im Alltag
- Umgang mit Gesundheitsproblemen

Bewerten Sie Ihren aktuellen Zustand auf einer Skala von 1-10.',
  'input',
  '{
    "input_type": "slider",
    "min_value": 1,
    "max_value": 10,
    "step": 1,
    "default_value": 5,
    "target_question": "Welchen Wert würden Sie gerne erreichen?"
  }',
  2
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1),
  'Karriere bewerten',
  'Wie zufrieden sind Sie mit Ihrer beruflichen Situation? Berücksichtigen Sie dabei:

- Erfüllung und Sinnhaftigkeit Ihrer Tätigkeit
- Arbeitsatmosphäre und Kollegialität
- Work-Life-Balance
- Anerkennung und Wertschätzung
- Entwicklungsmöglichkeiten
- Gehalt und Vergütung

Bewerten Sie Ihren aktuellen Zustand auf einer Skala von 1-10.',
  'input',
  '{
    "input_type": "slider",
    "min_value": 1,
    "max_value": 10,
    "step": 1,
    "default_value": 5,
    "target_question": "Welchen Wert würden Sie gerne erreichen?"
  }',
  3
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1),
  'Ihr Lebensrad verstehen',
  'Betrachten Sie Ihr Lebensrad und reflektieren Sie:

1. **Ungleichgewichte**: Welche Bereiche sind besonders niedrig bewertet? Welche überraschend hoch?

2. **Zusammenhänge**: Wie beeinflussen sich die verschiedenen Bereiche gegenseitig? Zum Beispiel: Wie wirkt sich Ihre Gesundheit auf Ihre Karriere aus?

3. **Prioritäten**: Welche 1-2 Bereiche würden, wenn verbessert, den größten positiven Einfluss auf Ihr gesamtes Leben haben?

4. **Potenzial**: In welchen Bereichen sehen Sie das größte Verbesserungspotenzial?

Notieren Sie Ihre Erkenntnisse:',
  'journal',
  '{
    "placeholder": "Meine Erkenntnisse aus dem Lebensrad...",
    "min_length": 50
  }',
  9
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1),
  'Nächste Schritte',
  'Basierend auf Ihrer Lebensrad-Analyse, welche konkreten Schritte könnten Sie unternehmen, um mehr Ausgewogenheit in Ihr Leben zu bringen?

Wählen Sie 1-2 Prioritätsbereiche und definieren Sie jeweils eine kleine, umsetzbare Maßnahme, die Sie in der kommenden Woche ergreifen können:',
  'journal',
  '{
    "placeholder": "In den nächsten 7 Tagen werde ich...",
    "min_length": 30
  }',
  10
);

-- Modul "Klarheits-Quiz" hinzufügen
INSERT INTO module_contents (
  module_id,
  content_type,
  title,
  description,
  content,
  order_index
) VALUES (
  'k-quiz',
  'quiz',
  'Klarheits-Quiz',
  'Testen Sie Ihr Verständnis des Klarheits-Konzepts',
  '{
    "intro_text": "Dieses kurze Quiz hilft Ihnen, Ihr Verständnis der Konzepte rund um Klarheit zu überprüfen. Nutzen Sie es als Gelegenheit zum Lernen - es geht nicht um richtig oder falsch, sondern um ein tieferes Verständnis.",
    "duration_minutes": 5,
    "questions_count": 5
  }',
  7
);

-- Quiz-Fragen hinzufügen
INSERT INTO quiz_questions (
  module_content_id,
  question,
  question_type,
  options,
  correct_answer,
  explanation,
  order_index
) VALUES 
(
  (SELECT id FROM module_contents WHERE module_id = 'k-quiz' LIMIT 1),
  'Warum ist Klarheit der notwendige erste Schritt in der KLARE-Methode?',
  'single_choice',
  '["Weil sie am einfachsten zu erreichen ist", "Weil man ohne Kenntnis des IST-Zustands keine zielgerichtete Veränderung erreichen kann", "Weil sie am meisten Spaß macht", "Weil Klarheit am schnellsten zu erreichen ist"]',
  '1',
  'Ohne eine ehrliche Standortbestimmung (Klarheit über den IST-Zustand) fehlt der Ausgangspunkt für jede sinnvolle Veränderung. Es wäre wie eine Reise ohne Kenntnis des Startpunkts zu planen.',
  1
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-quiz' LIMIT 1),
  'Welches der folgenden Beispiele zeigt eine Verzerrung im Sinne des Meta-Modells?',
  'single_choice',
  '["Ich bin heute 30 Minuten gelaufen", "Alle Menschen sind unzuverlässig", "Sie macht mich traurig", "Ich gehe nicht zum Treffen"]',
  '2',
  'Der Satz "Sie macht mich traurig" ist ein klassisches Beispiel für eine Ursache-Wirkungs-Verzerrung. Er suggeriert, dass eine andere Person direkt verantwortlich für unsere Gefühle ist, anstatt zu erkennen, dass unsere Interpretation ihres Verhaltens zu unseren Gefühlen führt.',
  2
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-quiz' LIMIT 1),
  'Was bedeutet die Aussage "Die Landkarte ist nicht das Gebiet"?',
  'multiple_choice',
  '["Unsere Wahrnehmung der Realität ist nie die Realität selbst", "GPS-Navigationsgeräte sind manchmal ungenau", "Wir sollten immer eine Papierkarte dabei haben", "Unsere mentalen Repräsentationen sind subjektive Interpretationen, nicht objektive Abbilder", "Unser Gehirn filtert und verarbeitet Informationen selektiv"]',
  '[0, 3, 4]',
  'Die Metapher "Die Landkarte ist nicht das Gebiet" bedeutet, dass unsere mentale Repräsentation der Welt (die Landkarte) niemals die tatsächliche Realität (das Gebiet) vollständig oder objektiv abbilden kann. Unser Gehirn filtert und interpretiert Informationen selektiv, basierend auf unseren Erfahrungen, Überzeugungen und aktuellen Zuständen.',
  3
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-quiz' LIMIT 1),
  'Welche Frage würde helfen, eine Tilgung im Satz "Das ist zu teuer" aufzudecken?',
  'single_choice',
  '["Wer sagt das?", "Verglichen womit?", "Was genau meinst du mit teuer?", "Warum denkst du das?"]',
  '1',
  'Die Frage "Verglichen womit?" deckt die fehlende Information (Tilgung) auf, die im unvollständigen Vergleich "zu teuer" steckt. Etwas kann nur "zu teuer" sein im Vergleich zu etwas anderem - dieser Vergleichsmaßstab wurde getilgt.',
  4
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-quiz' LIMIT 1),
  'Wie kann das Lebensrad zur Klarheit beitragen?',
  'multiple_choice',
  '["Es zeigt Ungleichgewichte in verschiedenen Lebensbereichen", "Es hilft, die aktuelle Situation objektiv zu betrachten", "Es bietet eine visuelle Darstellung des IST-Zustands", "Es sagt die Zukunft voraus", "Es ersetzt eine professionelle Therapie"]',
  '[0, 1, 2]',
  'Das Lebensrad ist ein Werkzeug zur Selbstreflexion, das hilft, den aktuellen Zustand in verschiedenen Lebensbereichen zu bewerten und Ungleichgewichte zu erkennen. Es bietet eine visuelle Darstellung des IST-Zustands und unterstützt dadurch die Klarheit. Es kann jedoch weder die Zukunft vorhersagen noch eine professionelle Therapie ersetzen.',
  5
);

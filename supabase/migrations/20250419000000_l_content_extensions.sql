-- supabase/migrations/20250419000001_l_content_fix.sql

-- Erweitere die erlaubten step_type-Werte, um neue Übungstypen zu unterstützen
ALTER TABLE exercise_steps 
DROP CONSTRAINT exercise_steps_step_type_check,
ADD CONSTRAINT exercise_steps_step_type_check 
CHECK (step_type IN ('reflection', 'practice', 'input', 'selection', 'journal', 'introduction', 'example'));

-- L-Module Inhalte: Einführungs-Modul
INSERT INTO public.module_contents (module_id, content_type, title, description, content, order_index)
VALUES (
  'l-intro',
  'intro',
  'Einführung in die Lebendigkeit',
  'Überblick über den zweiten Schritt der KLARE-Methode',
  jsonb_build_object(
    'intro_text', 'Willkommen zum Lebendigkeit-Modul der KLARE Methode. Hier lernen Sie, wie Sie Ihre natürliche Energie und Ressourcen wiederentdecken und aktivieren können.',
    'key_points', jsonb_build_array(
      'Lebendigkeit ist Ihr natürlicher Zustand',
      'Blockaden identifizieren und transformieren',
      'Energiequellen aktivieren',
      'Integrative Übungen für den Alltag'
    )
  ),
  1
)
ON CONFLICT (id) DO UPDATE
SET content_type = EXCLUDED.content_type,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- Intro-Modul Sektionen
INSERT INTO public.content_sections (title, content, media_url, order_index, module_content_id)
SELECT 
  'Was ist Lebendigkeit?', 
  '# Was ist Lebendigkeit?

Lebendigkeit ist der zweite Schritt der KLARE-Methode und beschäftigt sich mit dem Wiederentdecken und Aktivieren Ihrer natürlichen Ressourcen und Energien.

Lebendigkeit bezeichnet unseren natürlichen Zustand von Energie, Präsenz und authentischer Ausdruckskraft. Sie ist unser ursprünglicher Zustand, bevor wir durch Konditionierung, Stress und gesellschaftliche Anpassung davon getrennt wurden.

## Warum Lebendigkeit für Kongruenz essentiell ist

Nach der Klarheit über unsere aktuelle Situation benötigen wir Zugang zu unseren natürlichen Ressourcen, um Veränderung zu ermöglichen:

1. **Energiequelle**: Ohne ausreichend Energie können wir keine nachhaltige Veränderung bewirken
2. **Authentische Motivation**: Lebendigkeit zeigt uns, was uns wirklich wichtig ist
3. **Kreative Problemlösung**: Zugang zu unserem vollen Potenzial ermöglicht innovative Lösungen
4. **Resilienz**: Natürliche Lebendigkeit hilft uns, mit Herausforderungen umzugehen',
  NULL,
  1,
  id
FROM public.module_contents
WHERE module_id = 'l-intro'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    media_url = EXCLUDED.media_url,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.content_sections (title, content, media_url, order_index, module_content_id)
SELECT 
  'Blockaden der Lebendigkeit', 
  '# Blockaden der Lebendigkeit

Im Laufe unseres Lebens haben wir oft gelernt, unsere natürliche Lebendigkeit zu unterdrücken durch:

- Überanpassung an soziale Erwartungen
- Traumatische Erfahrungen
- Energieraubende Gewohnheiten und Umgebungen
- Selbstkritik und negative Glaubenssätze

Viele dieser Blockaden sind unbewusst und wurden bereits früh in unserem Leben geformt. Teil der Lebendigkeit-Praxis ist es, diese Blockaden zu erkennen und zu transformieren.',
  NULL,
  2,
  id
FROM public.module_contents
WHERE module_id = 'l-intro'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    media_url = EXCLUDED.media_url,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.content_sections (title, content, media_url, order_index, module_content_id)
SELECT 
  'Der Weg zurück zur Lebendigkeit', 
  '# Der Weg zurück zur Lebendigkeit

Der Prozess zur Wiederentdeckung Ihrer Lebendigkeit umfasst vier Kernschritte:

1. **Identifikation von Momenten natürlicher Lebendigkeit**
   Erkennen, wann Sie sich besonders lebendig, energetisiert und authentisch fühlen

2. **Erkennen und Transformieren von Blockaden**
   Bewusstwerden und Auflösen von Hindernissen für Ihren natürlichen Energiefluss

3. **Bewusste Aktivierung und Integration Ihrer Ressourcen**
   Praktiken entwickeln, um Ihre natürlichen Ressourcen im Alltag zu aktivieren

4. **Schaffen von Strukturen, die Ihre Lebendigkeit unterstützen**
   Ihre Umgebung und Routinen so gestalten, dass sie Ihre Lebendigkeit fördern

Die folgenden Module werden Ihnen helfen, diese Schritte praktisch umzusetzen und Ihre natürliche Lebendigkeit zurückzugewinnen.',
  NULL,
  3,
  id
FROM public.module_contents
WHERE module_id = 'l-intro'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    media_url = EXCLUDED.media_url,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- L-Module Inhalte: Theorie-Modul
INSERT INTO public.module_contents (module_id, content_type, title, description, content, order_index)
VALUES (
  'l-theory',
  'theory',
  'Die Theorie der Lebendigkeit',
  'Verstehen, wie natürliche Lebendigkeit Kongruenz fördert',
  jsonb_build_object(
    'intro_text', 'Die Theorie hinter dem Lebendigkeit-Konzept umfasst Erkenntnisse aus Psychologie, Neurobiologie und traditionellen Weisheitslehren.',
    'key_points', jsonb_build_array(
      'Natürliche versus künstliche Energiequellen',
      'Der Körper-Geist-Zusammenhang bei Lebendigkeit',
      'Flow-Zustände und optimale Erfahrung',
      'Ressourcenbasierte versus defizitorientierte Ansätze'
    )
  ),
  2
)
ON CONFLICT (id) DO UPDATE
SET content_type = EXCLUDED.content_type,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- Theorie-Modul Sektionen
INSERT INTO public.content_sections (title, content, media_url, order_index, module_content_id)
SELECT 
  'Die wissenschaftliche Basis', 
  '# Die wissenschaftliche Basis der Lebendigkeit

## Neurobiologische Grundlagen

Aus neurobiologischer Sicht beschreibt Lebendigkeit einen Zustand, in dem unser autonomes Nervensystem optimal ausbalanciert ist. Der Parasympathikus und Sympathikus arbeiten harmonisch zusammen, was Stephen Porges als "ventrale Vagus-Aktivierung" bezeichnet - ein Zustand, in dem wir gleichzeitig entspannt und energetisiert sind.

Forschungen zeigen, dass dieser Zustand mit erhöhter Herzratenvariabilität, verbesserter Immunfunktion und kognitiver Flexibilität verbunden ist.

## Psychologische Konzepte

Die Positive Psychologie beschreibt Lebendigkeit als einen Zustand des "Flourishing" (Aufblühens), während die Selbstbestimmungstheorie sie mit der Erfüllung unserer Grundbedürfnisse nach Autonomie, Kompetenz und Verbundenheit in Zusammenhang bringt.

Mihaly Csikszentmihalyis Forschungen zu Flow-Zuständen zeigen, dass wir uns am lebendigsten fühlen, wenn wir vollständig in bedeutsamen Tätigkeiten aufgehen, die uns optimal herausfordern.',
  NULL,
  1,
  id
FROM public.module_contents
WHERE module_id = 'l-theory'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    media_url = EXCLUDED.media_url,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.content_sections (title, content, media_url, order_index, module_content_id)
SELECT 
  'Energiequellen und Blockaden', 
  '# Energiequellen und Blockaden

## Natürliche versus künstliche Energiequellen

Wir können zwischen zwei Arten von Energiequellen unterscheiden:

**Natürliche Energiequellen:**
- Intrinsische Motivation und Begeisterung
- Tiefe Verbindung zu Werten und Sinn
- Erholung und Regeneration
- Soziale Verbundenheit und Resonanz

**Künstliche oder kurzfristige Energiequellen:**
- Externe Anreize und Belohnungen
- Stress und Adrenalin
- Substanzen wie Koffein oder Zucker
- Äußere Anerkennung und Statussymbole

## Gemeinsame Energieblocker

Typische Energieblocker, die unsere natürliche Lebendigkeit behindern:

1. **Körperliche Faktoren**
   - Schlafmangel und Erschöpfung
   - Mangelhafte Ernährung
   - Bewegungsmangel
   - Chronische Verspannungen

2. **Emotionale Faktoren**
   - Unterdrückte Gefühle
   - Ungelöste emotionale Konflikte
   - Ängste und Sorgen
   - Emotionale Überlastung

3. **Mentale Faktoren**
   - Negative Glaubenssätze
   - Übermäßige Selbstkritik
   - Grübeln und Gedankenkreisen
   - Informationsüberflutung

4. **Umgebungsfaktoren**
   - Energieraubende Beziehungen
   - Toxische Arbeitsumgebungen
   - Mangel an Natur und Schönheit
   - Ständige Ablenkungen und Unterbrechungen',
  NULL,
  2,
  id
FROM public.module_contents
WHERE module_id = 'l-theory'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    media_url = EXCLUDED.media_url,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.content_sections (title, content, media_url, order_index, module_content_id)
SELECT 
  'Der Körper-Geist-Zusammenhang', 
  '# Der Körper-Geist-Zusammenhang bei Lebendigkeit

Lebendigkeit ist ein ganzheitliches Phänomen, das Körper, Geist und Emotionen umfasst. Diese drei Aspekte stehen in ständiger Wechselwirkung:

## Der Körper als Tor zur Lebendigkeit

Unser Körper ist nicht nur ein Transportmittel für unseren Geist, sondern ein intelligentes System mit eigener Weisheit. Körperliche Praktiken wie Bewegung, bewusste Atmung und Entspannung können direkte Wege zu mehr Lebendigkeit sein.

Die Embodiment-Forschung zeigt, dass unsere Körperhaltung, Bewegungsmuster und physischen Gewohnheiten unsere mentalen und emotionalen Zustände tiefgreifend beeinflussen.

## Emotionen als Energieträger

Emotionen sind energetische Zustände, die uns Information und Motivation liefern. Sowohl angenehme als auch unangenehme Emotionen können Quellen von Lebendigkeit sein, wenn wir lernen, sie vollständig zu erleben und fließen zu lassen.

Das Problem entsteht nicht durch die Emotionen selbst, sondern durch deren Unterdrückung oder Festhalten, was Energie bindet und Lebendigkeit blockiert.

## Der Geist als Dirigent

Unser Geist kann sowohl Lebendigkeit fördern als auch blockieren. Aufmerksamkeit und Präsenz verstärken Lebendigkeit, während Grübeln und übermäßiges Analysieren sie verringern können.

Die Praxis der Achtsamkeit erlaubt es uns, den Geist zu beruhigen und in den gegenwärtigen Moment einzutreten, wo Lebendigkeit am stärksten erfahrbar ist.',
  NULL,
  3,
  id
FROM public.module_contents
WHERE module_id = 'l-theory'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    media_url = EXCLUDED.media_url,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- L-Module Inhalte: Ressourcen-Finder Übungsmodul
INSERT INTO public.module_contents (module_id, content_type, title, description, content, order_index)
VALUES (
  'l-resource-finder',
  'exercise',
  'Ressourcen-Finder',
  'Entdecken Sie Ihre natürlichen Energie- und Ressourcenquellen',
  jsonb_build_object(
    'description', 'Diese Übung hilft Ihnen, Ihre natürlichen Energiequellen und Ressourcen zu identifizieren und zu aktivieren.',
    'duration', 20,
    'materials_needed', jsonb_build_array('Stift und Papier oder Journal', 'Ein ruhiger, ungestörter Ort', 'Optional: Farbstifte oder Marker')
  ),
  3
)
ON CONFLICT (id) DO UPDATE
SET content_type = EXCLUDED.content_type,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- Übungsschritte für Ressourcen-Finder
INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Einführung', 
  'In dieser Übung werden Sie Ihre natürlichen Energiequellen und Ressourcen identifizieren und aktivieren. 

Wir alle haben Momente erlebt, in denen wir uns besonders lebendig und energiegeladen fühlen. Diese Momente sind wertvolle Hinweise auf unsere natürlichen Ressourcenquellen.

Nehmen Sie sich etwa 20 Minuten ungestörte Zeit für diese Übung. Bereiten Sie ein Notizbuch oder Blätter vor, um Ihre Erkenntnisse festzuhalten.',
  'reflection',
  jsonb_build_object(
    'next_button_text', 'Beginnen'
  ),
  1,
  id
FROM public.module_contents
WHERE module_id = 'l-resource-finder'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Momentaufnahmen der Lebendigkeit', 
  'Denken Sie an die letzte Woche zurück. 

Welche Momente fallen Ihnen ein, in denen Sie sich besonders lebendig gefühlt haben? Dies können kleine Augenblicke oder längere Phasen gewesen sein.

Notieren Sie mindestens 3-5 solcher Momente. Beschreiben Sie für jeden Moment:
- Was haben Sie getan?
- Wo waren Sie?
- Mit wem waren Sie zusammen?
- Wie haben Sie sich gefühlt?
- Was hat diesen Moment besonders gemacht?',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Notieren Sie Ihre Lebendigkeits-Momente',
    'min_length', 50,
    'next_button_text', 'Weiter'
  ),
  2,
  id
FROM public.module_contents
WHERE module_id = 'l-resource-finder'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Lebendige Erinnerungen', 
  'Denken Sie nun weiter zurück. Welche Momente in Ihrem Leben fallen Ihnen ein, in denen Sie sich besonders in Ihrem Element gefühlt haben?

Diese Momente können aus jeder Lebensphase stammen - Kindheit, Jugend oder Erwachsenenalter.

Notieren Sie mindestens 3-5 solcher Erinnerungen. Beschreiben Sie wieder für jede Erinnerung:
- Was haben Sie getan?
- Wo waren Sie?
- Mit wem waren Sie zusammen?
- Wie haben Sie sich gefühlt?
- Was hat diesen Moment besonders gemacht?',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Beschreiben Sie Ihre lebendigen Erinnerungen',
    'min_length', 50,
    'next_button_text', 'Weiter'
  ),
  3,
  id
FROM public.module_contents
WHERE module_id = 'l-resource-finder'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Identifikation von Ressourcenquellen', 
  'Betrachten Sie nun alle Momente und Erinnerungen, die Sie notiert haben.

Welche gemeinsamen Elemente können Sie identifizieren? Markieren oder unterstreichen Sie wiederkehrende Aspekte wie:
- Bestimmte Tätigkeiten oder Aktivitäten
- Umgebungen oder Orte
- Menschen oder Beziehungsqualitäten
- Körperliche Zustände oder Bewegungen
- Mentale oder emotionale Zustände

Fassen Sie diese gemeinsamen Elemente zu Kategorien zusammen. Dies sind Ihre persönlichen Ressourcenquellen.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Notieren Sie Ihre identifizierten Ressourcenquellen',
    'min_length', 30,
    'next_button_text', 'Weiter'
  ),
  4,
  id
FROM public.module_contents
WHERE module_id = 'l-resource-finder'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Top-5-Ressourcenquellen', 
  'Wählen Sie aus Ihren identifizierten Ressourcenquellen die fünf wichtigsten aus.

Für jede dieser Top-5-Ressourcenquellen, beantworten Sie folgende Fragen:

1. Wie oft haben Sie aktuell Zugang zu dieser Ressource? (Auf einer Skala von 1-10)
2. Wie könnten Sie mehr Zugang zu dieser Ressource schaffen?
3. Was hält Sie möglicherweise davon ab, diese Ressource öfter zu nutzen?
4. Welche kleine, konkrete Veränderung könnten Sie in der kommenden Woche umsetzen, um mehr Zugang zu dieser Ressource zu haben?',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Beschreiben Sie Ihre Top-5-Ressourcenquellen und beantworten Sie die Fragen',
    'min_length', 100,
    'next_button_text', 'Weiter'
  ),
  5,
  id
FROM public.module_contents
WHERE module_id = 'l-resource-finder'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- Rest der Ressourcen-Finder-Übungsschritte
INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Integrationsplanung', 
  'Erstellen Sie nun einen konkreten Plan, wie Sie in der kommenden Woche mehr Zugang zu Ihren Ressourcenquellen schaffen können.

Wählen Sie mindestens zwei Ihrer Top-5-Ressourcen aus und planen Sie spezifisch:
- Was genau werden Sie tun?
- Wann werden Sie es tun? (Tag und Uhrzeit)
- Wie lange wird es dauern?
- Was könnten Hindernisse sein, und wie werden Sie damit umgehen?
- Wie werden Sie sich an die Umsetzung erinnern?

Je konkreter Ihr Plan ist, desto wahrscheinlicher werden Sie ihn umsetzen.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Notieren Sie Ihren Integrationsplan',
    'min_length', 50,
    'next_button_text', 'Weiter'
  ),
  6,
  id
FROM public.module_contents
WHERE module_id = 'l-resource-finder'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Reflexion und Abschluss', 
  'Nehmen Sie sich einen Moment Zeit, um über die Erkenntnisse dieser Übung zu reflektieren:

- Was haben Sie über Ihre Ressourcenquellen gelernt?
- Gibt es Überraschungen oder Muster, die Sie entdeckt haben?
- Inwiefern unterscheiden sich Ihre Ressourcenquellen von dem, was Sie im Alltag priorisieren?
- Wie würde sich Ihr Leben verändern, wenn Sie regelmäßiger Zugang zu Ihren Ressourcenquellen hätten?

Abschließend: Formulieren Sie eine konkrete Absicht, wie Sie Ihre natürliche Lebendigkeit in den kommenden Tagen stärker in Ihren Alltag integrieren werden.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Teilen Sie Ihre Reflexionen und Ihre Absicht',
    'min_length', 50,
    'next_button_text', 'Abschließen'
  ),
  7,
  id
FROM public.module_contents
WHERE module_id = 'l-resource-finder'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- Weitere Übungsmodule für den L-Schritt werden hier hinzugefügt
-- ...

-- Unterstützende Fragen für den L-Schritt einfügen
INSERT INTO klare_content.supporting_questions (step_id, question_text, sort_order)
VALUES
  ('L', 'Welche Situationen oder Aktivitäten bringen mich am stärksten in Kontakt mit meiner natürlichen Lebendigkeit?', 4),
  ('L', 'Was sind meine häufigsten Energieblocker, und wie könnte ich sie transformieren?', 5),
  ('L', 'Wie fühlt sich Lebendigkeit in meinem Körper an, und wie kann ich dieses Gefühl bewusst aktivieren?', 6),
  ('L', 'Welche Verbindung besteht zwischen meiner Lebendigkeit und meiner Kongruenz?', 7),
  ('L', 'Wie kann ich mehr Lebendigkeits-Momente in meinen Alltag integrieren?', 8)
ON CONFLICT DO NOTHING;
